#!/usr/bin/env node
var Smartglass = require('../src/smartglass');
var SystemInputChannel = require('../src/channels/systeminput');
var SystemMediaChannel = require('../src/channels/systemmedia');

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
        deviceStatus.client.addManager('system_input', SystemInputChannel())
        // deviceStatus.client.addManager('system_media', SystemMediaChannel())

        setTimeout(function(){
            console.log('Send nexus button')
            deviceStatus.client.getManager('system_input').sendCommand('a');

            // setTimeout(function(){
            //     deviceStatus.client.getManager('system_input').sendCommand('b');
            // }.bind(deviceStatus), 1000)
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
