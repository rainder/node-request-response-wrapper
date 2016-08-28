'use strict';

const C = require('./constants');

const HEADER_LENGTH = C.PROTO.length + 1;

module.exports = class Push {
  constructor(data) {
    this.data = data;
  }
  
  toBuffer() {
    return Buffer.concat([
      C.PROTO,
      Buffer.from([C.TYPE_PUSH]),
      this.data
    ]);
  }
  
  static fromBuffer(buffer) {
    const data = buffer.slice(HEADER_LENGTH);
    
    return new Push(data);
  }
};
