# homebridge-opple
[![npm version](https://badge.fury.io/js/homebridge-opple.svg)](https://badge.fury.io/js/homebridge-opple)

Opple light plugins for HomeBridge.

## Supported Devices
All Opple Light that can be controlled with the phone's APP
![demo](https://img.alicdn.com/imgextra/i2/138006397/TB2mgp_XSOI.eBjSspmXXatOVXa_!!138006397.jpg)
![demo2](https://img.alicdn.com/imgextra/i3/138006397/TB2etN_XHOJ.eBjy1XaXXbNupXa_!!138006397.jpg)

## Installation
1. Install [HomeBridge](https://github.com/nfarina/homebridge/).
2. Make sure you can see HomeBridge in your iOS devices, if not, please go back to step 1.
3. Install this packages.
```
npm install -g homebridge-opple
```

## Configuration
```
"platforms": [{
    "platform": "opple",
    "enableAll": false,
    "devices": {
        "xx:xx:xx:xx:xx:xx": {
            "name": "Bedroom Light"
        },
        "xx:xx:xx:xx:xx:xy": {
            "name": "Living Light",
            "disabled": true
        }
    }
}]

