const crc = require('crc');
const { MESSAGE_OFFSET } = require('./const');


class Message {
  setCheckSum() {
    const checksum = crc.crc16xmodem(this.data.slice(0x64));
    this.data.writeUInt32BE(checksum, MESSAGE_OFFSET.CHECK_SUM);
  }

  encrypt() {
    if (this.body.length === 0 || !this.device) {
      return;
    }

    const password = Buffer.allocUnsafe(20);
    const mac = this.device.mac.split(':');

    for (let i=0; i<password.length; i++) {
      password.writeUInt8(parseInt(mac[i % mac.length], 16), i);
    }

    this.body.forEach((v, i) => this.data.writeUInt8(v ^ password.readUInt8(i % password.length), i + MESSAGE_OFFSET.BODY));
  }

  decrypt() {
    this.encrypt();
  }

  getRequestSN() {
    return this.data.readInt32BE(MESSAGE_OFFSET.REQ_SERIAL_NUM);
  }

  getResponseSN() {
    return this.data.readInt32BE(MESSAGE_OFFSET.RES_SERIAL_NUM);
  }

  toBuffer() {
    return this.data;
  }
}

function dataToBuffer(data) {
  if (data instanceof Buffer) {
    return data;
  } else if (Array.isArray(data)) {
    return Buffer.from(data);
  } else if (typeof data === 'number') {
    let buf;
    if (data < 0x100) {
      buf = Buffer.allocUnsafe(1);
      buf.writeUInt8(data, 0);
    } else if (data < 0x10000) {
      buf = Buffer.allocUnsafe(2);
      buf.writeUInt16BE(data, 0);
    } else {
      buf = Buffer.allocUnsafe(4);
      buf.writeUInt32BE(data, 0);
    }
    return buf;
  } else {
    return Buffer.alloc(0);
  }
}

Message.build = function(messageType, body = null, device = null) {
  const message = new Message();

  message.body = dataToBuffer(body);
  message.device = device;
  message.messageType = messageType;
  message.data = Buffer.alloc(MESSAGE_OFFSET.BODY + message.body.length);
  message.sn = Math.floor(Math.random() * 1000 + 1);

  message.data.writeUInt32BE(0x3f2, MESSAGE_OFFSET.L2_TYPE);
  message.data.writeUInt32BE(0x2775, MESSAGE_OFFSET.L3_VERSION);
  message.data.writeUInt32BE(0x1, MESSAGE_OFFSET.L3_ID);
  message.data.writeUInt32BE(0x2, MESSAGE_OFFSET.OFFSET);
  message.data.writeUInt32BE(0x3, MESSAGE_OFFSET.TTL);
  message.data.writeUInt32BE(0x5, MESSAGE_OFFSET.L3_CHECKSUM);
  message.data.writeUInt32BE(0x1, MESSAGE_OFFSET.DEST_OBJ_TYPE);
  message.data.writeUInt32BE(0x6A68, MESSAGE_OFFSET.SRC_ID);

  if (message.device) {
    message.data.writeUInt32BE(message.device.localPort, MESSAGE_OFFSET.DEST_PORT);
    message.data.writeUInt32BE(message.device.id, MESSAGE_OFFSET.DEST_ID);
  }

  message.data.writeUInt32BE(message.sn, MESSAGE_OFFSET.REQ_SERIAL_NUM);
  message.data.writeUInt32BE(message.messageType, MESSAGE_OFFSET.MSG_TYPE);
  message.data.writeUInt32BE(message.body.length + 0x68, MESSAGE_OFFSET.PKG_LENGTH);
  message.data.writeUInt32BE(message.body.length + 0x18, MESSAGE_OFFSET.MSG_LENGTH);

  message.body.copy(message.data, MESSAGE_OFFSET.BODY);

  message.setCheckSum();
  message.encrypt();

  return message;
};

Message.from = function(data) {
  const message = new Message();

  message.data = data;
  message.body = data.slice(MESSAGE_OFFSET.BODY);

  message.decrypt();

  return message;
};

module.exports = Message;