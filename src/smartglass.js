const dgram = require('dgram');
const SimplePacket = require('./simplepacket');

module.exports = {
    _consoles: [],
    _client: false,

    _on_discovery_response: [],

    discovery: function(options, callback)
    {
        var client = this._init_client();
        var message = SimplePacket.discovery();

        this._on_discovery_response.push(function(response, device, smartglass){
            callback(response.payload, device, smartglass);
        }.bind(callback));

        this._send({
            ip: options.ip,
            port: 5050
        }, message);

        setTimeout(function(client){
            client._close_client();
        }, 1000, this);
    },

    power_on: function(options, callback)
    {
        var client = this._init_client();
        var message = SimplePacket.power_on(options.live_id);

        var try_num = 0;

        var sendBoot = function(client, callback)
        {
            client._send({
                ip: options.ip,
                port: 5050
            }, message);

            try_num = try_num+1;
            if(try_num <= options.tries)
            {
                setTimeout(sendBoot, 500, client, callback);
            } else {
                // console.log('@TODO: Check if console is booted... return true');
                callback(true);
                client._close_client();
            }
        }
        setTimeout(sendBoot, 1000, this, callback);
    },

    getConsoles: function()
    {
        return this._consoles;
    },

    /* Private functions */
    _receive: function(message, remote, client)
    {
        var type = message.slice(0,2).toString('hex');
        if(type != 'd00d')
        {
            // Discovery Response
            var response = SimplePacket.unpack(message);
            if(response == false)
            {
                console.log('Warning: UNKNOWN PACKET RECEIVED');
            } else {
                var func = '_on_' + response.type.toLowerCase();
                if(this[func] != undefined)
                {
                    for (trigger in this[func]){
                        this[func][trigger](response, remote, client);
                    }
                } else {
                    console.log('Error: UNKNOWN CALLBACK: ' + func);
                }
            }
        } else {
            console.log('Encrypted packet not implemented yet');
        }
    },

    _send: function(options, message)
    {
        if(options.ip == undefined)
            console.log('smartglass._send: ip missing');

        if(options.port == undefined)
            console.log('smartglass._send: port missing');

        this._client.send(message, 0, message.length, options.port, options.ip, function(err, bytes) {
            // console.log('Sending packet...');
        });
    },

    _init_client: function()
    {
        this._on_discovery_response = [];

        this._client = dgram.createSocket('udp4');
        this._client.bind();
        // this._client.on("listening", function () {
        //     //this._client_info = this._client.address();
        // });

        this._client.on('message', function(message, remote){
            this._receive(message, remote, this);
        }.bind(this));

        return this._client;
    },

    _close_client: function()
    {
        this._client.close();
    }
}
