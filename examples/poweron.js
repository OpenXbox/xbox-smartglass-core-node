#!/usr/bin/env node
var Smartglass = require('../src/smartglass');

var sgClient = Smartglass()
sgClient.powerOn({
    live_id: 'FD000000000000',
    tries: 5,
    ip: '192.168.2.5'
}, function(result){
    if(result)
        console.log('Device booted successfully');
    else
        console.log('Failed to boot device');
});
