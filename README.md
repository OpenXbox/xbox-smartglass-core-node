# Xbox-Smartglass-Core-Node

[![GitHub Workflow - Build](https://github.com/OpenXbox/xbox-smartglass-core-node/workflows/.github/workflows/build.yml/badge.svg?branch=release/0.6.10)](https://github.com/OpenXbox/xbox-smartglass-core-node/actions)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=xbox-smartglass-core-node&metric=alert_status&branch=release/0.6.10)](https://sonarcloud.io/component_measures?id=xbox-smartglass-core-node&metric=alert_status)
[![Technical debt](https://sonarcloud.io/api/project_badges/measure?project=xbox-smartglass-core-node&metric=sqale_index&branch=release/0.6.10)](https://sonarcloud.io/component_measures?id=xbox-smartglass-core-node&metric=sqale_index)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=xbox-smartglass-core-node&metric=bugs&branch=release/0.6.10)](https://sonarcloud.io/component_measures?id=xbox-smartglass-core-node&metric=bugs)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=xbox-smartglass-core-node&metric=coverage&branch=release/0.6.10)](https://sonarcloud.io/component_measures?id=xbox-smartglass-core-node&metric=coverage)
[![Discord](https://img.shields.io/badge/discord-OpenXbox-blue.svg)](https://openxbox.org/discord)


NodeJS smartglass library for controlling a Xbox.

## Features

- Detect Xbox consoles on the network that are turned on
- Retrieve ip address, name and console id
- Simple controls like navigation and controller buttons
- Retrieve active application in realtime
- Send STB and AVR remote commands like channels and volume

## Dependencies

- NodeJS >= 12.x

## How to install

`npm install xbox-smartglass-core-node --save`

## Functions

    const Smartglass = require('xbox-smartglass-core-node')
    var SystemInputChannel = require('xbox-smartglass-core-node/src/channels/systeminput')
    var SystemMediaChannel = require('xbox-smartglass-core-node/src/channels/systemmedia')
    var TvRemoteChannel = require('xbox-smartglass-core-node/src/channels/tvremote')

    var sgClient =  Smartglass()
    sgClient.connect(ip).then(function(){
        sgClient.addManager('system_input', SystemInputChannel())
        sgClient.addManager('system_media', SystemMediaChannel())
        sgClient.addManager('tv_remote', TvRemoteChannel())
    }, function(error){
        console.log(error)
    })

    # Send DVR Record command

    sgClient.recordGameDvr().then(function(status){
        console.log('DVR record send')
    }).catch(function(error){
        console.log('DVR record error:', error)
    })

####  SystemInputChannel

    const Smartglass = require('xbox-smartglass-core-node')
    var SystemInputChannel = require('xbox-smartglass-core-node/src/channels/systeminput');

    var sgClient =  Smartglass()
    sgClient.addManager('system_input', SystemInputChannel())

    sgClient.getManager('system_input').sendCommand('nexus').then(function(button){ console.log(button) }, function(error){ console.log(error) });
    sgClient.getManager('system_input').sendCommand('left').then(function(button){ console.log(button) }, function(error){ console.log(error) });
    sgClient.getManager('system_input').sendCommand('a').then(function(button){ console.log(button) }, function(error){ console.log(error) });

####  SystemMediaChannel

    const Smartglass = require('xbox-smartglass-core-node')
    var SystemMediaChannel = require('xbox-smartglass-core-node/src/channels/systemmedia');

    var sgClient =  Smartglass()
    sgClient.addManager('system_media', SystemMediaChannel())

    sgClient.getManager('system_media').sendCommand('play').then(function(button){ console.log(button) }, function(error){ console.log(error) });
    sgClient.getManager('system_media').sendCommand('pause').then(function(button){ console.log(button) }, function(error){ console.log(error) });
    var media_state = sgClient.getManager('system_media').getState()


####  TvRemoteChannel

    const Smartglass = require('xbox-smartglass-core-node')
    var TvRemoteChannel = require('xbox-smartglass-core-node/src/channels/tvremote');

    var sgClient =  Smartglass()
    sgClient.addManager('tv_remote', TvRemoteChannel())

    sgClient.getManager('tv_remote').getConfiguration().then(function(configuration){ console.log(configuration) }, function(error){ console.log(error) });
    sgClient.getManager('tv_remote').getHeadendInfo().then(function(configuration){ console.log(configuration) }, function(error){ console.log(error) });
    sgClient.getManager('tv_remote').getLiveTVInfo().then(function(configuration){ console.log(configuration) }, function(error){ console.log(error) });
    sgClient.getManager('tv_remote').getTunerLineups().then(function(configuration){ console.log(configuration) }, function(error){ console.log(error) });
    sgClient.getManager('tv_remote').getAppChannelLineups().then(function(configuration){ console.log(configuration) }, function(error){ console.log(error) });

    sgClient.getManager('tv_remote').sendIrCommand('btn.vol_up').then(function(button){ console.log(button) }, function(error){ console.log(error) });
    sgClient.getManager('tv_remote').sendIrCommand('btn.vol_down').then(function(button){ console.log(button) }, function(error){ console.log(error) });

## How to use

See the [examples](examples) folder for examples

## Setting up the Xbox

The plugin needs to be allowed to connect to your Xbox. To allow this make sure you set the setting to allow anonymous connections in Settings -> Devices -> Connections.

## Known Issues

- When sending multiple commands at once the protocol can disconnect

## Changelog

See [changelog](CHANGELOG.md)
