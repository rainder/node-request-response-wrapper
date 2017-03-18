'use strict';

/**
 *
 */
class RRWError {
  /**
   *
   * @param errno
   * @param message
   * @param description
   * @param info
   */
  constructor(errno, message, description, info) {
    this.type = 'RRWError';
    this.errno = errno;
    this.message = message;
    this.description = description;
    this.info = info;
  }

  /**
   *
   * @param errno
   * @param message
   * @returns {*}
   */
  static create(errno, message) {
    return class extends RRWError {
      /**
       *
       * @param description
       * @param info
       */
      constructor(description, info) {
        super(errno, message, description, info);
      }

      /**
       *
       * @returns {*}
       */
      static errno() {
        return errno;
      }

      /**
       *
       * @returns {*}
       */
      static message() {
        return message;
      }
    }
  }
}

RRWError.REQUEST_TIMEOUT = RRWError.create(1, 'request timeout');
RRWError.SOCKET_CLOSED = RRWError.create(2, 'socket closed');

module.exports = RRWError;
