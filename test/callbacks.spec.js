'use strict';

const chai = require('chai');
const RequestResponseWrapper = require('./..');
const RRWError = require('./../lib/rrw-error');

chai.should();

describe('callbacks', function () {
  it('should receive a response', async function () {
    const rrw1 = new RequestResponseWrapper();
    const rrw2 = new RequestResponseWrapper();

    rrw2.onRequest = async (data) => new Buffer(data.toString() + 1);

    rrw1.send = async (buffer) => rrw2.receive(buffer);
    rrw2.send = async (buffer) => rrw1.receive(buffer);

    await rrw1.request(new Buffer('poipoi'), { timeout: 10000 })
      .then((response) => response.toString().should.equals('poipoi1'));
  });

  it('should get a timeout', async function () {
    const rrw1 = new RequestResponseWrapper();
    const rrw2 = new RequestResponseWrapper();

    rrw2.onRequest = async (data) => {
      await new Promise((cb) => setTimeout(cb, 100));
    };

    rrw1.send = async (buffer) => rrw2.receive(buffer);
    rrw2.send = async (buffer) => rrw1.receive(buffer);
    
    const e = await rrw1.request(new Buffer('poipoi'), { timeout: 0 })
      .catch((e) => e);

    e.should.be.instanceOf(RRWError);
    e.errno.should.equals(RRWError.REQUEST_TIMEOUT.errno());
  });

  it('should get a timeout', async function () {
    const rrw1 = new RequestResponseWrapper();
    const rrw2 = new RequestResponseWrapper();

    rrw2.onRequest = async () => {
      throw new Error('12');
    };

    rrw1.send = async (buffer) => rrw2.receive(buffer);
    rrw2.send = async (buffer) => rrw1.receive(buffer);

    const e = await rrw1.request(new Buffer('poipoi'), { timeout: 10 })
      .catch((e) => e.toString());

    e.should.match(/Error: 12/);
  });

});
