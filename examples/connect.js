#!/usr/bin/env node
var Smartglass = require('../src/smartglass');

var deviceStatus = {
    current_app: false,
    connection_status: false,
    client: false
}

deviceStatus.client = Smartglass()

deviceStatus.client.connect({
    ip: '192.168.2.52'
}, function(result){
    if(result === true){
        console.log('Xbox succesfully connected!');
    } else {
        console.log('Failed to connect to xbox:', result);
    }
});

deviceStatus.client._on_console_status.push(function(response, device, smartglass){
    deviceStatus.connection_status = true

    if(response.packet_decoded.protected_payload.apps[0] != undefined){
        if(deviceStatus.current_app != response.packet_decoded.protected_payload.apps[0].aum_id){
            deviceStatus.current_app = response.packet_decoded.protected_payload.apps[0].aum_id
            console.log('Current active app:', deviceStatus)
        }
    }
}.bind(deviceStatus));

deviceStatus.client._on_timeout.push(function(){
    deviceStatus.connection_status = false
    console.log('Connection timed out. Retry...')

    deviceStatus.client.connect({
        ip: '192.168.2.5'
    }, function(result){
        if(result === true){
            console.log('Xbox succesfully connected!');
        } else {
            console.log('Failed to connect to xbox:', result);
        }
    });
}.bind(deviceStatus));

setInterval(function(){
    console.log('connection_status:', deviceStatus.connection_status)
}.bind(deviceStatus), 5000)
