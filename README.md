# homebridge-opple
[![npm version](https://badge.fury.io/js/homebridge-opple.svg)](https://badge.fury.io/js/homebridge-opple)

Opple 吸顶灯 HomeBridge 插件。

## 支持的设备
所有支持手机APP控制的opple吸顶灯。
例如：
![demo](https://img.alicdn.com/imgextra/i2/138006397/TB2mgp_XSOI.eBjSspmXXatOVXa_!!138006397.jpg)
![demo2](https://img.alicdn.com/imgextra/i3/138006397/TB2etN_XHOJ.eBjy1XaXXbNupXa_!!138006397.jpg)

## 安装步骤
1. 安装 [HomeBridge](https://github.com/nfarina/homebridge/)，安装完成后在iOS设备的home应用中应能看到HomeBridge。
2. 安装本插件。
3. 修改配置，增加相关配置项。

## 安装方法：
```
npm install -g homebridge-opple
```

## 配置项
```json
"platforms": [{
    "platform": "opple",
    "enableAll": false,
    "devices": {
        "xx:xx:xx:xx:xx:xx": {
            "name": "Bedroom Light",
            "address": "xxx.xxx.xxx.xxx"
        },
        "xx:xx:xx:xx:xx:xy": {
            "name": "Living Light",
            "disabled": true
        }
    }
}]
```

配置项含义：
* enableAll: （可选）默认为false，当置为true时搜索局域网中所有**通电**的opple灯，包含未在devices中列出的设备。
* devices: （可选）定义设备相关信息
  * "xx:xx:xx:xx:xx:xx"：灯的mac地址
  * name：（可选）灯的显示名称
  * address：（可选）指定灯的ip，若不填写此项，需保证启动homebridge时灯处于通电状态，否则该灯将不会出现在设备列表中。
  * disabled：（可选）默认false，当置为true时该灯将不会出现在设备列表中。

