'use strict';

const C = require('./constants');
const Request = require('./message/request');
const Response = require('./message/response');
const Push = require('./message/push');

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

  if (Buffer.compare(C.PROTO, proto)) {
    throw new Error(`Invalid proto ${proto.toString('hex')}`);
  }

  const flag = buffer.readIntBE(C.PROTO.length, 1);

  if (flag & C.TYPE_REQUEST) {
    return Request.fromBuffer(buffer);
  }

  if (flag & C.TYPE_RESPONSE) {
    return Response.fromBuffer(buffer);
  }

  if (flag & C.TYPE_PUSH) {
    return Push.fromBuffer(buffer);
  }
}
