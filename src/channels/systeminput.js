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

        _button_map: {
            a: 16,
            b: 32,
            x: 64,
            y: 128,
            up: 256,
            left: 1024,
            right: 2048,
            down: 512,
            nexus: 2,
            view: 4,
            menu: 8,
        },

        load: function(smartglass){
            this._smartglass = smartglass
            this._smartglass.on('_on_console_status', function(message, xbox, remote, smartglass){
                if(this._channel_status == false){
                    Debug('Channel status is false, opening channel SystemInput');

                    var channel_request = Packer('message.start_channel_request')
                    channel_request.set('channel_request_id', this._channel_request_id);
                    channel_request.set('title_id', 0);
                    channel_request.set('service', Buffer.from('fa20b8ca66fb46e0adb60b978a59d35f', 'hex'));
                    channel_request.set('activity_id', 0);

                    // xbox.get_requestnum()
                    this._smartglass._consoles[this._smartglass._ip].get_requestnum()
                    var channel_message  = channel_request.pack(xbox)

                    Debug('Send data: '+message.toString('hex'));

                    this._smartglass.on('_on_start_channel_response', function(message, xbox, remote){
                        // console.log('Got channel response!', message)
                        this._xbox = xbox;

                        if(message.packet_decoded.protected_payload.channel_request_id == this._channel_request_id)
                        {
                            if(message.packet_decoded.protected_payload.result == 0)
                            {
                                Debug('Channel ready: SystemInput');
                                this._channel_status = true
                                this._channel_id = message.packet_decoded.protected_payload.target_channel_id
                            } else {
                                Debug('Could not open channel: SystemInput');
                            }
                        }
                    }.bind(this));

                    this._smartglass._send({
                        ip: remote.address,
                        port: 5050
                    }, channel_message);
                }
            }.bind(this));
        },

        sendCommand: function(button){
            // Send
            if(this._channel_status == true){
                Debug('Send button: '+button);

                if(this._button_map[button] != undefined){
                    var timestamp = new Date().getTime()

                    var gamepad = Packer('message.gamepad')
                    gamepad.set('timestamp', Buffer.from('000'+timestamp.toString(), 'hex'))
                    gamepad.set('buttons', this._button_map[button]);
                    gamepad.setChannel(this._channel_id)

                    this._smartglass._consoles[this._smartglass._ip].get_requestnum()
                    // this._smartglass._consoles[this._smartglass._ip].get_requestnum()
                    var message  = gamepad.pack(this._smartglass._consoles[this._smartglass._ip])

                    this._smartglass._send({
                        ip: this._smartglass._ip,
                        port: 5050
                    }, message);


                    setTimeout(function(){

                        var timestamp = new Date().getTime()

                        var gamepad = Packer('message.gamepad')
                        gamepad.set('timestamp', Buffer.from('000'+timestamp.toString(), 'hex'))
                        gamepad.set('buttons', 0);
                        gamepad.setChannel(this._channel_id)

                        this._smartglass._consoles[this._smartglass._ip].get_requestnum()
                        var message  = gamepad.pack(this._smartglass._consoles[this._smartglass._ip])

                        this._smartglass._send({
                            ip: this._smartglass._ip,
                            port: 5050
                        }, message);
                    }.bind(this), 250)

                } else {
                    Debug('Failed to send button. Reason: Unknown '+button);
                }
            } else {
                Debug('Failed to send button. Reason: Channel not created');
            }
        }
    }
}
