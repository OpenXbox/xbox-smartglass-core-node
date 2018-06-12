const dgram = require('dgram');
const client = dgram.createSocket('udp4');
//var buffer = require('buffer');

const ADDR_BROADCAST = '255.255.255.0';

module.exports = {
    _consoles: [],

    discovery: function(addr = ADDR_BROADCAST)
    {
        client.on('message',function(msg,info){
            console.log('Data received from server : ' + msg.toString());
            console.log('Received %d bytes from %s:%d\n',msg.length, info.address, info.port);
        });

        var message = Buffer.from('yess');
        client.send(message, 5050, addr, (err) => {
            console.log('Error: '+err);
            client.close();
        });

        return this._consoles;
    }
}
