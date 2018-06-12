const dgram = require('dgram');
//var buffer = require('buffer');

const ADDR_BROADCAST = '255.255.255.0';

module.exports = {
    _consoles: [],

    discovery: function(addr = ADDR_BROADCAST, callback = null)
    {
        var client = dgram.createSocket('udp4');
        client.on('message',function(msg,info){
            console.log('Data received from server : ' + msg.toString());
            console.log('Received %d bytes from %s:%d\n',msg.length, info.address, info.port);

            if(callback !== null)
                callback(console);
        });

        var message = Buffer.from('yess');
        client.send(message, 5050, addr, (err) => {
            if(err != null)
                console.log('Error: '+err);

            client.close();
        });

        return this._consoles;
    },

    getConsoles: function()
    {
        return this._consoles;
    }
}
