const EventEmitter = require('events');
const Packer = require('./packet/packer')
var Debug = require('debug')('smartglass:events')


module.exports = function(){
    const smartglassEmitter = new EventEmitter();

    smartglassEmitter.on('newListener', function(event, listener){
        Debug('+ New listener: '+event+'()');
    })

    smartglassEmitter.on('receive', function(message, xbox, remote, smartglass){

        message = Packer(message);
        var response = message.unpack(xbox);

        var type = response.name;
        var func = '';

        if(response.packet_decoded.type != 'd00d')
        {
            func = '_on_' + type.toLowerCase();
            Debug('Received message. Call: '+func+'()');
        } else {
            if(response.packet_decoded.target_participant_id != xbox._participantid){
                Debug('[smartglass.js:_receive] Participantid does not match. Ignoring packet.')
                return;
            }

            func = '_on_' + message.structure.packet_decoded.name.toLowerCase();
            Debug('Received message. Call: '+func+'()');

            if(response.packet_decoded.flags.need_ack == true){
                Debug('Packet needs to be acknowledged. Sending response');
                //Debug(response.packet_decoded)

                var ack = Packer('message.acknowledge')
                ack.set('low_watermark', response.packet_decoded.sequence_number)
                // xbox._request_num = response.packet_decoded.sequence_number+1
                ack.structure.structure.processed_list.value.push({id: response.packet_decoded.sequence_number})
                smartglass._console.get_requestnum()
                var ack_message = ack.pack(smartglass._console)

                try {
                    smartglass._send(ack_message);
                }
                catch(error) {
                    Debug('error', error)
                }

            }
        }

        if(func == '_on_json')
        {
            // console.log('ON JSON')
            var json_message = JSON.parse(response.packet_decoded.protected_payload.json)
            // console.log(json_message);

            // Check if JSON is fragmented
            if(json_message.datagram_id != undefined){
                Debug('_on_json is fragmented #'+json_message.datagram_id)
                if(xbox._fragments[json_message.datagram_id] == undefined){
                    // Prepare buffer for JSON
                    xbox._fragments[json_message.datagram_id] = {

                        getValue: function(){
                            var buffer = Buffer.from('');

                            for(partial in this.partials){
                                buffer = Buffer.concat([
                                    buffer,
                                    Buffer.from(this.partials[partial])
                                ])
                            }

                            var buffer = Buffer(buffer.toString(), 'base64')
                            return buffer
                        },
                        isValid: function(){
                            var json = this.getValue()
                            // console.log('fragment', fragment.toString())
                            // var json = Buffer(fragment.toString(), 'base64')
                            // console.log('valid check: ', json.toString())

                            try {
                                JSON.parse(json.toString());
                            } catch (e) {
                                return false;
                            }

                            return true
                        },
                        partials: {}
                    }
                }

                xbox._fragments[json_message.datagram_id].partials[json_message.fragment_offset] = json_message.fragment_data

                if(xbox._fragments[json_message.datagram_id].isValid() == true){
                    Debug('_on_json: Completed fragmented packet')
                    var json_response = response
                    json_response.packet_decoded.protected_payload.json = xbox._fragments[json_message.datagram_id].getValue().toString()

                    smartglassEmitter.emit('_on_json', json_response, xbox, remote, smartglass)

                    xbox._fragments[json_message.datagram_id] = undefined
                }

                func = '_on_json_fragment'
            }
        }

        Debug('Emit event:', func)
        smartglassEmitter.emit(func, response, xbox, remote, smartglass)
    })

    smartglassEmitter.on('_on_discovery_response', function(message, xbox, remote){});

    smartglassEmitter.on('_on_connect_response', function(message, xbox, remote, smartglass){

        if(smartglass._connection_status == true){
            Debug('Ignore connect_response packet. Already connected...')
            return;
        }

        var participantId = message.packet_decoded.protected_payload.participant_id;
        xbox.set_participantid(participantId);

        var connectionResult = message.packet_decoded.protected_payload.connect_result;
        if(connectionResult == '0')
        {
            smartglass._connection_status = true;

            var local_join = Packer('message.local_join');
            var join_message = local_join.pack(xbox);

            smartglass._send(join_message);

            smartglass._interval_timeout = setInterval(function(){
                var seconds_ago = (Math.floor(Date.now() / 1000))-this._last_received_time

                if(seconds_ago == 5 || seconds_ago == 10){
                    Debug('Check timeout: Last packet was '+((Math.floor(Date.now() / 1000))-this._last_received_time+' seconds ago'))

                    xbox.get_requestnum()
                    var ack = Packer('message.acknowledge')
                    ack.set('low_watermark', xbox._request_num)
                    var ack_message = ack.pack(xbox)

                    this._send(ack_message);
                }

                if(seconds_ago > 15){
                    Debug('Connection timeout after 15 sec. Call: _on_timeout()')
                    smartglass._events.emit('_on_timeout', message, xbox, remote, this)

                    smartglass._closeClient()
                    return;
                }
            }.bind(smartglass, message, xbox, remote), 1000)
        }
    });


    smartglassEmitter.on('_on_console_status', function(message, xbox, remote, smartglass){
        if(message.packet_decoded.protected_payload.apps[0] != undefined){
            if(smartglass._current_app != message.packet_decoded.protected_payload.apps[0].aum_id){
                smartglass._current_app = message.packet_decoded.protected_payload.apps[0].aum_id
                // console.log('Current active app:', smartglass._current_app)
            }
        }
    });

    return smartglassEmitter
};
