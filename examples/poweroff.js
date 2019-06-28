#!/usr/bin/env node
var Smartglass = require('../src/smartglass');

var sgClient = Smartglass()

sgClient.connect('192.168.2.5').then(function(){
    console.log('Xbox succesfully connected!');

    setTimeout(function(){
        sgClient.powerOff().then(function(status){
            console.log('Shutdown succes!')
        }, function(error){
            console.log('Shutdown error:', error)
        })
    }.bind(sgClient), 1000)
}, function(error){
    console.log(error)
});
