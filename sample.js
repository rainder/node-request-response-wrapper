'use strict';

const co = require('co');
const net = require('net');
const RequestResponseWrapper = require('./index');

const server = (function () {

  const server = net.createServer();
  server.listen(7878);

  const app = new class extends RequestResponseWrapper {
    onRequest(message, connection) {
      message = JSON.parse(message);

      setTimeout(() => {
        this.push(new Buffer('hello'), null, connection);
      }, 1000);

      return new Promise((resolve, reject) => {
        if (methods[message.method]) {
          const result = methods[message.method](message.data);
          return resolve(new Buffer(JSON.stringify(result)));
        }

        reject(`unknown method specified: ${message.method}`);
      })
    }

    send(data, connection) {
      return new Promise((resolve, reject) => {
        connection.write(data, (err) => err ? reject(err) : resolve());
      });
    }
  };

  server.on('connection', (connection) => {
    connection.on('data', (data) => {
      app.incomingMessage(data, connection);
    });
  });

  return app;
})();


const client = (function () {
  const connection = net.connect(7878);

  const app = new class extends RequestResponseWrapper {
    send(data) {
      return new Promise((resolve, reject) => {
        connection.write(data, (err) => err ? reject(err) : resolve());
      })
    }

    onPush(data, connection) {
      console.log('got push from the server', data);
    }
  };

  connection.on('data', (data) => {
    app.incomingMessage(data, connection);
  });

  return app;
})();

const methods = {
  'get-user': (data) => ({ name: 'John', age: data.age })
}

co(function *() {
  const payload = new Buffer(JSON.stringify({
    method: 'get-user',
    data: { age: 27 }
  }));

  const r1 = yield client.request(payload, { timeout: 1000 });

  const jsonResponse = JSON.parse(r1);

  console.log('response', jsonResponse);
  console.assert(jsonResponse.name === 'John');
  console.assert(jsonResponse.age === 27);

}).catch(e => console.error(e));

