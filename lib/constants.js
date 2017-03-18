'use strict';

module.exports = {
  TYPE_REQUEST: 1,
  TYPE_RESPONSE: 2,
  TYPE_PUSH: 4,
  SUCCESS_TRUE: 8,
  SUCCESS_FALSE: 16,
  
  PROTO: new Buffer([0x34, 0xfb, 0x5e, 0x38]),
};
