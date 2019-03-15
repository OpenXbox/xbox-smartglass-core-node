const dgram = require('dgram');
const SimplePacket = require('./simplepacket');
const MessagePacket = require('./packet/message');
const Xbox = require('./xbox');

module.exports = {
    _consoles: [],
    _client: false,

    _on_discovery_response: [],
    _on_connect_response: [],

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

    shutdown: function(options, callback)
    {
        // Connect to console
        this.connect(options);

        this._on_connect_response.push(function(response, device, smartglass){
            var xbox = this._consoles[device.address];
            console.log('[smartglass] - Sending shutdown: ', xbox._connection_status)
        }.bind(this));
    },

    connect: function(options, callback)
    {
        var client = this._init_client();
        var message = SimplePacket.discovery();

        this._on_discovery_response.push(function(response, device, smartglass){
            var xbox = Xbox(device.address, response.payload.device_certificate_raw);
            //xbox.set_liveid(response.payload.device_certificate.subject.commonName);
            xbox.set_iv(response.payload.iv);

            this._connect(device.address, device.port, xbox);
            this._consoles[device.address] = xbox;
        }.bind(this));

        this._on_connect_response.push(function(response, device, smartglass){

            var xbox = this._consoles[device.address];

            if(xbox._connection_status == true)
            {
                console.log('Console is already connected. Ignore connect response packet..');
                return;
            }

            var protectedPacket = xbox.readPayload(response.payload.protected_payload, response.payload.iv);

            //console.log('protectedPacket', protectedPacket);
            var connectionResult = protectedPacket.readUInt16();
            var pairingState = protectedPacket.readUInt16();
            var participantId = protectedPacket.readUInt32();
            xbox._participantid = participantId;

            // console.log('connectionResult', connectionResult);
            // console.log('pairingState', pairingState);
            // console.log('participantId', participantId);

            if(connectionResult == '0')
            {
                // Console connected! Set xbox to connected
                console.log('Xbox succesfully connected!');
                xbox._connection_status = true;
            } else {
                // Cound not connect..
                console.log('Could not connect to xbox. ('+connectionResult+')');
                if(connectionResult == 0x02){
                    console.log('Reason: Unknown Error')
                } else if(connectionResult == 0x03){
                    console.log('Reason: Anonymous Connection Disabled')
                } else if(connectionResult == 0x04){
                    console.log('Reason: Device Limit Exceeded')
                } else if(connectionResult == 0x05){
                    console.log('Reason: SmartGlass disabled on console')
                } else if(connectionResult == 0x06){
                    console.log('Reason: User Auth failed')
                } else if(connectionResult == 0x07){
                    console.log('Reason: User SignIn failed')
                } else if(connectionResult == 0x08){
                    console.log('Reason: User SignIn timeout')
                } else if(connectionResult == 0x09){
                    console.log('Reason: User SignIn required')
                } else {
                    console.log('Reason: Client error')
                }
            }

            //console.log('protectedPacket ', protectedPacket)

        }.bind(this));

        this._send({
            ip: options.ip,
            port: 5050
        }, message);
    },

    getConsoles: function()
    {
        return this._consoles;
    },

    /* Private functions */
    _connect: function(address, port, xbox)
    {
        // this._on_connect_response.push(function(xbox, response, device, smartglass){
        //     console.log('GOT CONNECT RESPONSE');
        //
        //     xbox.set_iv(response.payload.iv);
        //     this._consoles[address] = xbox;
        //
        //     var protectedPacket = xbox.readPayload(response.payload.protected_payload, response.payload.iv);
        //     console.log('protectedPacket', protectedPacket);
        //     var connectionResult = protectedPacket.readUInt32();
        //     var pairingState = protectedPacket.readUInt32();
        //     var participantId = protectedPacket.readUInt32();
        //
        //     console.log('connectionResult', connectionResult);
        //     console.log('pairingState', pairingState);
        //     console.log('participantId', participantId);
        //
        //     console.log('Connected consoles: ', this._consoles);
        //
        // }.bind(this, xbox));

        message = xbox.connect_request();
        // console.log(xbox);

        this._send({
            'ip': address,
            'port': port
        }, message);
    },

    _receive: function(message, remote, client)
    {
        var response = SimplePacket.unpack(message);
        var type = message.slice(0,2).toString('hex');
        console.log('  _receive() called: ', type);

        if(type != 'd00d')
        {
            // Discovery Response

            if(response == false)
            {
                console.log('Warning: UNKNOWN PACKET RECEIVED');
            } else {
                var func = '_on_' + response.type.toLowerCase();
                console.log('Trigger: '+func);
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
            console.log('Process encrypted packet');
            console.log(message);
            var messagePacket = new MessagePacket(this._consoles[remote.address]);

            var data = messagePacket.unpack(message);

            if(data.flags.type == 'ConsoleStatus')
            {
                // This is a Console status packet. Let set the status
                // var status = messagePacket.decodePayload(data.flags.type, data.decrypted_payload, iv);

                //console.log('[smartglass] - data:', data);
                console.log('[smartglass] - Console Status:', data.decrypted_payload);
            }
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
