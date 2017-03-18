'use strict';

const C = require('./../constants');

const HEADER_LENGTH = C.PROTO.length + 1;

/**
 *
 * @type {Push}
 */
module.exports = class Push {
  /**
   *
   * @param data
   */
  constructor(data) {
    this.data = data;
  }

  /**
   *
   * @returns {Buffer}
   */
  toBuffer() {
    return Buffer.concat([
      C.PROTO,
      Buffer.from([C.TYPE_PUSH]),
      this.data,
    ]);
  }

  /**
   *
   * @param buffer
   * @returns {Push}
   */
  static fromBuffer(buffer) {
    const data = buffer.slice(HEADER_LENGTH);
    
    return new Push(data);
  }
};
