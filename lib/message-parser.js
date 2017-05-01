'use strict';

const C = require('./constants');
const Request = require('./message/request');
const Response = require('./message/response');
const Push = require('./message/push');
const RRWError = require('./rrw-error');

module.exports = {
  parse,
};

/**
 *
 * @param buffer
 * @returns {*}
 */
function parse(buffer) {
  const proto = buffer.slice(0, C.PROTO.length);

  if (Buffer.compare(C.PROTO, proto) !== 0) {
    throw new RRWError.INVALID_PROTO();
  }

  const flag = buffer.readIntBE(C.PROTO.length, 1);

  if ((flag & C.TYPE_REQUEST) > 0) {
    return Request.fromBuffer(buffer);
  }

  if ((flag & C.TYPE_RESPONSE) > 0) {
    return Response.fromBuffer(buffer);
  }

  if ((flag & C.TYPE_PUSH) > 0) {
    return Push.fromBuffer(buffer);
  }
}
