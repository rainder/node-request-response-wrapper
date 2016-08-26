'use strict';

const co = require('co');
const net = require('net');
const RequestResponseWrapper = require('./index');

const server = (function () {

  const server = net.createServer();
  server.listen(7878);

  const app = new class extends RequestResponseWrapper {
    onRequest(message, connection) {

      //send sample push from the server
      setTimeout(() => {
        this.push({ push_data: false }, connection);
      }, 1000);

      return new Promise((resolve, reject) => {
        if (methods[message.method]) {
          return resolve(methods[message.method](message.data));
        }

        reject(`unknown method specified: ${message.method}`);
      })
    }

    send(data, connection) {
      return new Promise((resolve, reject) => {
        connection.write(JSON.stringify(data) + '\n', (err) => err ? reject(err) : resolve());
      });
    }
  };

  server.on('connection', (connection) => {
    connection.on('data', (data) => {
      data.toString().trim().split('\n').forEach(data => {
        app.incomingMessage(JSON.parse(data), connection);
      })
    });
  });

  return app;
})();


const client = (function () {
  const connection = net.connect(7878);

  const app = new class extends RequestResponseWrapper {
    send(data) {
      return new Promise((resolve, reject) => {
        connection.write(JSON.stringify(data) + '\n', (err) => err ? reject(err) : resolve());
      })
    }

    onPush(data) {
      console.log('got push from the server', data);
    }
  };

  connection.on('data', (data) => {
    data.toString().trim().split('\n').forEach(data => {
      app.incomingMessage(JSON.parse(data), connection);
    })
  });

  return app;
})();

const methods = {
  'get-user': (data) => ({ name: 'John', age: data.age })
}

co(function *() {
  const r1 = yield client.request({
    method: 'get-user',
    data: { age: 27 }
  });

  console.log(r1);
  console.assert(r1.name === 'John');
  console.assert(r1.age === 27);

}).catch(e => console.error(e));

