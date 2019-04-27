const dgram = require('dgram');
const Packer = require('./packet/packer');
const Xbox = require('./xbox');
var Debug = require('debug')('smartglass:client')
const smartglassEvent = require('./events')

module.exports = function()
{
    return {
        _consoles: [],
        _socket: false,
        _events: smartglassEvent,

        _last_received_time: false,
        _is_broadcast: false,
        _ip: false,
        _interval_timeout: false,

        discovery: function(options, callback)
        {
            if(options.ip == undefined){
                options.ip = '255.255.255.255'
                this._is_broadcast = true
            }

            this._getSocket()

            Debug('Crafting discovery_request packet');
            var discovery_packet = Packer('simple.discovery_request')
            var message  = discovery_packet.pack()

            var consoles_found = []

            smartglassEvent.on('_on_discovery_response', function(message, xbox, remote){
                consoles_found.push({
                    message: message.packet_decoded,
                    remote: remote
                })
            });

            this._send({
                ip: options.ip,
                port: 5050
            }, message);

            this._interval_timeout = setTimeout(function(client){
                client._closeClient();
                callback(consoles_found);
            }, 1000, this);
        },

        powerOn: function(options, callback)
        {
            this._getSocket();

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
                    client._closeClient();

                    client.discovery(options, function(consoles){
                        client._closeClient();
                        if(consoles.length  >  0){
                            callback(true)
                        } else {
                            callback(false)
                        }
                    })
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
                    this.disconnect()
                }.bind(this), 1000);

                callback(true)

            }.bind(this));
        },

        connect: function(options, callback)
        {
            this._ip = options.ip

            this.discovery({
                ip: this._ip
            }, function(consoles){
                Debug('Console is online. Lets connect...')
                clearTimeout(this._interval_timeout)

                this._getSocket();

                var xbox = Xbox(consoles[0].remote.address, consoles[0].message.certificate);
                var message = xbox.connect();

                this._send({
                    'ip': consoles[0].remote.address,
                    'port': consoles[0].remote.port
                }, message);

                this._consoles[this._ip] = xbox;

                smartglassEvent.on('_on_connect_response', function(message, xbox, remote, smartglass){
                    if(message.packet_decoded.protected_payload.connect_result == '0'){
                        Debug('Console is connected')
                    } else {
                        Debug('Error during connect.')
                    }
                    callback()
                })

                smartglassEvent.on('_on_timeout', function(message, xbox, remote, smartglass){
                    Debug('Client timeout...')
                })

            }.bind(this))
        },

        on: function(name,  callback)
        {
            smartglassEvent.on(name, callback)
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

            this._closeClient()
        },

        _getSocket: function()
        {
            Debug('Get active socket');

            this._socket = dgram.createSocket('udp4');
            this._socket.bind();

            this._socket.on('listening', function(message, remote){
                if(this._is_broadcast == true)
                    this._socket.setBroadcast(true);
            }.bind(this))

            this._socket.on('message', function(message, remote){
                this._last_received_time = Math.floor(Date.now() / 1000)
                var xbox = this._consoles[remote.address]
                smartglassEvent.emit('receive', message, xbox, remote, this);
            }.bind(this));

            this._socket.on('close', function() {
                Debug('UDP socket closed.');
            });

            return this._socket;
        },

        _closeClient:  function()
        {
            Debug('Client closed');

            clearInterval(this._interval_timeout)
            if(this._socket != false){
                this._socket.close();
                this._socket = false
            }

        },

        _send: function(options, message)
        {
            this._socket.send(message, 0, message.length, options.port, options.ip, function(err, bytes) {
                 Debug('Sending packet to client: '+options.ip+':'+options.port);
            });
        },
    }
}
