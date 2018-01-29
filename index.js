const OppleLightAccessory = require('./OppleLightAccessory');
const OppleDevice = require("./OppleDevice");
const packageFile = require("./package.json");

let Accessory, Service, Characteristic, UUIDGen;

const pluginName = 'homebridge-opple';
const platformName = 'opple';

class OpplePlatform {
  constructor(log, config, api) {
    this.log = log;
    this.api = api;
    this.config = config;

    this.Accessory = Accessory;
    this.Service = Service;
    this.Characteristic = Characteristic;
    this.UUIDGen = UUIDGen;

    this.accessories = [];

    this.log.info("[OpplePlatform][INFO]********************************************************************");
    this.log.info("[OpplePlatform][INFO]          OpplePlatform v%s By Jedmeng", packageFile.version);
    this.log.info("[OpplePlatform][INFO] GitHub: https://github.com/jedmeng/homebridge-opple-light ");
    this.log.info("[OpplePlatform][INFO]********************************************************************");
    this.log.info("[OpplePlatform][INFO]start success...");

    this.api.on('didFinishLaunching', () => log("DidFinishLaunching"));

    setInterval(this.search.bind(this), 1000 * 60 * 10);
    this.search();
    this.log("Fetching Opple lights...");
  }

  search() {
    const currentMacs = this.accessories.map(accessory => accessory.device.mac);

    OppleDevice.search().then(list => {
      const accessories = list.map(device => {
        const config = this.config.devices && this.config.devices[device.mac];
        if (!(this.config.enableAll || (config && !config.disabled))) {
          return;
        }

        if (currentMacs.includes(device.mac)) {
          return;
        }

        if (device.model === 'Opple WIFI Light') {
          return new OppleLightAccessory(this, device, config);
        }
      }).filter(Boolean);

      this.api.registerPlatformAccessories(pluginName, platformName, accessories);
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
  homebridge.registerPlatform(pluginName, platformName, OpplePlatform, true);
};