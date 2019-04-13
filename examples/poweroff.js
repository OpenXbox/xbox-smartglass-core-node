#!/usr/bin/env node
var Smartglass = require('../src/smartglass');

var sgClient = Smartglass()
sgClient.powerOff({
    ip: '192.168.2.5'
}, function(result){
    if(result === true){
        console.log('Send poweroff command');
    } else {
        console.log('Failed to shutdown xbox:', result);
    }
});
