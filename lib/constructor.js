'use strict';

const C = require('./constants');
const Request = require('./request');
const Response = require('./response');
const Push = require('./push');

module.exports = function (buffer) {
  if (Buffer.compare(C.PROTO, buffer.slice(0, C.PROTO.length))) {
    throw new Error('Invalid proto');
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
