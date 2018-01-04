const dgram = require('dgram');
const Message = require('./Message');


const server = {
  onInit(cb) {
    const promise = this.promise || this.start();
    return cb ? promise.then(cb) : promise;
  },

  start() {
    this.promise = new Promise(resolve => {
      const socket = dgram.createSocket('udp4');
      socket.bind(0, () => resolve(socket));
    });
    
    this.promise.then(socket => {
      socket.setBroadcast(true);
      const address = socket.address();

      this.port = address.port;
      this.address = address.address;
    });
    
    return this.promise;
  },

  getPort() {
    return this.port;
  },

  getAddress() {
    return this.address;
  },

  onMessage(id, cb, timeout) {
    if (typeof id === 'function') {
      timeout = cb;
      cb = id;
      id = undefined;
    }

    this.onInit(socket => {
      const removeListener = () => socket.removeListener('message', handler);

      const handler = function(res) {
        const message = Message.from(res);
        if (id && id !== message.getResponseSN()) {
          return;
        }
        cb(message, removeListener);
      };

      if (timeout) {
        setTimeout(removeListener, timeout);
      }

      socket.on('message', handler);
    });
  },

  send(message, port, address) {
    if (message instanceof Message) {
      message = message.toBuffer();
    }

    return this.onInit(socket => socket.send(message, port, address));
  },

  sendAndReceive(message, port, address) {
    return this.send(message, port, address)
      .then(() => new Promise((resolve, reject) => {
        const timeout = 10000;

        this.onMessage(message.sn, (inMessage, cancel) => {
          cancel();
          resolve(inMessage);
        }, timeout);

        setTimeout(() => reject('connect timeout'), timeout);
      }))
  },

  sendBroadcast(message, port) {
    return this.send(message, port, '255.255.255.255');
  }
};

server.start();

module.exports = server;