'use strict';

const bson = require('bson');
const Callbacks = require('@rainder/callbacks');
const events = require('events');
const constructor = require('./constructor');
const Request = require('./request');
const Response = require('./response');
const Push = require('./push');

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
    const id = bson.ObjectId().id;
    const payload = new Request(id, data).toBuffer();

    return this
      .send(payload, ...args)
      .then(() => this.callbacks.create(id.toString('hex'), options.timeout));
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
  incomingMessage(buffer, ...args) {
    const message = constructor(buffer);

    if (message instanceof Request) {
      this.onRequest(message.data, ...args)
        .then((result) => this.response(message.id, true, result, ...args))
        .catch((err) => this.response(message.id, false, err, ...args))
        .catch((err) => console.error('Error:', err));
    }

    if (message instanceof Response) {
      const id = message.id.toString('hex');
      const callback = this.callbacks.getCallback(id);
      if (!callback) {
        throw new Error(`Unknown response id: ${id}`);
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
}
