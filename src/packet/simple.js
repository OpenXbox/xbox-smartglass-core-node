var PacketStructure = require('./structure');
var Packer = require('./packer');
var Debug = require('debug')('smartglass:packet_simple')

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
            public_key_type: Type.uInt16('0'),
            public_key: Type.bytes(64, ''),
            iv: Type.bytes(16, ''),
            protected_payload: Type.bytes()
        },
        connect_request_protected: {
            userhash: Type.sgString(''),
            jwt: Type.sgString(''),
            connect_request_num: Type.uInt32('0'),
            connect_request_group_start: Type.uInt32('0'),
            connect_request_group_end: Type.uInt32('1')
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

    // Load protected payload PacketStructure
    if(structure.protected_payload != undefined){
        var protected_payload = PacketStructure();
        var protected_structure = Packet[packet_format+'_protected'];
        //structure.protected_payload = protected_structure
        var structure_protected = protected_structure
    }

    return {
        type: 'simple',
        name: packet_format,
        structure: structure,
        structure_protected: structure_protected || false,
        packet_data: packet_data,
        packet_decoded: false,

        set: function(key, value, is_protected = false){
            if(is_protected == false){
                this.structure[key].value = value

                if(this.structure[key].length != undefined)
                    this.structure[key].length = value.length
            } else {
                this.structure_protected[key].value = value

                if(this.structure_protected[key].length != undefined)
                    this.structure_protected[key].length = value.length
            }
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

            for(name in this.structure){
                packet[name] = this.structure[name].unpack(payload)
                this.set(name, packet[name])
            }

            if(packet.type == 'dd02'){
                this.name = 'poweron'
            }

            Debug('Unpacking message:', this.name);
            Debug('payload:', this.packet_data.toString('hex'));

            // Lets decrypt the data when the payload is encrypted
            if(packet.protected_payload != undefined){

                packet.protected_payload = packet.protected_payload.slice(0, -32);
                packet.signature = packet.protected_payload.slice(-32)

                var decrypted_payload = device._crypto._decrypt(packet.protected_payload, packet.iv).slice(0, packet.protected_payload_length);
                decrypted_payload = PacketStructure(decrypted_payload)


                var protected_structure = Packet[packet_format+'_protected'];
                packet.protected_payload = {}

                for(name in protected_structure){
                    packet.protected_payload[name] = protected_structure[name].unpack(decrypted_payload)
                    this.set('protected_payload', packet.protected_payload)
                }
            }

            this.packet_decoded = packet;

            return this;
        },

        pack: function(device = false){
            Debug('Packing message:', this.name);
            var payload = PacketStructure()

            for(name in this.structure){
                if(name != 'protected_payload'){
                    this.structure[name].pack(payload)

                } else {
                    var protected_structure = this.structure_protected

                    for(var name_struct in protected_structure){

                        if(this.structure.protected_payload.value != undefined){
                            protected_structure[name_struct].value = this.structure.protected_payload.value[name_struct]
                        }

                        protected_structure[name_struct].pack(protected_payload)
                    }

                    var protected_payload_length = protected_payload.toBuffer().length

                    if(protected_payload.toBuffer().length % 16 > 0)
                    {
                        var padStart = protected_payload.toBuffer().length % 16;
                        var padTotal = (16-padStart);
                        for(var paddingnum = (padStart+1); paddingnum <= 16; paddingnum++)
                        {
                            protected_payload.writeUInt8(padTotal);
                        }
                    }

                    var protected_payload_length_real = protected_payload.toBuffer().length
                    var encrypted_payload = device._crypto._encrypt(protected_payload.toBuffer(), device._crypto.getEncryptionKey(), this.structure.iv.value);
                    payload.writeBytes(encrypted_payload)
                }
            }

            var packet = '';

            if(this.name == 'poweron'){
                packet = this._pack(Buffer.from('DD02', 'hex'), payload.toBuffer(), '')

            } else if(this.name == 'discovery_request'){
                packet = this._pack(Buffer.from('DD00', 'hex'), payload.toBuffer(), Buffer.from('0000', 'hex'))

            } else if(this.name == 'discovery_response'){
                packet = this._pack(Buffer.from('DD01', 'hex'), payload.toBuffer(), '2')

            } else if(this.name == 'connect_request'){

                packet = this._pack(Buffer.from('CC00', 'hex'), payload.toBuffer(), Buffer.from('0002', 'hex'), protected_payload_length, protected_payload_length_real)

                // Sign protected payload
                var protected_payload_hash = device._crypto._sign(packet);
                packet = Buffer.concat([
                    packet,
                    Buffer.from(protected_payload_hash)
                ]);

            } else if(this.name == 'connect_response'){
                packet = this._pack(Buffer.from('CC01', 'hex'), payload.toBuffer(), '2')

            // } else if(this.name == 'connect_request_protected'){
            //     // Pad packet
            //     if(payload.toBuffer().length > 16)
            //     {
            //         var padStart = payload.toBuffer().length % 16;
            //         var padTotal = (16-padStart);
            //         for(var paddingnum = (padStart+1); paddingnum <= 16; paddingnum++)
            //         {
            //             payload.writeUInt8(padTotal);
            //
            //         }
            //     }
            //
            //     var encrypted_payload = device._crypto._encrypt(payload.toBuffer(), device._crypto.getIv());
            //     encrypted_payload = PacketStructure(encrypted_payload)
            //
            //     packet = encrypted_payload.toBuffer();
            } else {
                packet = payload.toBuffer();
            }

            return packet;
        },

        _pack: function(type, payload, version, protected_payload_length = false, protected_payload_length_real = 0)
        {
            var payload_length = PacketStructure();

            if(protected_payload_length !== false)
            {
                payload_length.writeUInt16(payload.length-protected_payload_length_real);
                payload_length = payload_length.toBuffer();

                var protected_length = PacketStructure();
                protected_length.writeUInt16(protected_payload_length);
                protected_length = protected_length.toBuffer();

                return Buffer.concat([
                    type,
                    payload_length,
                    protected_length,
                    version,
                    payload
                ]);

            } else {
                payload_length.writeUInt16(payload.length);
                payload_length = payload_length.toBuffer();

                return Buffer.concat([
                    type,
                    payload_length,
                    Buffer.from('\x00' + String.fromCharCode(version)),
                    payload
                ]);
            }
        },
    }
}
