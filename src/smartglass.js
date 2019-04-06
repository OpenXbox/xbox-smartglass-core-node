const dgram = require('dgram');
const SimplePacket = require('./simplepacket');
const MessagePacket = require('./packet/message');
const Packer = require('./packet/packer');
const Xbox = require('./xbox');

module.exports = {
    _consoles: [],
    _client: false,

    _on_discovery_response: [],
    _on_connect_response: [],

    _on_console_status: [],
    _on_local_join: [],
    _on_acknowledge: [],

    discovery: function(options, callback)
    {
        var client = this._init_client();
        var message = SimplePacket.discovery();

        this._on_discovery_response.push(function(response, device, smartglass){
            callback(response.packet_decoded, device, smartglass);
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
            console.log('[smartglass] - Sending shutdown:', xbox._connection_status)

            xbox.get_requestnum()
            var poweroff = Packer('message.power_off');
            poweroff.set('liveid', xbox._liveid)
            var message = poweroff.pack(xbox);
            console.log(message)

            this._send({
                ip: device.address,
                port: 5050
            }, message);

        }.bind(this));
    },

    connect: function(options, callback)
    {
        var client = this._init_client();
        // var message = SimplePacket.discovery();
        // console.log(message);

        var discovery_request = Packer('simple.discovery_request');
        var message = discovery_request.pack();

        this._on_discovery_response.push(function(response, device, smartglass){
            var xbox = Xbox(device.address, response.packet_decoded.certificate);
            //xbox.set_liveid(response.payload.device_certificate.subject.commonName);
            //xbox.set_iv(response.payload.iv);
            console.log('Attempt to connect..')
            this._connect(device.address, device.port, xbox);
            this._consoles[device.address] = xbox;
        }.bind(this));

        this._on_connect_response.push(function(response, device, smartglass){
            var xbox = this._consoles[device.address];
            //xbox.set_iv(response.packet_decoded.iv);

            if(xbox._connection_status == true)
            {
                console.log('Console is already connected. Ignore connect response packet..');
                return;
            }

            var connectionResult = response.packet_decoded.protected_payload.connect_result;
            var pairingState = response.packet_decoded.protected_payload.pairing_state;
            var participantId = response.packet_decoded.protected_payload.participant_id;

            xbox.set_participantid(participantId);

            if(connectionResult == '0')
            {
                // Console connected! Set xbox to connected
                console.log('Xbox succesfully connected! Sending join...');
                xbox._connection_status = true;

                var local_join = Packer('message.local_join');
                var message = local_join.pack(xbox);

                this._send({
                    ip: options.ip,
                    port: 5050
                }, message);

                setInterval(function(){
                    var ack = Packer('message.acknowledge')
                    ack.set('low_watermark', xbox._request_num)
                    var ack_message = ack.pack(xbox)

                    console.log('[smartglass.js:_receive] Sending heartbeat packet')

                    this._send({
                        ip: options.ip,
                        port: 5050
                    }, ack_message);
                }.bind(this, xbox, options), 15000)


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
        }.bind(this));

        this._on_console_status.push(function(response, device, smartglass){
            console.log('[smartglass.js:connect] Console info:', response.packet_decoded.protected_payload)
        }.bind(this));

        this._on_local_join.push(function(response, device, smartglass){
            console.log('[smartglass.js:connect] Got local_join:', response.packet_decoded.protected_payload)
        }.bind(this));

        this._on_acknowledge.push(function(response, device, smartglass){
            console.log('[smartglass.js:connect] Got acknowledge:', response.packet_decoded.protected_payload)
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
        var message = xbox.connect();

        this._send({
            'ip': address,
            'port': port
        }, message);
    },

    _receive: function(message, remote, client)
    {
        var message = Packer(message);
        var response = message.unpack(this._consoles[remote.address]);

        //console.log('[smartglass:_receive] Got response: ', response);
        var type = response.name;

        if(response.packet_decoded.type != 'd00d')
        {
            var func = '_on_' + type.toLowerCase();
        } else {
            if(response.packet_decoded.target_participant_id != this._consoles[remote.address]._participantid){
                console.log('[smartglass.js:_receive] Participantid does not match. Ignoring packet.')
                return;
            }

            // Lets see if we must ack..
            if(response.packet_decoded.flags.need_ack == true){

                var xbox = this._consoles[remote.address]
                xbox._request_num = response.packet_decoded.sequence_number

                var ack = Packer('message.acknowledge')
                ack.set('low_watermark', response.packet_decoded.sequence_number)
                ack.structure.structure.processed_list.value.push({id: response.packet_decoded.sequence_number})
                var ack_message = ack.pack(xbox)

                this._send({
                    ip: remote.address,
                    port: 5050
                }, ack_message);
            }

            var func = '_on_' + message.structure.packet_decoded.name.toLowerCase();
        }

        console.log('[smartglass.js:_receive] '+func+' called');
        if(this[func] != undefined)
        {
            for (trigger in this[func]){
                this[func][trigger](response, remote, client);
            }
        } else {
            console.log('Error: UNKNOWN CALLBACK: ' + func);
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
