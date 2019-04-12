const dgram = require('dgram');
const Packer = require('./packet/packer');
const Xbox = require('./xbox');

module.exports = {
    _consoles: [],
    _client: false,
    _last_received_time: false,

    _on_discovery_response: [],
    _on_connect_response: [],

    _on_console_status: [],
    _on_local_join: [],
    _on_acknowledge: [],

    discovery: function(options, callback)
    {
        var client = this._init_client();

        var discovery_packet = Packer('simple.discovery_request')
        var message  = discovery_packet.pack()

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

        var poweron_packet = Packer('simple.poweron')
        poweron_packet.set('liveid', options.live_id)
        var message  = poweron_packet.pack()

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
                // @TODO: Check if console is booted and return true when success
                callback(true);
                client._close_client();
            }
        }
        setTimeout(sendBoot, 1000, this, callback);
    },

    shutdown: function(options, callback)
    {
        // Connect to console
        this.connect(options, callback);

        this._on_connect_response.push(function(response, device, smartglass){
            var xbox = this._consoles[device.address];

            xbox.get_requestnum()
            var poweroff = Packer('message.power_off');
            poweroff.set('liveid', xbox._liveid)
            var message = poweroff.pack(xbox);

            this._send({
                ip: device.address,
                port: 5050
            }, message);

        }.bind(this));
    },

    connect: function(options, callback)
    {
        var client = this._init_client();

        var discovery_request = Packer('simple.discovery_request');
        var message = discovery_request.pack();

        var timeout = setTimeout(function(){
            console.log('Connection timout of 10 sec.. Closing client.')
            this._close_client()
        }.bind(this), 10000);

        this._on_discovery_response.push(function(response, device, smartglass){
            var xbox = Xbox(device.address, response.packet_decoded.certificate);

            this._connect(device.address, device.port, xbox);
            this._consoles[device.address] = xbox;
        }.bind(this));

        this._on_connect_response.push(function(callback, timeout, response, remote){
            var xbox = this._consoles[remote.address];
            //xbox.set_iv(response.packet_decoded.iv);

            if(xbox._connection_status == true)
                return;

            var connectionResult = response.packet_decoded.protected_payload.connect_result;
            var pairingState = response.packet_decoded.protected_payload.pairing_state;
            var participantId = response.packet_decoded.protected_payload.participant_id;

            xbox.set_participantid(participantId);

            if(connectionResult == '0')
            {
                // Console connected! Set xbox to connected
                xbox._connection_status = true;
                clearTimeout(timeout)
                callback(true)

                var local_join = Packer('message.local_join');
                var message = local_join.pack(xbox);

                this._send({
                    ip: remote.address,
                    port: 5050
                }, message);

                setInterval(function(){
                    if((Math.floor(Date.now() / 1000))-this._last_received_time > 30)
                    {
                        console.log('No message for the last 30 seconds. Timeout...')
                        this._init_client()
                        return;
                    }

                    var ack = Packer('message.acknowledge')
                    ack.set('low_watermark', xbox._request_num)
                    var ack_message = ack.pack(xbox)

                    //console.log('send ack')
                    this._send({
                        ip: remote.address,
                        port: 5050
                    }, ack_message);

                }.bind(this, xbox, remote), 15000)


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
                clearTimeout(timeout)
                callback(false)
            }
        }.bind(this, callback, timeout));

        // this._on_console_status.push(function(response, device, smartglass){
        //     console.log('[smartglass.js:connect] Console info:', response.packet_decoded.protected_payload)
        // }.bind(this));

        this._on_local_join.push(function(response, device, smartglass){
            // console.log('[smartglass.js:connect] Got local_join:', response.packet_decoded.protected_payload)
        }.bind(this));

        this._on_acknowledge.push(function(response, device, smartglass){
            // console.log('[smartglass.js:connect] Got acknowledge:', response.packet_decoded.protected_payload)
        }.bind(this));

        this._send({
            ip: options.ip,
            port: 5050
        }, message);

        return this;
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
        this._last_received_time = Math.floor(Date.now() / 1000)
        var message = Packer(message);
        // console.log('message', message)
        var response = message.unpack(this._consoles[remote.address]);

        // console.log('[smartglass:_receive] Got response: ', response);
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

                try {
                    this._send({
                        ip: remote.address,
                        port: 5050
                    }, ack_message);
                }
                catch(error) {
                    this._init_client()
                }

            }

            var func = '_on_' + message.structure.packet_decoded.name.toLowerCase();
        }

        //console.log('[smartglass.js:_receive] '+func+' called');
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

        //if(this._client.fd != null){
            this._client.send(message, 0, message.length, options.port, options.ip, function(err, bytes) {
                 //console.log('Sending packet to', options.ip);
            });

        //}
    },

    _init_client: function()
    {
        //this._close_client()

        this._on_discovery_response = [];
        this._on_connect_response = [],
        this._on_console_status = [],
        this._on_local_join = [],
        this._on_acknowledge = [],

        this._client = dgram.createSocket('udp4');
        this._client.bind();
        // this._client.on("listening", function () {
        //     //this._client_info = this._client.address();
        // });

        this._client.on('message', function(message, remote){
            this._receive(message, remote, this);
        }.bind(this));

        this._client.on('close', function() {
            console.log('Client UDP socket closed : BYE!')
        });

        return this._client;
    },

    _close_client: function()
    {
        if(this._client)
            this._client.close();
    }
}
