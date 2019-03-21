var PacketStructure = require('./structure');
var Packer = require('./packer');

module.exports = function(packet_format, packet_data = false){
    var Type = {
        uInt32: function(value){
            return {
                value: value,
                pack: function(packet_structure){
                    return packet_structure.writeUInt32(this.value);
                },
                unpack: function(packet_structure){
                    return packet_structure.readUInt32();
                }
            }
        },
        uInt16: function(value){
            return {
                value: value,
                pack: function(packet_structure){
                    return packet_structure.writeUInt16(this.value);
                },
                unpack: function(packet_structure){
                    return packet_structure.readUInt16();
                }
            }
        },
        bytes: function(length, value){
            return {
                value: value,
                length: length,
                pack: function(packet_structure){
                    return packet_structure.writeBytes(this.value);
                },
                unpack: function(packet_structure){
                    return packet_structure.readBytes(length);
                }
            }
        },
        sgString: function(value){
            return {
                value: value,
                pack: function(packet_structure){
                    return packet_structure.writeSGString(this.value);
                },
                unpack: function(packet_structure){
                    return packet_structure.readSGString().toString();
                }
            }
        },
        Optional: function(type){
            return {
                value: type
            }
        }
    }

    var Packet = {
        poweron: {
            liveid: Type.sgString(),
        },
        discovery_request: {
            flags: Type.uInt32('0'),
            client_type: Type.uInt16('3'),
            min_version: Type.uInt16('0'),
            max_version: Type.uInt16('2')
        },
        discovery_response: {
            flags: Type.uInt32('0'),
            client_type: Type.uInt16('0'),
            name: Type.sgString(),
            uuid: Type.sgString(),
            last_error: Type.uInt32('0'),
            certificate_length: Type.uInt16('0'),
            certificate: Type.bytes(),
        },
        connect_request: {
            uuid: Type.bytes(16, ''),
            public_key_type: Type.uInt16('3'),
            public_key: Type.sgString(),
            iv: Type.bytes(16, '')
        },
        connect_response: {
            iv: Type.bytes(16, ''),
            protected_payload: Type.bytes()
        },
        connect_response_protected: {
            connect_result: Type.uInt16('1'),
            pairing_state: Type.uInt16('2'),
            participant_id: Type.uInt32('0'),
        },
    };

    var structure = Packet[packet_format];

    return {
        type: 'simple',
        name: packet_format,
        structure: structure,
        packet_data: packet_data,
        packet_decoded: false,

        set: function(key, value){
            this.structure[key].value = value
        },

        unpack: function(device = undefined){
            var payload = PacketStructure(this.packet_data)

            var packet = {
                type: payload.readBytes(2).toString('hex'),
                payload_length: payload.readUInt16(),
                version: payload.readUInt16()
            }

            if(packet.version != '0' && packet.version != '2'){
                packet.protected_payload_length = packet.version
                packet.version = payload.readUInt16()
            }

            for(name in structure){
                packet[name] = structure[name].unpack(payload)
                this.set(name, packet[name])
            }

            // Lets decrypt the data when the payload is encrypted
            if(packet.protected_payload_length != undefined){
                var decrypted_payload = device._crypto._decrypt(packet.protected_payload, packet.iv).slice(0, packet.protected_payload_length);
                decrypted_payload = PacketStructure(decrypted_payload)

                var protected_structure = Packet[packet_format+'_protected'];
                packet['protected_payload'] = {}

                for(name in protected_structure){
                    packet['protected_payload'][name] = protected_structure[name].unpack(decrypted_payload)
                    //this.set('protected_payload', packet[name])
                }
            }

            this.packet_decoded = packet;

            return this;
        },

        pack: function(){
            var payload = PacketStructure()

            for(name in structure){
                structure[name].pack(payload)
            }

            if(this.name == 'discovery_request'){
                var packet = this._pack(Buffer.from('DD00', 'hex'), payload.toBuffer(), Buffer.from('0000', 'hex'))

            } else if(this.name == 'discovery_response'){
                var packet = this._pack(Buffer.from('DD01', 'hex'), payload.toBuffer(), Buffer.from('0000', 'hex'))

            } else if(this.name == 'connect_request'){
                var packet = this._pack(Buffer.from('CC00', 'hex'), payload.toBuffer(), Buffer.from('0000', 'hex'))
            }

            return packet;
        },

        _pack: function(type, payload, version)
        {
            var payloadLength = PacketStructure();
            payloadLength.writeUInt16(payload.length);
            payloadLength = payloadLength.toBuffer();

            return Buffer.concat([
                type,
                payloadLength,
                Buffer.from('\x00' + String.fromCharCode(version)),
                payload
            ]);
        },
    }
}
