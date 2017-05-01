'use strict';

const net = require('net');
const RequestResponseWrapper = require('./');

const server = (function () {

  const server = net.createServer();
  server.listen(7878);

  const methods = {
    'get-user': (data) => ({ name: 'John', age: 27 })
  };

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

        reject(new Buffer(`unknown method specified: ${message.method}`));
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
      app.receive(data, connection);
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
      console.log('got push from the server', data.toString('utf8'));
    }
  };

  connection.on('data', (data) => {
    app.receive(data, connection);
  });

  return app;
})();
(function () {
  const payload = new Buffer(JSON.stringify({
    method: 'get-user'
  }));

  client.request(payload, { timeout: 1000 })
    .then(response => {
      const jsonResponse = JSON.parse(response);

      console.log('response', jsonResponse);
      console.assert(jsonResponse.name === 'John');
      console.assert(jsonResponse.age === 27);
    })
    .catch(e => console.error(e));

})();

