'use strict';

const bson = require('bson');
const Callbacks = require('@rainder/callbacks');
const events = require('events');
const messageParser = require('./message-parser');
const Request = require('./message/request');
const Response = require('./message/response');
const Push = require('./message/push');
const RRWError = require('./rrw-error');

module.exports = class RequestResponseWrapper extends events {
  /**
   *
   * @param send
   * @param onRequest
   */
  constructor() {
    super();

    this.callbacks = new Callbacks(RequestResponseWrapper.name);
  }

  /**
   *
   * @param data
   * @param args
   * @returns {*}
   */
  request(data, options = {}, ...args) {
    const id = new bson.ObjectId().id;
    const payload = new Request(id, data).toBuffer();
    const callback = this.callbacks.create(id.toString('hex'), {
      timeout: options.timeout,
      error_constructor: RRWError.REQUEST_TIMEOUT,
    });

    return this
      .send(payload, ...args)
      .then(() => callback, (err) => {
        this.callbacks.getCallback(id.toString('hex')).destroy();

        throw new RRWError.SOCKET_CLOSED(err.message);
      });
  }

  /**
   *
   * @param data
   * @param args
   * @returns {*}
   */
  push(data, options = {}, ...args) {
    const payload = new Push(data).toBuffer();

    return this.send(payload, ...args);
  }

  /**
   *
   * @param id {Buffer}
   * @param success
   * @param data
   * @param args
   * @returns {*}
   */
  response(id, success, data, ...args) {
    const payload = new Response(id, success, data).toBuffer();

    return this.send(payload, ...args);
  }

  /**
   *
   * @param buffer
   * @param args
   * @returns {boolean}
   */
  receive(buffer, ...args) {
    const message = messageParser.parse(buffer);

    if (message instanceof Request) {
      this.onRequest(message.data, ...args)
        .then((result) => this.response(message.id, true, result, ...args))
        .catch((err) => this.response(message.id, false, err, ...args))
        .catch((err) => null);
    }

    if (message instanceof Response) {
      const id = message.id.toString('hex');
      const callback = this.callbacks.getCallback(id);

      if (!callback) {
        const error = new Error(`Unknown response id: ${id}`);

        error.payload = {
          id: id,
          success: message.success,
          data: message.data.toString(),
        };

        throw error;
      }

      if (message.success) {
        callback.resolve(message.data);
      } else {
        callback.reject(message.data);
      }
    }

    if (message instanceof Push) {
      this.onPush(message.data, ...args);
    }
  }

  /**
   *
   */
  send() {
    throw new Error('not implemented');
  }

  /**
   *
   */
  onRequest() {
    throw new Error('not implemented');
  }

  /**
   *
   */
  onPush() {
    throw new Error('not implemented');
  }
};
