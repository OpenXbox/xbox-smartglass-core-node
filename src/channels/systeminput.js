var Debug = require('debug')('smartglass:channel_system_input')
const Packer = require('../packet/packer');
const ChannelManager = require('../channelmanager');

module.exports = function()
{
    var channel_manager = new ChannelManager('fa20b8ca66fb46e0adb60b978a59d35f', 'SystemInput')

    return {
        _channel_manager: channel_manager,

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

        load: function(smartglass, manager_id){
            this._channel_manager.open(smartglass, manager_id).then(function(channel){
                Debug('Channel is open.')
            }, function(error){
                Debug('ChannelManager open() Error:', error)
            })
        },

        sendCommand: function(button){
            // Send
            return new Promise(function(resolve, reject) {
                if(this._channel_manager.getStatus() == true){
                    Debug('Send button: '+button);

                    if(this._button_map[button] != undefined){
                        var timestamp_now = new Date().getTime()

                        var gamepad = Packer('message.gamepad')
                        gamepad.set('timestamp', Buffer.from('000'+timestamp_now.toString(), 'hex'))
                        gamepad.set('buttons', this._button_map[button]);
                        gamepad.setChannel(this._channel_manager.getChannel())

                        this._channel_manager.getConsole().get_requestnum()
                        var message  = gamepad.pack(this._channel_manager.getConsole())
                        this._channel_manager.send(message);

                        setTimeout(function(){
                            var timestamp = new Date().getTime()

                            var gamepad_unpress = Packer('message.gamepad')
                            gamepad_unpress.set('timestamp', Buffer.from('000'+timestamp.toString(), 'hex'))
                            gamepad_unpress.set('buttons', 0);
                            gamepad_unpress.setChannel(this._channel_manager.getChannel())

                            this._channel_manager.getConsole().get_requestnum()
                            var message  = gamepad_unpress.pack(this._channel_manager.getConsole())

                            this._channel_manager.send(message);
                            resolve({
                                status: 'ok_gamepad_send',
                                params: {
                                    button: button
                                }
                            })

                        }.bind(this), 100)

                    } else {
                        Debug('Failed to send button. Reason: Unknown '+button);

                        reject({
                            status: 'error_channel_disconnected',
                            error: 'Channel not ready: SystemInput',
                            buttons: _button_map
                        })
                    }
                } else {
                    reject({
                        status: 'error_channel_disconnected',
                        error: 'Channel not ready: SystemInput'
                    })
                }
            }.bind(this))
        }
    }
}
