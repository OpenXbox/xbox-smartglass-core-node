const EventEmitter = require('events');
const smartglassEmitter = new EventEmitter();
const Packer = require('./packet/packer')
var Debug = require('debug')('smartglass:events')

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
                ack.structure.structure.processed_list.value.push({id: response.packet_decoded.sequence_number})
            smartglass._consoles[smartglass._ip].get_requestnum()
            var ack_message = ack.pack(smartglass._consoles[smartglass._ip])

            try {
                smartglass._send(ack_message);
            }
            catch(error) {
                Debug('error', error)
            }

        }
    }

    Debug('Emit event:', func)
    smartglassEmitter.emit(func, response, xbox, remote, smartglass)
})

smartglassEmitter.on('_on_discovery_response', function(message, xbox, remote){});

smartglassEmitter.on('_on_connect_response', function(message, xbox, remote, smartglass){

    if(xbox._connection_status == true){
        Debug('Ignore connect_response packet. Already connected...')
        return;
    }

    var participantId = message.packet_decoded.protected_payload.participant_id;
    xbox.set_participantid(participantId);

    var connectionResult = message.packet_decoded.protected_payload.connect_result;
    if(connectionResult == '0')
    {
        xbox._connection_status = true;

        var local_join = Packer('message.local_join');
        var join_message = local_join.pack(xbox);

        smartglass._send(join_message);

        smartglass._interval_timeout = setInterval(function(){
            var seconds_ago = (Math.floor(Date.now() / 1000))-this._last_received_time

            if(seconds_ago == 10 || seconds_ago == 20){
                Debug('Check timeout: Last packet was '+((Math.floor(Date.now() / 1000))-this._last_received_time+' seconds ago'))

                xbox.get_requestnum()
                var ack = Packer('message.acknowledge')
                ack.set('low_watermark', xbox._request_num)
                var ack_message = ack.pack(xbox)

                this._send(ack_message);
            }

            if(seconds_ago > 30){
                Debug('Connection timeout after 30 sec. Call: _on_timeout()')
                smartglass._events.emit('_on_timeout', message, xbox, remote, this)

                smartglass._closeClient()
                return;
            }
        }.bind(smartglass, message, xbox, remote), 1000)
    }
});



module.exports = smartglassEmitter;
