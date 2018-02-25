const iconv = require('iconv-lite');

const Message = require('./Message');
const server = require('./server');
const { MESSAGE_TYPE, SEARCH_RES_OFFSET, BROADCAST_PORT } = require('./const');

class OppleDevice {
  constructor(config = {}) {
    this.localAddress = config.address;
    this.manufacturer = 'OPPLE';
    this.model = 'Opple Device';
  }

  init(message) {
    this.id = message.body.readUInt32BE(SEARCH_RES_OFFSET.ID_LOW);
    this.port = message.body.readUInt16BE(SEARCH_RES_OFFSET.PORT);

    this.ip = (new Array(4)).fill(0)
      .map((_, i) => message.body.readUInt8(SEARCH_RES_OFFSET.IP + i))
      .join('.');

    this.mac = (new Array(6)).fill(0)
      .map((_, i) => message.body.readUInt8(SEARCH_RES_OFFSET.MAC + i))
      .map(n => n.toString(16).padStart(2, 0))
      .join(':');

    this.version = message.body.readUInt32BE(SEARCH_RES_OFFSET.VERSION);
    this.name = iconv.decode(message.body.slice(SEARCH_RES_OFFSET.NAME, SEARCH_RES_OFFSET.NAME + 0xE), 'GBK');

    this.localAddress = server.getAddress();
    this.localPort = server.getPort();

    this.isInit = true;
  }

  asyncInit() {
    if (!this.localAddress) {
      throw new Error();
    }

    const message = Message.build(MESSAGE_TYPE.SEARCH);

    return server.sendAndReceive(message, BROADCAST_PORT, this.localAddress)
      .then(inMessage => this.init(inMessage));
  }

  sendMessage(messageType, data, reply = false) {
    const message = Message.build(messageType, data, this);

    return reply ?
      server.sendAndReceive(message, this.port, this.ip) :
      server.send(message, this.port, this.ip);
  }
}

OppleDevice.search = function() {
  const message = Message.build(MESSAGE_TYPE.SEARCH);
  const deviceList = [];
  const OppleLightDevice = require('./OppleLightDevice');
  const timeout = 2000;

  server.onMessage(inMessage => {
    let device;

    if (inMessage.body.readUInt32BE(SEARCH_RES_OFFSET.CLASS_SKU) === 0x100010E) {
      device = new OppleLightDevice();
    } else {
      return;
    }

    device.init(inMessage);
    deviceList.push(device);
  }, timeout);

  server.sendBroadcast(message, BROADCAST_PORT);

  return new Promise(resolve => setTimeout(resolve, timeout))
    .then(() => deviceList);
};

module.exports = OppleDevice;