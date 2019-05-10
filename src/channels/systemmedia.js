var Debug = require('debug')('smartglass:channel_system_input')
const Packer = require('../packet/packer');

module.exports = function()
{
    return {
        _channel_status: false,
        _channel_id: 0,
        _smartglass: false,
        _xbox: false,

        load: function(smartglass){
            this._smartglass = smartglass
            this._smartglass.on('_on_console_status', function(message, xbox, remote, smartglass){
                if(this._channel_status == false){
                    Debug('Channel status is false, opening channel SystemInput');

                    var channel_request = Packer('message.start_channel_request')
                    channel_request.set('channel_request_id', 1);
                    channel_request.set('title_id', 0);
                    channel_request.set('service', Buffer.from('48a9ca24eb6d4e128c43d57469edd3cd', 'hex'));
                    channel_request.set('activity_id', 0);

                    var message  = channel_request.pack(xbox)
                    xbox.get_requestnum()

                    Debug('Send data: '+message.toString('hex'));

                    this._smartglass.on('_on_start_channel_response', function(message, xbox, remote){
                        console.log('Got channel response!', message)
                        this._xbox = xbox;

                        if(message.packet_decoded.protected_payload.result == 0)
                        {
                            Debug('Channel ready: SystemInput');
                            this._channel_status = true
                            this._channel_id = message.packet_decoded.protected_payload.target_channel_id
                        } else {
                            Debug('Could not open channel: SystemInput');
                        }
                    }.bind(this));

                    this._smartglass.on('_on_media_state', function(message, xbox, remote){
                        console.log('MEDIA STATE', message.packet_decoded.protected_payload)
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
                Debug('Send button: '+button);

                var timestamp = new Date().getTime()

                var gamepad = Packer('message.gamepad')
                gamepad.set('timestamp', Buffer.from('000'+timestamp.toString(), 'hex'))
                gamepad.set('buttons', 32);
                gamepad.setChannel(this._channel_id)
                console.log(gamepad.structure.structure)
                var message  = gamepad.pack(this._xbox)

                this._xbox.get_requestnum()
                this._smartglass._send({
                    ip: this._smartglass._ip,
                    port: 5050
                }, message);


                // var timestamp = new Date().getTime()
                //
                // var gamepad = Packer('message.gamepad')
                // gamepad.set('timestamp', Buffer.from('000'+timestamp.toString(), 'hex'))
                // gamepad.set('buttons', 0);
                // gamepad.setChannel(this._channel_id)
                // console.log(gamepad.structure.structure)
                // var message  = gamepad.pack(this._xbox)
                //
                // this._xbox.get_requestnum()
                // this._smartglass._send({
                //     ip: this._smartglass._ip,
                //     port: 5050
                // }, message);
            }
        }
    }
}
