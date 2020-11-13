var SimplePacket = require('./simple');
var MessagePacket = require('./message');
var Debug = require('debug')('smartglass:packer')

module.exports = function(type)
{
    var Types = {
        d00d: 'message',
        cc00: 'simple.connect_request',
        cc01: 'simple.connect_response',
        dd00: 'simple.discovery_request',
        dd01: 'simple.discovery_response',
        dd02: 'simple.poweron',
    }

    var loadPacketStructure = function(type, value = false){
        if(type.slice(0, 6) == 'simple'){
            return SimplePacket(type.slice(7), value);
        } else if(type.slice(0, 7) == 'message'){
            return MessagePacket(type.slice(8), value);
        } else {
            Debug('[packet/packer.js] Packet format not found: ', type.toString('hex'));
            return false
        }
    }

    var packet_type = type.slice(0,2).toString('hex')
    var structure = ''

    if(packet_type in Types){
        // We got a packet that we need to unpack
        var packet_value = type;
        type = Types[packet_type];
        structure = loadPacketStructure(type, packet_value)
    } else {
        structure = loadPacketStructure(type)
    }

    return {
        type: type,
        structure: structure,
        set: function(key, value, protected_payload = false){
            this.structure.set(key, value, protected_payload)
        },
        pack: function(device = undefined){
            return structure.pack(device)
        },
        unpack: function(device = undefined){
            return structure.unpack(device)
        },
        setChannel: function(channel){
            this.structure.setChannel(channel)
        }
    }
}
