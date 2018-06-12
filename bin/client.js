#!/usr/bin/env node
var smartglass = require('../');

if(process.argv.length <= 2)
{
    console.log('xbox-smartglass-core-node client v0.1.0');
    console.log('Arguments:');
    console.log('- discovery');
} else {
    console.log('xbox-smartglass-core-node client v0.1.0');
    var command = process.argv[2]
    if(command == 'discovery')
    {
        console.log('Do discovery');
    }
}

// process.argv.forEach(function (val, index, array) {
//   console.log(index + ': ' + val);
// });
