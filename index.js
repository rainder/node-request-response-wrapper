'use strict';

const objectid = require('objectid');
const Callbacks = require('skerla-callbacks');
const events = require('events');

module.exports = class RequestResponseWrapper extends events {
  /**
   *
   * @param send
   * @param onRequest
   */
  constructor() {
    super();
    
    this.callbacks = new Callbacks();
  }

  /**
   *
   * @param data
   * @param args
   * @returns {*}
   */
  request(data, ...args) {
    const payload = {
      id: objectid().toString(),
      type: 'request',
      data: data
    };

    return this
      .send(payload, ...args)
      .then(() => this.callbacks.create({
        id: payload.id
      }));
  }

  /**
   *
   * @param data
   * @param args
   * @returns {*}
   */
  push(data, ...args) {
    const payload = {
      type: 'push',
      data: data
    };

    return this.send(payload, ...args);
  }

  /**
   *
   * @param id
   * @param success
   * @param data
   * @param args
   * @returns {*}
   */
  response(id, success, data, ...args) {
    const payload = {
      id,
      type: 'response',
      success,
      data
    };

    return this.send(payload, ...args);
  }

  /**
   *
   * @param data
   * @param args
   * @returns {boolean}
   */
  incomingMessage(data, ...args) {
    if (data.type === 'request') {
      this.onRequest(data.data, ...args)
        .then((result) => this.response(data.id, true, result, ...args))
        .catch((err) => this.response(data.id, false, err, ...args))
        .catch((err) => console.error(err));
    }

    if (data.type === 'response') {
      if (data.success) {
        return this.callbacks.success(data.id, data.data);
      }

      return this.callbacks.fail(data.id, data.data);
    }

    if (data.type === 'push') {
      this.onPush(data.data, ...args);
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
