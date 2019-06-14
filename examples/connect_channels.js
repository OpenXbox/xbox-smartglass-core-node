#!/usr/bin/env node
var Smartglass = require('../src/smartglass');
var SystemInputChannel = require('../src/channels/systeminput');
var SystemMediaChannel = require('../src/channels/systemmedia');
var TvRemoteChannel = require('../src/channels/tvremote');

var deviceStatus = {
    current_app: false,
    connection_status: false,
    client: false
}

deviceStatus.client = Smartglass()

deviceStatus.client.connect('192.168.2.5', function(result){
    if(result === true){
        console.log('Xbox succesfully connected!');
        deviceStatus.client.addManager('system_input', SystemInputChannel())
        deviceStatus.client.addManager('system_media', SystemMediaChannel())
        deviceStatus.client.addManager('tv_remote', TvRemoteChannel())

        // deviceStatus.client.on('_on_console_status', function(message, xbox, remote){
        //     // console.log('CONSOLE STATE', message.packet_decoded.protected_payload)
        //     // console.log(message.packet_decoded.protected_payload)
        //     console.log(deviceStatus.client.getActiveApp())
        //     //deviceStatus.client.getManager('system_input').sendCommand('nexus');
        // });

        setTimeout(function(){
            console.log('Send nexus button')
            deviceStatus.client.getManager('system_input').sendCommand('nexus');

            setTimeout(function(){
                deviceStatus.client.getManager('system_input').sendCommand('down');
            }.bind(deviceStatus), 1000)

            setTimeout(function(){
                deviceStatus.client.getManager('tv_remote').sendIrCommand('btn.vol_up');
            }.bind(deviceStatus), 1500)

            setTimeout(function(){
                deviceStatus.client.getManager('system_input').sendCommand('up');
            }.bind(deviceStatus), 2000)

            setTimeout(function(){
                deviceStatus.client.getManager('system_input').sendCommand('left');
            }.bind(deviceStatus), 3000)

            setTimeout(function(){
                deviceStatus.client.getManager('tv_remote').sendIrCommand('btn.vol_down');
            }.bind(deviceStatus), 3500)

            setTimeout(function(){
                deviceStatus.client.getManager('system_input').sendCommand('right');
            }.bind(deviceStatus), 4000)

            setTimeout(function(){
                deviceStatus.client.getManager('system_media').sendCommand('pause');
            }.bind(deviceStatus), 500)

            setTimeout(function(){
                deviceStatus.client.getManager('system_input').sendCommand('nexus');

                console.log(deviceStatus.client.getActiveApp())
                console.log(deviceStatus.client.getManager('system_media').getState())
            }.bind(deviceStatus), 5000)

            setTimeout(function(){
                deviceStatus.client.getManager('system_media').sendCommand('play');
            }.bind(deviceStatus), 2500)

        }.bind(deviceStatus), 5000)
    } else {
        console.log('Failed to connect to xbox:', result);
    }
}.bind(deviceStatus));

deviceStatus.client.on('_on_timeout', function(message, xbox, remote, smartglass){
    deviceStatus.connection_status = false
    console.log('Connection timed out.')
    clearInterval(interval)

    deviceStatus.client = Smartglass()
    deviceStatus.client.connect('192.168.2.5', function(result){
        if(result === true){
            console.log('Xbox succesfully connected!');
        } else {
            console.log('Failed to connect to xbox:', result);
        }
    });
}.bind(deviceStatus, interval));

var interval = setInterval(function(){
    console.log('connection_status:', deviceStatus.client._connection_status)
}.bind(deviceStatus), 5000)
