'use strict';

const C = require('./../constants');

const HEADER_LENGTH = C.PROTO.length + 1;

module.exports = class Response {
  /**
   *
   * @param id
   * @param success
   * @param data
   */
  constructor(id, success, data) {
    if (data instanceof Error) {
      data = data.stack;
    }

    if (!(data instanceof Buffer)) {
      data = new Buffer(data);
    }

    this.id = id;
    this.success = success;
    this.data = data;
  }

  /**
   *
   * @returns {Buffer}
   */
  toBuffer() {
    const SUCCESS_BIT = this.success ? C.SUCCESS_TRUE : C.SUCCESS_FALSE;

    return Buffer.concat([
      C.PROTO,
      Buffer.from([C.TYPE_RESPONSE | SUCCESS_BIT]),
      this.id,
      this.data,
    ]);
  }

  /**
   *
   * @param buffer
   * @returns {Response}
   */
  static fromBuffer(buffer) {
    const id = buffer.slice(HEADER_LENGTH, HEADER_LENGTH + 12);
    const success = (buffer.readIntBE(C.PROTO.length, 1) & C.SUCCESS_TRUE) > 0;
    const data = buffer.slice(HEADER_LENGTH + 12);

    return new Response(id, success, data);
  }
};
