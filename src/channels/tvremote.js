var Debug = require('debug')('smartglass:channel_tv_remote')
const Packer = require('../packet/packer');
const ChannelManager = require('../channelmanager');

module.exports = function()
{
    var channel_manager = ChannelManager('d451e3b360bb4c71b3dbf994b1aca3a7', 'TvRemote')

    return {
        _channel_manager: channel_manager,
        _message_num: 0,

        _configuration: {},
        _headend_info: {},

        load: function(smartglass, manager_id){
            this._channel_manager.open(smartglass, manager_id).then(function(channel){
                Debug('Channel is open.')
            }, function(error){
                Debug('ChannelManager open() Error:', error)
            })

            smartglass.on('_on_json', function(message, xbox, remote, smartglass){
                var response = JSON.parse(message.packet_decoded.protected_payload.json)

                if(response.response == "Error"){
                    console.log('Got Error:', response)
                } else {
                    if(response.response == 'GetConfiguration'){
                        Debug('Got TvRemote Configuration')
                        this._configuration = response.params

                    } else if(response.response == 'GetHeadendInfo') {
                        Debug('Got Headend Configuration')
                        this._headend_info = response.params

                    }// else {
                    //     Debug('UNKNOWN JSON RESPONSE:', response)
                    // }

                }

            }.bind(this))
        },

        getConfiguration: function(){
            return new Promise(function(resolve, reject) {
                if(this._channel_manager.getStatus() == true){
                    Debug('Get configuration');

                    this._message_num++
                    var msgId = '2ed6c0fd.'+this._message_num;

                    var json_request = {
                        msgid: msgId,
                        request: "GetConfiguration",
                        params: null
                    }

                    var config_request = Packer('message.json')
                    config_request.set('json', JSON.stringify(json_request));
                    this._channel_manager.getConsole().get_requestnum()

                    config_request.setChannel(this._channel_manager.getChannel())
                    var config_request_packed = config_request.pack(this._channel_manager.getConsole())

                    this._channel_manager.send(config_request_packed);

                    setTimeout(function(){
                        resolve(this._configuration)
                    }.bind(this), 1000)
                } else {
                   reject({
                       status: 'error_channel_disconnected',
                       error: 'Channel not ready: TvRemote'
                   })
               }
           }.bind(this))
        },

        getHeadendInfo: function(){
            return new Promise(function(resolve, reject) {
                if(this._channel_manager.getStatus() == true){
                    Debug('Get headend info');

                    this._message_num++
                    var msgId = '2ed6c0fd.'+this._message_num;

                    var json_request = {
                        msgid: msgId,
                        request: "GetHeadendInfo",
                        params: null
                    }

                    var config_request = Packer('message.json')
                    config_request.set('json', JSON.stringify(json_request));
                    this._channel_manager.getConsole().get_requestnum()

                    config_request.setChannel(this._channel_manager.getChannel())
                    var config_request_packed = config_request.pack(this._channel_manager.getConsole())

                    this._channel_manager.send(config_request_packed);

                    setTimeout(function(){
                        resolve(this._headend_info)
                    }.bind(this), 1000)
                } else {
                   reject({
                       status: 'error_channel_disconnected',
                       error: 'Channel not ready: TvRemote'
                   })
               }
           }.bind(this))
        },

        sendIrCommand: function(button_id, device_id = null){
            return new Promise(function(resolve, reject) {
                if(this._channel_manager.getStatus() == true){
                    Debug('Send button: '+button_id);

                    this._message_num++
                    var msgId = '2ed6c0fd.'+this._message_num;

                    var json_request = {
                        msgid: msgId,
                        request:"SendKey",
                        params: {
                            button_id: button_id,
                            device_id: device_id
                        }
                    }

                    var sendkey_request = Packer('message.json')
                    sendkey_request.set('json', JSON.stringify(json_request));
                    this._channel_manager.getConsole().get_requestnum()

                    sendkey_request.setChannel(this._channel_manager.getChannel())
                    var sendkey_request_packed = sendkey_request.pack(this._channel_manager.getConsole())

                    this._channel_manager.send(sendkey_request_packed);
                    resolve({
                        status: 'ok_tvremote_send',
                        params: json_request.params
                    })
                } else {
                    reject({
                        status: 'error_channel_disconnected',
                        error: 'Channel not ready: TvRemote'
                    })
                }
            }.bind(this))
        }
    }
}
