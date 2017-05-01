'use strict';

module.exports = {
  TYPE_REQUEST: 0x1,
  TYPE_RESPONSE: 0x2,
  TYPE_PUSH: 0x4,
  SUCCESS_TRUE: 0x8,
  SUCCESS_FALSE: 0x10,
  
  PROTO: new Buffer([0x34, 0xFB, 0x5E, 0x38]),
};
