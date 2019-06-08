# Xbox-Smartglass-Core-Node
[![Build Status](https://travis-ci.org/OpenXbox/xbox-smartglass-core-node.svg?branch=release/0.5.0)](https://travis-ci.org/OpenXbox/xbox-smartglass-core-node)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=xbox-smartglass-core-node&metric=alert_status&branch=release/0.5.0)](https://sonarcloud.io/component_measures?id=xbox-smartglass-core-node&metric=alert_status)
[![Technical debt](https://sonarcloud.io/api/project_badges/measure?project=xbox-smartglass-core-node&metric=sqale_index&branch=release/0.5.0)](https://sonarcloud.io/component_measures?id=xbox-smartglass-core-node&metric=sqale_index)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=xbox-smartglass-core-node&metric=bugs&branch=release/0.5.0)](https://sonarcloud.io/component_measures?id=xbox-smartglass-core-node&metric=bugs)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=xbox-smartglass-core-node&metric=coverage&branch=release/0.5.0)](https://sonarcloud.io/component_measures?id=xbox-smartglass-core-node&metric=coverage)
[![Discord](https://img.shields.io/badge/discord-OpenXbox-blue.svg)](https://openxbox.org/discord)


NodeJS smartglass library for controlling a Xbox

## Dependencies

- NPM
- Python 2
- `pip install cryptography`

## How to install

`npm install xbox-smartglass-core-node --save`

## Functions

    const Smartglass = require('xbox-smartglass-core-node')
    var sgClient =  Smartglass()

| Name | arguments | Comments |
|------|-----------|----------|
| .discovery(`callback(consoles)`, `ip`) | `(Required)` `callback`: Callback function with consoles returned as array <br>`(Optional)` `ip`: IP address of the xbox | Detects xbox consoles  on the network |
| .connect(`ip`, `callback()`) | `(Required)` `ip`: IP address of the xbox <br> `(Required)` `callback`: Callback function with the status returned | Connects to the xbox console |
| .getCurrentApp() | `none` | Returns the current active app |
| .isConnected() | `none` | Returns the current connection status as boolean |
| .powerOn(`options`, `callback(status)`) | `(Required)` `options`: {`ip`: '127.0.0.1', `liveid`: 'FD000000000'} <br> `(Required)` `callback`: Callback function with the status returned | Returns the current active app |
| .powerOff(`callback(status)`) | `(Required)` `callback`: Callback function with the status returned | Shutdown xbox (need to connect first) |


    const Smartglass = require('xbox-smartglass-core-node')
    var SystemInputChannel = require('xbox-smartglass-core-node/src/channels/systeminput');
    var SystemMediaChannel = require('xbox-smartglass-core-node/src/channels/systemmedia');
    var TvRemoteChannel = require('xbox-smartglass-core-node/src/channels/tvremote');

    var sgClient =  Smartglass()
    sgClient.addManager('system_input', SystemInputChannel(0))
    sgClient.addManager('system_media', SystemMediaChannel(1))
    sgClient.addManager('tv_remote', TvRemoteChannel(2))

####  SystemInputChannel

TBD

####  SystemMediaChannel

TBD

####  TvRemoteChannel

TBD

## How to use

See the [examples](examples) folder for examples

## Known Issues

- Broadcasting does not work properly yet.
- Callback when sending a power_on command always returns true for now.
- Protocol can be broken sometimes.

## Changelog

See [changelog](CHANGELOG.md)
