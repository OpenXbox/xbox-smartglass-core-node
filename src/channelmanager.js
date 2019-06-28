const Packer = require('./packet/packer');

module.exports = function(service_udid, name)
{
    var Debug = require('debug')('smartglass:channelmanager:'+name)

    return {
        _channel_status: false,
        _channel_name: name,

        _channel_server_id: 0,
        _channel_client_id: 0,
        _udid: service_udid,

        _smartglass: false,
        _xbox: false,

        getStatus: function(){
            return this._channel_status
        },

        getConsole: function(){
            return this._smartglass._console
        },

        getChannel: function(){
            return this._channel_server_id
        },

        getSmartglass: function(){
            return this._smartglass
        },

        open: function(smartglass, channel_id){
            return new Promise(function(resolve, reject) {
                Debug('Opening channel #'+channel_id);

                this._channel_client_id = channel_id
                this._smartglass = smartglass

                // @TODO: Find a better way to check
                this._smartglass.on('_on_console_status', function(message, xbox, remote, smartglass){
                    if(this._channel_status == false){
                        Debug('Request open channel: '+this._channel_name);

                        this._xbox = xbox;

                        var channel_request = Packer('message.start_channel_request')
                        channel_request.set('channel_request_id', this._channel_client_id);
                        channel_request.set('title_id', 0);
                        channel_request.set('service', Buffer.from(this._udid, 'hex'));
                        channel_request.set('activity_id', 0);
                        Debug('+ Send channel request on channel #'+this._channel_client_id);

                        // xbox.get_requestnum()
                        this._smartglass._console.get_requestnum()
                        var channel_message = channel_request.pack(xbox)

                        this._smartglass.on('_on_start_channel_response', function(message, xbox, remote){
                            // console.log('Got channel response!', this._channel_client_id, message)

                            if(message.packet_decoded.protected_payload.channel_request_id == this._channel_client_id)
                            {
                                if(message.packet_decoded.protected_payload.result == 0)
                                {
                                    Debug('Channel ready: '+this._channel_name);
                                    this._channel_status = true
                                    this._channel_server_id = message.packet_decoded.protected_payload.target_channel_id

                                    resolve(this)
                                } else {
                                    reject('Could not open channel: '+this._channel_name);
                                }
                            }
                        }.bind(this));

                        this._smartglass._send(channel_message);
                    }
                }.bind(this))
            }.bind(this))
        },

        send: function(packet){
            this._smartglass._send(packet)
        }
    }
}
