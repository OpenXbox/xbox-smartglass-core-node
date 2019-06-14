const dgram = require('dgram');
const Packer = require('./packet/packer');
const Xbox = require('./xbox');

module.exports = function()
{
    var id = Math.floor(Math.random() * (999 - 1)) + 1;
    var Debug = require('debug')('smartglass:client-'+id)

    var smartglassEvent = require('./events')

    return {
        _client_id: id,
        _console: false,
        _socket: false,
        _events: smartglassEvent,

        _last_received_time: false,
        _is_broadcast: false,
        _ip: false,
        _interval_timeout: false,

        _managers: {},
        _managers_num: 0,

        _connection_status: false,
        _current_app: false,

        discovery: function(callback, ip)
        {
            if(ip == undefined){
                this._ip = '255.255.255.255'
                this._is_broadcast = true
            } else {
                this._ip  = ip
            }

            this._getSocket()

            Debug('['+this._client_id+'] Crafting discovery_request packet');
            var discovery_packet = Packer('simple.discovery_request')
            var message  = discovery_packet.pack()

            var consoles_found = []

            smartglassEvent.on('_on_discovery_response', function(message, xbox, remote){
                consoles_found.push({
                    message: message.packet_decoded,
                    remote: remote
                })
            });

            this._send(message);

            this._interval_timeout = setTimeout(function(){
                Debug('Discovery timeout after 2 sec')
                this._closeClient();
                callback(consoles_found);
            }.bind(this), 2000);
        },

        getActiveApp: function()
        {
            return this._current_app
        },

        isConnected: function()
        {
            return this._connection_status
        },

        powerOn: function(options, callback)
        {
            this._getSocket();

            if(options.tries == undefined){
                options.tries =  5;
            }

            this._ip = options.ip

            var poweron_packet = Packer('simple.poweron')
            poweron_packet.set('liveid', options.live_id)
            var message  = poweron_packet.pack()

            var try_num = 0;
            var sendBoot = function(client, callback)
            {
                client._send(message);

                try_num = try_num+1;
                if(try_num <= options.tries)
                {
                    setTimeout(sendBoot, 500, client, callback);
                } else {
                    client._closeClient();

                    client.discovery(function(consoles){
                        client._closeClient();
                        if(consoles.length  >  0){
                            callback(true)
                        } else {
                            callback(false)
                        }
                    }, options.ip)
                }
            }
            setTimeout(sendBoot, 1000, this, callback);
        },

        powerOff: function(callback)
        {
            if(this.isConnected() == true){

                var xbox = this._console;

                xbox.get_requestnum()
                var poweroff = Packer('message.power_off');
                poweroff.set('liveid', xbox._liveid)
                var message = poweroff.pack(xbox);

                this._send(message);

                setTimeout(function(){
                    this.disconnect()
                }.bind(this), 1000);

                callback(true)

            } else {
                callback(false)
                return
            }
        },

        connect: function(ip, callback)
        {
            this._ip = ip

            this.discovery(function(consoles){
                if(consoles.length > 0){
                    Debug('['+this._client_id+'] Console is online. Lets connect...')
                    clearTimeout(this._interval_timeout)

                    this._getSocket();

                    var xbox = Xbox(consoles[0].remote.address, consoles[0].message.certificate);
                    var message = xbox.connect();

                    this._send(message);

                    this._console = xbox

                    smartglassEvent.on('_on_connect_response', function(message, xbox, remote, smartglass){
                        if(message.packet_decoded.protected_payload.connect_result == '0'){
                            Debug('['+this._client_id+'] Console is connected')
                            this._connection_status = true
                            callback(true)
                        } else {
                            Debug('['+this._client_id+'] Error during connect.')
                            this._connection_status = false
                            callback(false)
                        }
                    }.bind(this))

                    smartglassEvent.on('_on_timeout', function(message, xbox, remote, smartglass){
                        Debug('['+this._client_id+'] Client timeout...')
                    }.bind(this))
                } else {
                    Debug('['+this._client_id+'] Device is offline...')
                    this._connection_status = false
                    callback(false)
                }
            }.bind(this), this._ip)
        },

        on: function(name,  callback)
        {
            smartglassEvent.on(name, callback)
        },

        disconnect: function()
        {
            var xbox = this._console;

            xbox.get_requestnum()

            var disconnect = Packer('message.disconnect')
            disconnect.set('reason', 4)
            disconnect.set('error_code', 0)
            var disconnect_message = disconnect.pack(xbox)

            this._send(disconnect_message);

            this._closeClient()
        },

        addManager: function(name, manager)
        {
            this._managers_num++
            Debug('Loaded manager: '+name + '('+this._managers_num+')')
            this._managers[name] = manager
            this._managers[name].load(this, this._managers_num)
        },

        getManager: function(name)
        {
            if(this._managers[name] != undefined)
                return this._managers[name]
            else
                return false
        },

        _getSocket: function()
        {
            Debug('['+this._client_id+'] Get active socket');

            this._socket = dgram.createSocket('udp4');
            this._socket.bind();

            this._socket.on('listening', function(message, remote){
                if(this._is_broadcast == true)
                   this._socket.setBroadcast(true);
            }.bind(this))

            this._socket.on('error', function(error){
                Debug('Socket Error:')
                Debug(error)
            }.bind(this))

            this._socket.on('message', function(message, remote){
                this._last_received_time = Math.floor(Date.now() / 1000)
                var xbox = this._console
                smartglassEvent.emit('receive', message, xbox, remote, this);
            }.bind(this));

            this._socket.on('close', function() {
                Debug('['+this._client_id+'] UDP socket closed.');
            }.bind(this));

            return this._socket;
        },

        _closeClient:  function()
        {
            Debug('['+this._client_id+'] Client closed');
            this._connection_status = false

            clearInterval(this._interval_timeout)
            if(this._socket != false){
                this._socket.close();
                this._socket = false
            }

        },

        _send: function(message, ip)
        {
            if(ip == undefined){
                ip = this._ip
            }

            if(this._socket != false)
                this._socket.send(message, 0, message.length, 5050, ip, function(err, bytes) {
                     Debug('['+this._client_id+'] Sending packet to client: '+this._ip+':'+5050);
                     Debug(message.toString('hex'))
                }.bind(this));
        },
    }
}
