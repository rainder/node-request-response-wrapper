# Generic Request/Response Wrapper

Generic Request/Response wrapper

## Example

```js

const RequestResponseWrapper = require('@rainder/request-response-wrapper');

const wrapper = new class extends RequestResponseWrapper {

  //implement a custom logic of writing data to the socket connection
  send(data, connection) {
    return connection.write(data);
  }
  
  // process request and return response
  // .send(response) will be called on the same connection
  onRequest(data) {
    return Promise.resolve('response');
  }
  
  onPush(data) {
    processPush(data);
  }
}

socketServer.on('data', (data, connection) => {
  wrapper.receive(data, connection);
});

```

See sample.js for example

## API

### receive(data, ...args): Promise
### send(data, ...args): Promise

### request(data, ...args): Promise
### push(data, ...args): Promise

### onPush(data, ...args): void
### onRequest(data, ...args): void
