#!/usr/bin/env node
var Smartglass = require('../src/smartglass');

Smartglass().powerOn({
    live_id: 'FD0021B76E34BD1F',
    tries: 5,
    ip: '192.168.2.5'
}).then(function(response){
    console.log('Console booted:', response)
}, function(error){
    console.log('Booting console failed:', error)
});
