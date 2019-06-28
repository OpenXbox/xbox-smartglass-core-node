#!/usr/bin/env node
var Smartglass = require('../src/smartglass');

var deviceStatus = {
    current_app: false,
    connection_status: false,
    client: false
}

deviceStatus.client = Smartglass()

deviceStatus.client.connect('192.168.2.5').then(function(){
    console.log('Xbox succesfully connected!');
    deviceStatus.connection_status = true
}, function(error){
    console.log('Failed to connect to xbox:', error);
});

deviceStatus.client.on('_on_console_status', function(message, xbox, remote, smartglass){
    if(message.packet_decoded.protected_payload.apps[0] != undefined){
        if(deviceStatus.current_app != message.packet_decoded.protected_payload.apps[0].aum_id){
            deviceStatus.current_app = message.packet_decoded.protected_payload.apps[0].aum_id
            console.log('xbox: Current active app:', deviceStatus)
        }
    }
}.bind(deviceStatus));

deviceStatus.client.on('_on_timeout', function(message, xbox, remote, smartglass){
    deviceStatus.connection_status = false
    console.log('Connection timed out.')
    clearInterval(interval)

    deviceStatus.client = Smartglass()
    deviceStatus.client.connect('192.168.2.5').then(function(){
        console.log('Xbox succesfully connected!');
    }, function(error){
        console.log('Failed to connect to xbox:', result);
    });
}.bind(deviceStatus, interval));

var interval = setInterval(function(){
    console.log('connection_status:', deviceStatus.client._connection_status)
}.bind(deviceStatus), 5000)
