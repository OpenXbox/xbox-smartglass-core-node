var PacketStructure = require('./structure');
var Packer = require('./packer');
var hexToBin = require('hex-to-binary');

module.exports = function(packet_data = false){
    var Type = {
        uInt32: function(value){
            return {
                value: value,
                pack: function(packet_structure){
                    return packet_structure.writeUInt32(this.value);
                },
                unpack: function(packet_structure){
                    this.value = packet_structure.readUInt32();
                    return this.value
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
                    this.value = packet_structure.readUInt16();
                    return this.value
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
                    this.value = packet_structure.readBytes(length);
                    return this.value
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
                    this.value = packet_structure.readSGString().toString();
                    return this.value
                }
            }
        },
        flags: function(length, value){

            return {
                value: value,
                length: length,
                pack: function(packet_structure){
                    return packet_structure.writeBytes(setFlags(this.value));
                },
                unpack: function(packet_structure){
                    this.value = readFlags(packet_structure.readBytes(this.length));
                    return this.value
                }
            }
        },
        sgArray: function(value){
            return {
                value: value,
                pack: function(packet_structure){
                    // @Todo
                    packet_structure.writeUInt16(value.length);
                    var array_structure = Packet[this.value];

                    for(name in array_structure){
                        packet_structure = array_structure[name].pack(packet_structure)
                    }

                    return packet_structure;



                    return packet_structure.writeSGString(this.value);
                },
                unpack: function(packet_structure){
                    var array_count = packet_structure.readUInt16();
                    var array = []

                    for(i = 0; i < array_count; i++) {
                        var array_structure = Packet[this.value];
                        var item = {}

                        for(name in array_structure){
                            item[name] = array_structure[name].unpack(packet_structure)
                        }

                        array.push(item)
                    }

                    return array;
                }
            }
        }
    }

    var Packet = {
        console_status: {
            live_tv_provider: Type.uInt32('0'),
            major_version: Type.uInt32('0'),
            minor_version: Type.uInt32('0'),
            build_number: Type.uInt32('0'),
            locale: Type.sgString('en-US'),
            apps: Type.sgArray('_active_apps')
        },
        _active_apps: {
            title_id: Type.uInt32('0'),
            //flags: Type.flags(2, {}),
            flags: Type.bytes(2),
            product_id: Type.bytes(16, ''),
            sandbox_id: Type.bytes(16, ''),
            aum_id: Type.sgString('')
        },
    };

    function getMsgType(type)
    {
        var message_types = {
            0x1: "Ack",
            0x2: "Group",
            0x3: "LocalJoin",
            0x5: "StopActivity",
            0x19: "AuxilaryStream",
            0x1A: "ActiveSurfaceChange",
            0x1B: "Navigate",
            0x1C: "Json",
            0x1D: "Tunnel",
            0x1E: "console_status",
            0x1F: "TitleTextConfiguration",
            0x20: "TitleTextInput",
            0x21: "TitleTextSelection",
            0x22: "MirroringRequest",
            0x23: "TitleLaunch",
            0x26: "StartChannelRequest",
            0x27: "StartChannelResponse",
            0x28: "StopChannel",
            0x29: "System",
            0x2A: "Disconnect",
            0x2E: "TitleTouch",
            0x2F: "Accelerometer",
            0x30: "Gyrometer",
            0x31: "Inclinometer",
            0x32: "Compass",
            0x33: "Orientation",
            0x36: "PairedIdentityStateChanged",
            0x37: "Unsnap",
            0x38: "GameDvrRecord",
            0x39: "PowerOff",
            0xF00: "MediaControllerRemoved",
            0xF01: "MediaCommand",
            0xF02: "MediaCommandResult",
            0xF03: "MediaState",
            0xF0A: "Gamepad",
            0xF2B: "SystemTextConfiguration",
            0xF2C: "SystemTextInput",
            0xF2E: "SystemTouch",
            0xF34: "SystemTextAck",
            0xF35: "SystemTextDone"
        }

        return message_types[type];
    }

    function readFlags(flags)
    {
        flags = hexToBin(flags.toString('hex'));

        if(flags.slice(2, 3) == 1)
            var need_ack = true;
        else
            var need_ack = false;

        if(flags.slice(3, 4) == 1)
            var is_fragment = true;
        else
            var is_fragment = false;

        var type = getMsgType(parseInt(flags.slice(4, 16), 2))

        return {
            'version': parseInt(flags.slice(0, 2), 2).toString(),
            'need_ack': need_ack,
            'is_fragment': is_fragment,
            'type': type
        }
    }

    function setFlags(flags)
    {
        return Buffer.from('8003', 'hex')
    }

    return {
        type: 'message',
        //name: packet_format,
        // structure: false,
        packet_data: packet_data,
        packet_decoded: false,

        set: function(key, value, subkey = false){
            if(subkey == false){
                this.structure[key].value = value
            } else {
                this.structure[subkey][key].value = value
            }
        },

        unpack: function(device = undefined){
            var payload = PacketStructure(this.packet_data)

            var packet = {
                type: payload.readBytes(2).toString('hex'),
                payload_length: payload.readUInt16(),
                sequence_number: payload.readUInt32(),
                target_participant_id: payload.readUInt32(),
                source_participant_id: payload.readUInt32(),
                flags: readFlags(payload.readBytes(2)),
                channel_id: payload.readUInt64(),
                protected_payload: payload.readBytes()
            }

            packet['name'] = packet.flags.type
            packet['protected_payload'] = packet.protected_payload.slice(0, -32);
            packet['signature'] = packet.protected_payload.slice(-32)

            // Lets decrypt the data when the payload is encrypted
            if(packet.protected_payload != undefined){
                var iv = device._crypto._encrypt(this.packet_data.slice(0, 16), device._crypto.getIv());
                var decrypted_payload = device._crypto._decrypt(packet.protected_payload, iv);
                decrypted_payload = PacketStructure(decrypted_payload)

                this.structure = Packet[packet.name];

                var protected_structure = Packet[packet.name];
                packet['protected_payload'] = {}

                for(name in protected_structure){
                    packet.protected_payload[name] = protected_structure[name].unpack(decrypted_payload)
                }
            }

            this.packet_decoded = packet;

            return this;
        },

        pack: function(device){
            var payload = PacketStructure()

            for(name in this.structure){
                this.structure[name].pack(payload)
            }

            //var packet = this._pack(Buffer.from('D001', 'hex'), payload.toBuffer(), Buffer.from('0002', 'hex'))

            var header = PacketStructure()
            header.writeBytes(Buffer.from('d00d', 'hex'))
            header.writeUInt16(payload.toBuffer().length)
            header.writeUInt32('5') // sequence_number
            header.writeUInt32('31') // target_participant_id
            header.writeUInt32('0') // source_participant_id
            header.writeBytes(Buffer.from('a01e', 'hex')) // flags: readFlags(payload.readBytes(2)),
            header.writeUInt32('0') // channel_id
            header.writeUInt32('0') // channel_id

            var payloadLength = PacketStructure();
            payloadLength.writeUInt16(payload.toBuffer().length);
            payloadLength = payloadLength.toBuffer();

            // Pad packet
            // if(payload.toBuffer().length > 16)
            // {
            //     var padStart = payload.toBuffer().length % 16;
            //     var padTotal = (16-padStart);
            //     for(var paddingnum = (padStart+1); paddingnum <= 16; paddingnum++)
            //     {
            //         payload.writeUInt8(padTotal);
            //
            //     }
            // }

            var iv = device._crypto._encrypt(payload.toBuffer().slice(0, 16), device._crypto.getIv(), device._crypto.getIv());
            var encrypted_payload = device._crypto._encrypt(payload.toBuffer(), iv);

            return Buffer.concat([
                header.toBuffer(),
                encrypted_payload
            ]);

            return packet;
        }
    }
}
