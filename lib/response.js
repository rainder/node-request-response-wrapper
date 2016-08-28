'use strict';

const C = require('./constants');

const HEADER_LENGTH = C.PROTO.length + 1;

module.exports = class Response {
  constructor(id, success, data) {
    this.id = id;
    this.success = success;
    this.data = data;
  }
  
  toBuffer() {
    return Buffer.concat([
      C.PROTO,
      Buffer.from([
        C.TYPE_RESPONSE | (this.success ? C.SUCCESS_TRUE : C.SUCCESS_FALSE)
      ]),
      this.id,
      this.data
    ]);
  }
  
  static fromBuffer(buffer) {
    const id = buffer.slice(HEADER_LENGTH, HEADER_LENGTH + 12);
    const success = (buffer.readIntBE(C.PROTO.length, 1) & C.SUCCESS_TRUE) > 0;
    const data = buffer.slice(HEADER_LENGTH + 12);

    return new Response(id, success, data);
  }
};
