'use strict';

const C = require('./../constants');

const HEADER_LENGTH = C.PROTO.length + 1;

module.exports = class Request {
  /**
   *
   * @param id
   * @param data
   */
  constructor(id, data) {
    this.id = id;
    this.data = data;
  }

  /**
   *
   * @returns {Buffer}
   */
  toBuffer() {
    return Buffer.concat([
      C.PROTO,
      new Buffer([C.TYPE_REQUEST]),
      this.id,
      this.data,
    ]);
  }

  /**
   *
   * @param buffer
   * @returns {Request}
   */
  static fromBuffer(buffer) {
    const id = buffer.slice(HEADER_LENGTH, HEADER_LENGTH + 12);
    const data = buffer.slice(HEADER_LENGTH + 12);
    
    return new Request(id, data);
  }
};
