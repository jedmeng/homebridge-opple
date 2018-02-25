const OppleLightAccessory = require('./OppleLightAccessory');
const OppleLightDevice = require('./OppleLightDevice');
const OppleDevice = require('./OppleDevice');
const packageFile = require('./package.json');

let Accessory, Service, Characteristic, UUIDGen;

class OpplePlatform {
  constructor(log, config, api) {
    this.log = log;
    this.api = api;
    this.config = config;

    this.Accessory = Accessory;
    this.Service = Service;
    this.Characteristic = Characteristic;
    this.UUIDGen = UUIDGen;

    this.log.info('[OpplePlatform][INFO]********************************************************************');
    this.log.info('[OpplePlatform][INFO]          OpplePlatform v%s By Jedmeng', packageFile.version);
    this.log.info('[OpplePlatform][INFO] GitHub: https://github.com/jedmeng/homebridge-opple-light ');
    this.log.info('[OpplePlatform][INFO]********************************************************************');
    this.log.info('[OpplePlatform][INFO]start success...');

    this.api.on('didFinishLaunching', () => log('DidFinishLaunching'));
  }

  accessories(callback) {
    this.log('Fetching Opple lights...');
    OppleDevice.search().then(list => {
      const deviceConfig = this.config.devices || {};

      // 配置中的mac地址统一转成小写
      Object.keys(deviceConfig)
        .filter(key => key !== key.toLowerCase())
        .forEach(key => {
          const newKey = key.toLowerCase();
          if (!deviceConfig[newKey]) {
            deviceConfig[newKey] = deviceConfig[key];
          }
          delete deviceConfig[key];
        });

      const dynamicDevices = list
        .filter(device => (this.config.enableAll || deviceConfig[device.mac]) && !deviceConfig[device.mac].disabled && device.mode == 'Opple WIFI Light')
        .map(device => new OppleLightAccessory(this, device, deviceConfig[device.mac]));

      const addedMac = dynamicDevices.map(accessory => accessory.device.mac);

      const staticDevices = Object.keys(deviceConfig)
        .filter(key => !addedMac.includes(key) && !deviceConfig[key].disabled && deviceConfig[key].address)
        .map(key => new OppleLightAccessory(this, new OppleLightDevice(deviceConfig[key]), deviceConfig[key]));

      callback([...staticDevices, ...dynamicDevices]);
    }, error => this.log(error));
  }
}

module.exports = function(homebridge) {
  console.log('homebridge API version: ' + homebridge.version);

  // Accessory must be created from PlatformAccessory Constructor
  Accessory = homebridge.platformAccessory;

  // Service and Characteristic are from hap-nodejs
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  UUIDGen = homebridge.hap.uuid;
  
  homebridge.registerPlatform('homebridge-opple', 'opple', OpplePlatform, false);
};