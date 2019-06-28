#!/usr/bin/env node
var Smartglass = require('../src/smartglass');

var deviceStatus = {
    current_app: false,
    connection_status: false
}

var sgClient = Smartglass()
sgClient.connect('192.168.2.5').then(function(){
    console.log('Xbox succesfully connected!');
}, function(error){
    console.log('Failed to connect to xbox:', error);
});

sgClient.on('_on_console_status', function(message, xbox, remote, smartglass){
    deviceStatus.connection_status = true

    if(message.packet_decoded.protected_payload.apps[0] != undefined){
        if(deviceStatus.current_app != message.packet_decoded.protected_payload.apps[0].aum_id){
            deviceStatus.current_app = message.packet_decoded.protected_payload.apps[0].aum_id
            console.log('Current active app:', deviceStatus)
        }
    }
}.bind(deviceStatus));

sgClient.on('_on_console_status', function(message, xbox, remote, smartglass){
    deviceStatus.connection_status = false
    console.log('Sending disconnect to console...')
    smartglass.disconnect()
}.bind(deviceStatus));
