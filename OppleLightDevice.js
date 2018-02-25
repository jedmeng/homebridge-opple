const OppleDevice = require('./OppleDevice');
const { MESSAGE_TYPE, QUERY_RES_OFFSET } = require('./const');

/**
 * Opple wifi 吸顶灯
 */
class OppleLightDevice extends OppleDevice {
  init(data) {
    super.init(data);

    this.model = 'Opple WIFI Light';

    this.ctMin = 154;
    this.ctMax = 370;

    this.state = {
      powerOn: false,
      brightness: 0,
      colorTemperature: 0
    };

    this.initState();
    this.updateTime = 0;
  }

  initState(retry = 3) {
    return this.sendMessage(MESSAGE_TYPE.QUERY, null, true)
      .then(message => {
        message.device = this;
        message.decrypt();

        this.state.powerOn = !!message.body.readUInt8(QUERY_RES_OFFSET.POWER_ON);
        this.state.brightness = message.body.readUInt8(QUERY_RES_OFFSET.BRIGHT);
        this.state.colorTemperature = message.body.readUInt16BE(QUERY_RES_OFFSET.COLOR_TEMP);

        this.updateTime = Date.now();
      }, e => {
        if (retry > 0) {
          console.error(e);
          return this.initState(retry - 1);
        } else {
          throw new Error('connect failed');
        }
      });
  }

  keepUpdate(force = false) {
    if (!this.isInit) {
      return this.asyncInit().then(() => this.initState());
    } else if (!force && Date.now() - this.updateTime < 1000 * 10) {
      return Promise.resolve();
    } else {
      return this.initState();
    }
  }

  setStateAndCheck(callback, retry = 3) {
    return new Promise((resolve, reject) => {
      callback(result => (typeof result === 'function' ? result() : result) ? resolve() : reject())
    }).catch(e => {
      return retry > 0 ? this.setStateAndCheck(callback, retry - 1) : e;
    });
  }

  /**
   * 获取开关状态
   * @returns {Promise.<boolean>}
   */
  getPower() {
    return this.keepUpdate()
      .then(() => this.state.powerOn);
  }

  /**
   * 设置开关状态
   * @param value boolean
   * @returns {Promise.<boolean>}
   */
  setPower(value) {
    if (typeof value !== 'boolean') {
      throw new Error('Invalid power value');
    }

    const newValue = value ? 1 : 0;

    return this.setStateAndCheck(check => {
      this.sendMessage(MESSAGE_TYPE.POWER_ON, newValue)
        .then(() => this.keepUpdate(true))
        .then(() => check(this.state.powerOn === value));
    }).then(value);
  }

  /**
   * 获取亮度数值
   * @returns {Promise.<int>}
   */
  getBrightness() {
    // 亮度原始值范围为10-255
    return this.keepUpdate()
      .then(() => Math.round((this.state.brightness - 10) / 245 * 100));
  }

  /**
   * 设置亮度数值
   * @param value int 取值范围0-100
   * @returns {Promise.<int>}
   */
  setBrightness(value) {
    if (value !== parseInt(value) || value < 0 || value > 100) {
      throw new Error('Invalid brightness value');
    }

    const newValue = Math.round(value / 100 * 245 + 10);

    return this.setStateAndCheck(check => {
      this.sendMessage(MESSAGE_TYPE.BRIGHT, newValue)
        .then(() => this.keepUpdate(true))
        .then(() => check(this.state.brightness === newValue));
    }).then(value);
  }

  /**
   * 获取色温
   * @returns {Promise.<int>}
   */
  getColorTemperature() {
    // reciprocal megakelvin
    // 色温原始值范围为2700-6500
    return this.keepUpdate()
      .then(() => Math.round(1e6 / this.state.colorTemperature));
  }

  /**
   * 设置色温
   * @param value int
   * @returns {Promise.<int>}
   */
  setColorTemperature(value) {
    if (value !== parseInt(value) || value < this.ctMin || value > this.ctMax) {
      throw new Error('Invalid color temperature value');
    }

    const newValue = Math.round(1e6 / value);

    return this.setStateAndCheck(check => {
      this.sendMessage(MESSAGE_TYPE.COLOR_TEMPERATURE, newValue)
        .then(() => this.keepUpdate(true))
        .then(() => check(this.state.colorTemperature === newValue));
    }).then(value);
  }
}

module.exports = OppleLightDevice;