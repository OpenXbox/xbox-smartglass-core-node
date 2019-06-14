#!/usr/bin/env node
var Smartglass = require('../src/smartglass');

var sgClient = Smartglass()

sgClient.connect('192.168.2.5', function(result){
    if(result === true){
        console.log('Xbox succesfully connected!');

        setTimeout(function(){
            sgClient.powerOff(function(status){
                console.log('Shutdown succes!')
            })
        }.bind(sgClient), 1000)

    } else {
        console.log('Failed to connect to xbox:', result);
    }
});
