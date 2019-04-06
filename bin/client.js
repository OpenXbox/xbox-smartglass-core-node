#!/usr/bin/env node
var Smartglass = require('../src/smartglass');
var commander = require('commander');
var assert = require('assert');
var pkgInfo = require('../package.json');

const ADDR_BROADCAST = '255.255.255.255';

console.log('Xbox-Smartglass v'+pkgInfo['version']+' ('+pkgInfo['homepage']+')');

commander
  .usage('[-b -d -s] -i <ip_address> -l <live_device_id> [-t <tries>]')
  .option('-b, --boot', 'Boot Xbox console')
  .option('-d, --discover', 'Discover Xbox on the network')
  .option('-c, --connect', 'Connect to Xbox console')
  .option('-s, --shutdown', 'Shutdown Xbox console')
  .option('-i, --ip <ip>', 'Xbox One IP address', ADDR_BROADCAST)
  .option('-l, --live_id <live_id>', 'Xbox One live id (Example: FD000000000000)')
  .option('-t, --tries <tries>', 'Timeout inn seconds (Default: 4)', 4)
  .version(pkgInfo['version'])
  .parse(process.argv);

if(process.argv.length <= 2)
    commander.help();

if(commander.boot == true)
{
    if(commander.live_id == undefined)
        console.error('--live_id parameter required');
    else {
        console.log('Trying to boot device...');
        Smartglass.power_on({
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
    Smartglass.discovery({
        ip: commander.ip
    }, function(device, address){
        console.log('- Device found: ' + device.name);
        console.log('  Address: '+ address.address + ':' + address.port);
        // console.log('LiveID: ' + device.device_certificate.subject.commonName);
        // console.log('Certificate valid: ' + device.device_certificate.notBefore + ' - ' + device.device_certificate.notAfter);
        // console.log('Certificate fingerprint: ' + device.device_certificate.fingerPrint);
    });

} else if(commander.connect)
{
    console.log('Trying to connect to device...');

    Smartglass.connect({
        ip: commander.ip,
        liveid: commander.live_id
    }, function(result){
        console.log('- Device found: ' + result);
    });

} else if(commander.shutdown)
{
    console.log('Trying to connect to device...');

    Smartglass.shutdown({
        ip: commander.ip,
        liveid: commander.live_id
    }, function(result){
        console.log('- Device found: ' + result);
    });
}
