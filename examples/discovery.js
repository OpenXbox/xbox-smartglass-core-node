#!/usr/bin/env node
var Smartglass = require('../src/smartglass');

var sgClient = Smartglass()
sgClient.discovery({
    //ip: '192.168.2.5'
}, function(consoles){
    for(var xbox in consoles){
        console.log('- Device found: ' + consoles[xbox].message.name);
        console.log('  Address: '+ consoles[xbox].remote.address + ':' + consoles[xbox].remote.port);
    }
    if(consoles.length == 0){
        console.log('No consoles found on the network')
    }
});
