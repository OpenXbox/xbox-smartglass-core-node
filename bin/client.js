#!/usr/bin/env node
var Smartglass = require('../src/smartglass');
var commander = require('commander');
var pkgInfo = require('../package.json');

const ADDR_BROADCAST = '255.255.255.255';

console.log('Xbox-Smartglass v'+pkgInfo['version']+' ('+pkgInfo['homepage']+')');

commander
  .usage('[-b -d -s] -i <ip_address> -l <live_device_id> [-t <tries>]')
  .option('-b, --boot', 'Boot Xbox console')
  .option('-d, --discover', 'Discover Xbox on the network')
  .option('-c, --connect', 'Connect to Xbox console')
  .option('-s, --shutdown', 'Shutdown Xbox console')
  .option('-i, --ip <ip>', 'Xbox One IP address')
  .option('-l, --live_id <live_id>', 'Xbox One live id (Example: FD000000000000)')
  .option('-t, --tries <tries>', 'Timeout inn seconds (Default: 5)', 5)
  .version(pkgInfo['version'])
  .parse(process.argv);

if(process.argv.length <= 2)
    commander.help();

var sgClient = Smartglass()

if(commander.boot == true)
{
    if(commander.live_id == undefined)
        console.error('--live_id parameter required');
    else {
        console.log('Trying to boot device...');
        sgClient.powerOn({
            live_id: commander.live_id,
            tries: commander.tries,
            ip: commander.ip
        }, function(result){
            if(result)
                console.log('Device booted successfully');
            else
                console.log('Failed to boot device');
        });
    }

} else if(commander.discover)
{
    console.log('Trying to discover devices...');
    sgClient.discovery({
        ip: commander.ip
    }, function(consoles){
        for(var xbox in consoles){
            console.log('- Device found: ' + consoles[xbox].message.name);
            console.log('  Address: '+ consoles[xbox].remote.address + ':' + consoles[xbox].remote.port);
        }
        if(consoles.length == 0){
            console.log('No consoles found on the network')
        }
    });

} else if(commander.connect)
{
    console.log('Trying to connect to device...');

    sgClient.connect({
        ip: commander.ip,
        liveid: commander.live_id
    }, function(result){
        console.log('Connected to Xbox');
    });

    var deviceStatus = {
        current_app: false,
        connection_status: false
    }

    sgClient.on('_on_console_status', function(message, xbox, remote, smartglass){
        deviceStatus.connection_status = true

        if(message.packet_decoded.protected_payload.apps[0] != undefined){
            if(deviceStatus.current_app != message.packet_decoded.protected_payload.apps[0].aum_id){
                deviceStatus.current_app = message.packet_decoded.protected_payload.apps[0].aum_id
                console.log('Current active apps:')
                for(var app in message.packet_decoded.protected_payload.apps)
                {
                    console.log('- aum:', message.packet_decoded.protected_payload.apps[app].aum_id)
                }
            }
        }
    }.bind(deviceStatus));

} else if(commander.shutdown)
{
    console.log('Trying to connect to device...');

    sgClient.powerOff({
        ip: commander.ip
    }, function(result){
        console.log('Turned off device');
    });
}
