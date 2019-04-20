const dgram = require('dgram');
const Packer = require('./packet/packer');
const Xbox = require('./xbox');
var Debug = require('debug')('smartglass:client')

module.exports = function()
{
    return {
        _consoles: [],
        _client: false,
        _last_received_time: false,
        _is_broadcast: false,
        _ip: false,
        _interval_timeout: false,

        _on_timeout: [],

        _on_discovery_response: [],
        _on_connect_response: [],

        _on_console_status: [],
        _on_acknowledge: [],

        discovery: function(options, callback)
        {
            if(options.ip == undefined){
                options.ip = '255.255.255.255'
                this._is_broadcast = true
            }

            this._init_client();

            Debug('Crafting discovery_request packet');
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

        powerOn: function(options, callback)
        {
            this._init_client();

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
                    client._close_client();
                    callback(true);
                }
            }
            setTimeout(sendBoot, 1000, this, callback);
        },

        powerOff: function(options, callback)
        {
            this.connect(options, function(){

                var xbox = this._consoles[options.ip];

                xbox.get_requestnum()
                var poweroff = Packer('message.power_off');
                poweroff.set('liveid', xbox._liveid)
                var message = poweroff.pack(xbox);

                this._send({
                    ip: options.ip,
                    port: 5050
                }, message);

                setTimeout(function(){
                    this._close_client()
                }.bind(this), 1000);


                callback(true)

            }.bind(this));
        },

        connect: function(options, callback)
        {
            this._init_client();
            this._on_discovery_response = [];
            this._on_connect_response = [];
            clearInterval(this._interval_timeout)
            this._ip = options.ip

            Debug('Crafting discovery_request packet');
            var discovery_request = Packer('simple.discovery_request');
            var message = discovery_request.pack();

            var timeout = setTimeout(function(){
                Debug('Connection failed after 10 sec. Call: _on_timeout()')
                for(var trigger in this._on_timeout){
                    this._on_timeout[trigger]();
                }

                //this._close_client()
            }.bind(this), 10000);

            this._on_discovery_response.push(function(response, device, smartglass){
                Debug('Xbox found on network');
                var xbox = Xbox(device.address, response.packet_decoded.certificate);
                var message = xbox.connect();

                this._send({
                    'ip': this._ip,
                    'port': device.port
                }, message);

                this._consoles[this._ip] = xbox;
            }.bind(this));

            this._on_connect_response.push(function(callback, timeout, response, remote){
                var xbox = this._consoles[remote.address];

                if(xbox._connection_status == true)
                    return;

                var connectionResult = response.packet_decoded.protected_payload.connect_result;
                var participantId = response.packet_decoded.protected_payload.participant_id;

                xbox.set_participantid(participantId);

                if(connectionResult == '0')
                {
                    xbox._connection_status = true;
                    clearTimeout(timeout)
                    callback(true)

                    var local_join = Packer('message.local_join');
                    var message = local_join.pack(xbox);

                    this._send({
                        ip: this._ip,
                        port: 5050
                    }, message);

                    this._interval_timeout = setInterval(function(){
                        if((Math.floor(Date.now() / 1000))-this._last_received_time > 30)
                        {
                            Debug('Connection timeout after 30 sec. Call: _on_timeout()')
                            for(var trigger in this._on_timeout){
                                this._on_timeout[trigger]();
                            }

                            //this._close_client()
                            return;
                        }

                        var ack = Packer('message.acknowledge')
                        ack.set('low_watermark', xbox._request_num)
                        var ack_message = ack.pack(xbox)

                        this._send({
                            ip: this._ip,
                            port: 5050
                        }, ack_message);

                    }.bind(this, xbox, remote), 15000)
                } else {

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

            this._on_acknowledge.push(function(response, device, smartglass){
                // console.log('[smartglass.js:connect] Got acknowledge:', response.packet_decoded.protected_payload)
            }.bind(this));

            this._send({
                ip: this._ip,
                port: 5050
            }, message);

            return this;
        },

        disconnect: function()
        {
            var xbox = this._consoles[this._ip];

            xbox.get_requestnum()

            var disconnect = Packer('message.disconnect')
            disconnect.set('reason', 4)
            disconnect.set('error_code', 0)
            var disconnect_message = disconnect.pack(xbox)

            this._send({
                ip: this._ip,
                port: 5050
            }, disconnect_message);

            this._close_client()
        },

        getConsoles: function()
        {
            return this._consoles;
        },

        _receive: function(message, remote, client)
        {
            this._last_received_time = Math.floor(Date.now() / 1000)
            message = Packer(message);
            var response = message.unpack(this._consoles[remote.address]);

            var type = response.name;
            var func = '';

            if(response.packet_decoded.type != 'd00d')
            {
                func = '_on_' + type.toLowerCase();
                Debug('Received message. Call: '+func+'()');
            } else {
                if(response.packet_decoded.target_participant_id != this._consoles[remote.address]._participantid){
                    console.log('[smartglass.js:_receive] Participantid does not match. Ignoring packet.')
                    return;
                }

                func = '_on_' + message.structure.packet_decoded.name.toLowerCase();
                Debug('Received message. Call: '+func+'()');

                if(response.packet_decoded.flags.need_ack == true){
                    Debug('Packet needs to be acknowledged. Sending response');
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
                        consolee.log('error', error)
                    }

                }
            }

            if(this[func] != undefined)
            {
                for(var trigger in this[func]){
                    this[func][trigger](response, remote, client);
                }
            } else {
                console.log('Error: UNKNOWN CALLBACK: ' + func);
            }
        },

        _send: function(options, message)
        {
            this._client.send(message, 0, message.length, options.port, options.ip, function(err, bytes) {
                 Debug('Sending packet to client: '+options.ip+':'+options.port);
            });
        },

        _init_client: function()
        {
            Debug('Initialize new smartglass client');

            this._client = dgram.createSocket('udp4');
            this._client.bind();

            this._client.on('listening', function(message, remote){
                if(this._is_broadcast == true)
                    this._client.setBroadcast(true);
            }.bind(this))

            this._client.on('message', function(message, remote){
                this._receive(message, remote, this);
            }.bind(this));

            this._client.on('close', function() {
                Debug('UDP socket closed.');
            });

            return this._client;
        },

        _close_client: function()
        {
            Debug('Client closed');

            clearInterval(this._interval_timeout)
            this._client.close();

            this._on_discovery_response = [];
            this._on_connect_response = [];
            this._on_console_status = [];
            this._on_acknowledge = [];
        }
    }
}
