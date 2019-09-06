#!/usr/bin/env node
var Smartglass = require('../src/smartglass');

var deviceStatus = {
    current_app: false,
    connection_status: false,
    clients: []
}

var client1 = Smartglass()
var client2 = Smartglass()

client1.connect('192.168.2.5').then(function(){
    console.log('Xbox succesfully connected!');
});

setTimeout(function(){
    client2.connect('192.168.2.5').then(function(){
        console.log('Xbox succesfully connected!');
    });
}.bind(deviceStatus), 10000)

// deviceStatus.clients[0].on('_on_console_status', function(message, xbox, remote, smartglass){
//     deviceStatus.connection_status = true
//
//     if(message.packet_decoded.protected_payload.apps[0] != undefined){
//         if(deviceStatus.current_app != message.packet_decoded.protected_payload.apps[0].aum_id){
//             deviceStatus.current_app = message.packet_decoded.protected_payload.apps[0].aum_id
//             console.log('Current active app:', deviceStatus)
//         }
//     }
// }.bind(deviceStatus));

// deviceStatus.clients[0].on('_on_timeout', function(message, xbox, remote, smartglass){
//     deviceStatus.connection_status = false
//     console.log('Connection timed out.')
//     clearInterval(interval)
//
//     deviceStatus.client = Smartglass()
//     deviceStatus.client.connect({
//         ip: '192.168.2.5'
//     }, function(result){
//         if(result === true){
//             console.log('Xbox succesfully connected!');
//         } else {
//             console.log('Failed to connect to xbox:', result);
//         }
//     });
// }.bind(deviceStatus, interval));

var interval = setInterval(function(){
    console.log('connection_status:')
    console.log('- 1:', client1._connection_status)
    console.log('- 2:', client2._connection_status)
}.bind(deviceStatus), 5000)
