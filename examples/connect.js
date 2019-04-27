#!/usr/bin/env node
var Smartglass = require('../src/smartglass');

var deviceStatus = {
    current_app: false,
    connection_status: false,
    client: false
}

deviceStatus.client = Smartglass()

deviceStatus.client.connect({
    ip: '192.168.2.5'
}, function(result){
    if(result === true){
        console.log('Xbox succesfully connected!');
    } else {
        console.log('Failed to connect to xbox:', result);
    }
});

deviceStatus.client.on('_on_console_status', function(message, xbox, remote, smartglass){
    deviceStatus.connection_status = true

    if(message.packet_decoded.protected_payload.apps[0] != undefined){
        if(deviceStatus.current_app != message.packet_decoded.protected_payload.apps[0].aum_id){
            deviceStatus.current_app = message.packet_decoded.protected_payload.apps[0].aum_id
            console.log('Current active app:', deviceStatus)
        }
    }
}.bind(deviceStatus));

deviceStatus.client.on('_on_timeout', function(message, xbox, remote, smartglass){
    deviceStatus.connection_status = false
    console.log('Connection timed out.')
    clearInterval(interval)

    deviceStatus.client = Smartglass()
    deviceStatus.client.connect({
        ip: '192.168.2.5'
    }, function(result){
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
