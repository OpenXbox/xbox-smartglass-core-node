#!/usr/bin/env node
var Smartglass = require('../src/smartglass');

Smartglass.discovery({
    ip: '192.168.2.5'
}, function(device, address){
    console.log('- Device found: ' + device.name);
    console.log('  Address: '+ address.address + ':' + address.port);
});
