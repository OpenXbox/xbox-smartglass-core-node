var Debug = require('debug')('smartglass:channel_system_input')
const Packer = require('../packet/packer');

module.exports = function(channel_request_id)
{
    return {
        _channel_status: false,
        _channel_id: 0,
        _channel_request_id: channel_request_id,
        _smartglass: false,
        _xbox: false,
        _media_request_id: 1,
        _media_state: {
            title_id: 0
        },

        _media_commands: {
            play: 2,
            pause: 4,
            playpause: 8,
            stop: 16,
            record: 32,
            next_track: 64,
            prev_track: 128,
            fast_forward: 256,
            rewind: 512,
            channel_up: 1024,
            channel_down: 2048,
            back: 4096,
            view: 8192,
            menu: 16384,
            seek: 32786, // Not implemented yet
        },

        load: function(smartglass){
            this._smartglass = smartglass
            this._smartglass.on('_on_console_status', function(message, xbox, remote, smartglass){
                if(this._channel_status == false){
                    Debug('Channel status is false, opening channel SystemInput');

                    var channel_request = Packer('message.start_channel_request')
                    channel_request.set('channel_request_id', this._channel_request_id);
                    channel_request.set('title_id', 0);
                    channel_request.set('service', Buffer.from('48a9ca24eb6d4e128c43d57469edd3cd', 'hex'));
                    channel_request.set('activity_id', 0);

                    xbox.get_requestnum()
                    var message  = channel_request.pack(xbox)

                    Debug('Send data: '+message.toString('hex'));

                    this._smartglass.on('_on_start_channel_response', function(message, xbox, remote){
                        // console.log('Got channel response!', message)
                        this._xbox = xbox;

                        // console.log(message.packet_decoded.protected_payload)

                        if(message.packet_decoded.protected_payload.channel_request_id == this._channel_request_id)
                        {
                            if(message.packet_decoded.protected_payload.result == 0)
                            {
                                Debug('Channel ready: SystemMedia');
                                this._channel_status = true
                                this._channel_id = message.packet_decoded.protected_payload.target_channel_id

                                this._smartglass.on('_on_media_state', function(message, xbox, remote){
                                    console.log('MEDIA STATE', message.packet_decoded.protected_payload)
                                    this._media_state = message.packet_decoded.protected_payload
                                }.bind(this));

                            } else {
                                Debug('Could not open channel: SystemMedia');
                            }
                        }
                    }.bind(this));

                    this._smartglass._send({
                        ip: remote.address,
                        port: 5050
                    }, message);
                }
            }.bind(this));
        },

        sendCommand: function(button){
            // Send
            if(this._channel_status == true){
                Debug('Send media command: '+button);
                var timestamp = new Date().getTime()

                var media_command = Packer('message.media_command')
                var request_id = "0000000000000000"
                request_id = (request_id+this._media_request_id).slice(-request_id.length);
                media_command.set('request_id', Buffer.from(request_id, 'hex'));
                media_command.set('title_id', this._media_state.title_id);
                media_command.set('command', this._media_commands[button]);
                this._media_request_id++

                media_command.setChannel(this._channel_id)
                // console.log(media_command.structure.structure)
                this._xbox.get_requestnum()
                var message  = media_command.pack(this._xbox)

                this._smartglass._send({
                    ip: this._smartglass._ip,
                    port: 5050
                }, message);
            }
        }
    }
}
