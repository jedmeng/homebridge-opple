exports.BROADCAST_PORT = 0xD6D9;

exports.MESSAGE_TYPE = {
  POWER_ON:           0x3110000,
  BRIGHT:             0x3130000,
  COLOR_TEMPERATURE:  0x31b0000,
  QUERY:              0x30f0000,
  SEARCH:             0x2010000,
};

exports.MESSAGE_OFFSET = {
  SRC_IP:         0x00,
  SRC_PORT:       0x04,
  DEST_IP:        0x08,
  DEST_PORT:      0x0C,
  L2_TYPE:        0x10,
  L3_VERSION:     0x14,
  SERVER_TYPE:    0x18,
  PKG_LENGTH:     0x1C,
  L3_ID:          0x20,
  OFFSET:         0x24,
  TTL:            0x28,
  PROP:           0x2C,
  L3_CHECKSUM:    0x30,
  SRC_ADD_TYPE:   0x34,
  SRC_OBJ_TYPE:   0x38,
  SRC_ID:         0x3C,
  SRC_ID_2:       0x40,
  SRC_ID_3:       0x44,
  SRC_ID_4:       0x48,
  DEST_ADD_TYPE:  0x4C,
  DEST_OBJ_TYPE:  0x50,
  DEST_ID:        0x54,
  DEST_ID_2:      0x58,
  DEST_ID_3:      0x5C,
  DEST_ID_4:      0x60,
  REQ_SERIAL_NUM: 0x64,
  RES_SERIAL_NUM: 0x68,
  MSG_LENGTH:     0x6C,
  CHECK_SUM:      0x70,
  MSG_TYPE:       0x74,
  RESERVE:        0x78,
  BODY :          0x7C
};

exports.SEARCH_RES_OFFSET = {
  CLASS_SKU:  0x03, // L: 0x4
  SRC_TYPE:   0x07, // L: 0x2
  MAC:        0x09, // L: 0x8
  OBJ_TYPE:   0x11, // L: 0x2
  ID_LOW:     0x13, // L: 0x4
  ID_HIGH:    0x17, // L: 0x4
  VERSION:    0x1B, // L: 0x4
  IP:         0x1F, // L: 0x4
  PORT:       0x23, // L: 0x2
  NAME:       0x25, // L: 0xe
  IS_CLEAN:   0x33, // L: 0x1
};

exports.QUERY_RES_OFFSET = {
  POWER_ON:   0x1, // L: 0x1
  BRIGHT:     0x2, // L: 0x1
  COLOR_TEMP: 0x7, // L: 0x2
};