class OppleLightAccessory {
  constructor(platform, device, config = {}) {
    this.name = config.name || device.name;
    this.device = device;
    this.platform = platform;
  }

  getServices() {
    const { Service, Characteristic } = this.platform;

    const lightbulbService = new Service.Lightbulb(this.name);

    lightbulbService
      .getCharacteristic(Characteristic.On)
      .on('get', callback => this.device.getPower().then(value => callback(null, value), callback))
      .on('set', (value, callback) => this.device.setPower(value).then(value => callback(), callback));

    lightbulbService
      .getCharacteristic(Characteristic.Brightness)
      .on('get', callback => this.device.getBrightness().then(value => callback(null, value), callback))
      .on('set', (value, callback) => this.device.setBrightness(value).then(value => callback(), callback));

    lightbulbService
      .getCharacteristic(Characteristic.ColorTemperature)
      .setProps({
        minValue: this.device.ctMin,
        maxValue: this.device.ctMax
      })
      .on('get', callback => this.device.getColorTemperature().then(value => callback(null, value), callback))
      .on('set', (value, callback) => this.device.setColorTemperature(value).then(value => callback(), callback));


    const informationService = new Service.AccessoryInformation();

    informationService
      .setCharacteristic(Characteristic.Manufacturer, this.device.manufacturer)
      .setCharacteristic(Characteristic.Model, this.device.model)
      .setCharacteristic(Characteristic.SerialNumber, this.device.localAddress);

    if (this.device.isInit) {
      informationService.setCharacteristic(Characteristic.FirmwareRevision, this.device.version.toString().split('').join('.'));
    }

    return [informationService, lightbulbService];
  }
}

module.exports = OppleLightAccessory;