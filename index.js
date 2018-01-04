const OppleLightAccessory = require('./OppleLightAccessory');
const OppleDevice = require("./OppleDevice");
const packageFile = require("./package.json");

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

    this.log.info("[OpplePlatform][INFO]********************************************************************");
    this.log.info("[OpplePlatform][INFO]          OpplePlatform v%s By Jedmeng", packageFile.version);
    this.log.info("[OpplePlatform][INFO] GitHub: https://github.com/jedmeng/homebridge-opple-light ");
    this.log.info("[OpplePlatform][INFO]********************************************************************");
    this.log.info("[OpplePlatform][INFO]start success...");

    this.api.on('didFinishLaunching', () => log("DidFinishLaunching"));
  }

  accessories(callback) {
    this.log("Fetching Opple lights...");

    OppleDevice.search().then(list => {
      const accessories = list.map(device => {
        const config = this.config.devices && this.config.devices[device.mac];
        if (!(this.config.enableAll || (config && !config.disabled))) {
          return;
        }

        if (device.model === 'Opple WIFI Light') {
          return new OppleLightAccessory(this, device, config);
        }
      }).filter(Boolean);

      callback(accessories);
    });
  }
}

module.exports = function(homebridge) {
  console.log("homebridge API version: " + homebridge.version);

  // Accessory must be created from PlatformAccessory Constructor
  Accessory = homebridge.platformAccessory;

  // Service and Characteristic are from hap-nodejs
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  UUIDGen = homebridge.hap.uuid;

  // For platform plugin to be considered as dynamic platform plugin,
  // registerPlatform(pluginName, platformName, constructor, dynamic), dynamic must be true
  homebridge.registerPlatform("homebridge-opple", "opple", OpplePlatform, true);
};