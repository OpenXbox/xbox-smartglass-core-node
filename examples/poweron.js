#!/usr/bin/env node
var Smartglass = require('../src/smartglass');

Smartglass().powerOn({
    live_id: 'FD000000000000',
    tries: 5,
    ip: '192.168.2.5'
}).then(function(response){
    console.log(response)
}, function(error){
    console.log(error)
});
