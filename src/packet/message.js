var PacketStructure = require('./structure');
var Packer = require('./packer');
var hexToBin = require('hex-to-binary');

module.exports = function(type, packet_data = false){
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
        sgArray: function(structure, value){
            return {
                value: value,
                structure: structure,
                pack: function(packet_structure){
                    // @Todo

                    packet_structure.writeUInt16(this.value.length);

                    var array_structure = Packet[this.structure];
                    for(var index in this.value)
                    {
                        for(var name in array_structure){
                            array_structure[name].value = this.value[index][name]
                            packet_structure = array_structure[name].pack(packet_structure)
                        }
                    }

                    return packet_structure;
                },
                unpack: function(packet_structure){
                    var array_count = packet_structure.readUInt16();
                    var array = []

                    for(var i = 0; i < array_count; i++) {
                        var array_structure = Packet[this.structure];
                        var item = {}

                        for(var name in array_structure){
                            item[name] = array_structure[name].unpack(packet_structure)
                        }

                        array.push(item)
                    }

                    this.value = array
                    return this.value;
                }
            }
        },
        sgList: function(structure, value){
            return {
                value: value,
                structure: structure,
                pack: function(packet_structure){

                    packet_structure.writeUInt32(this.value.length);

                    var array_structure = Packet[this.structure];
                    for(var index in this.value)
                    {
                        for(name in array_structure){
                            array_structure[name].value = this.value[index][name]
                            packet_structure = array_structure[name].pack(packet_structure)
                        }
                    }

                    return packet_structure;
                },
                unpack: function(packet_structure){
                    var array_count = packet_structure.readUInt32();
                    var array = []

                    for(var i = 0; i < array_count; i++) {
                        var array_structure = Packet[this.structure];
                        var item = {}

                        for(name in array_structure){
                            item[name] = array_structure[name].unpack(packet_structure)
                        }

                        array.push(item)
                    }

                    this.value = array
                    return this.value;
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
            flags: Type.bytes(2),
            product_id: Type.bytes(16, ''),
            sandbox_id: Type.bytes(16, ''),
            aum_id: Type.sgString('')
        },
        power_off: {
            liveid: Type.sgString(''),
        },
        acknowledge: {
            low_watermark: Type.uInt32('0'),
            processed_list: Type.sgList('_acknowledge_list', []),
            rejected_list: Type.sgList('_acknowledge_list', []),
        },
        _acknowledge_list: {
            id: Type.uInt32('0'),
        },
        local_join: {
            client_type: Type.uInt16('3'),
            native_width: Type.uInt16('1080'),
            native_height: Type.uInt16('1920'),
            dpi_x: Type.uInt16('96'),
            dpi_y: Type.uInt16('96'),
            device_capabilities: Type.bytes(8, Buffer.from('ffffffffffffffff', 'hex')),
            client_version: Type.uInt32('15'),
            os_major_version: Type.uInt32('6'),
            os_minor_version: Type.uInt32('2'),
            display_name: Type.sgString('Xbox-Smartglass-Node'),
        },
    };

    function getMsgType(type)
    {
        var message_types = {
            0x1: "acknowledge",
            0x2: "Group",
            0x3: "local_join",
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
            0x39: "power_off",
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

        var need_ack = false
        var is_fragment = false;

        if(flags.slice(2, 3) == 1)
            need_ack = true;

        if(flags.slice(3, 4) == 1)
            is_fragment = true;


        var type = getMsgType(parseInt(flags.slice(4, 16), 2))

        return {
            'version': parseInt(flags.slice(0, 2), 2).toString(),
            'need_ack': need_ack,
            'is_fragment': is_fragment,
            'type': type
        }
    }

    function setFlags(type)
    {
        var message_flags = {
            acknowledge: Buffer.from('8001', 'hex'),
            0x2: "Group",
            local_join: Buffer.from('2003', 'hex'),
            0x5: "StopActivity",
            0x19: "AuxilaryStream",
            0x1A: "ActiveSurfaceChange",
            0x1B: "Navigate",
            0x1C: "Json",
            0x1D: "Tunnel",
            console_status: Buffer.from('a01e', 'hex'),
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
            power_off: Buffer.from('a039', 'hex'),
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

        return message_flags[type]
    }

    var structure = Packet[type];

    return {
        type: 'message',
        name: type,
        structure: structure,
        packet_data: packet_data,
        packet_decoded: false,

        channel_id: Buffer.from('\x00\x00\x00\x00\x00\x00\x00\x00'),

        setChannel: function(channel){
            this.channel_id = Buffer.from(channel)
        },

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
                channel_id: payload.readBytes(8),
                protected_payload: payload.readBytes()
            }

            this.setChannel(packet.channel_id);

            packet.name = packet.flags.type
            this.name = packet.flags.type
            //console.log('packet type:', packet)
            packet.protected_payload = Buffer.from(packet.protected_payload.slice(0, -32));
            packet.signature = packet.protected_payload.slice(-32)

            // Lets decrypt the data when the payload is encrypted
            if(packet.protected_payload != undefined){
                var key = device._crypto._encrypt(this.packet_data.slice(0, 16), device._crypto.getIv());

                var decrypted_payload = device._crypto._decrypt(packet.protected_payload, key);
                packet.decrypted_payload = PacketStructure(decrypted_payload).toBuffer()
                decrypted_payload = PacketStructure(decrypted_payload)

                this.structure = Packet[packet.name]
                var protected_structure = Packet[packet.name]
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

            var header = PacketStructure()
            header.writeBytes(Buffer.from('d00d', 'hex'))
            header.writeUInt16(payload.toBuffer().length)
            header.writeUInt32(device._request_num)
            header.writeUInt32(device._target_participant_id)
            header.writeUInt32(device._source_participant_id)
            header.writeBytes(setFlags(this.name))
            header.writeBytes(this.channel_id)

            if(payload.toBuffer().length % 16 > 0)
            {
                var padStart = payload.toBuffer().length % 16;
                var padTotal = (16-padStart);
                for(var paddingnum = (padStart+1); paddingnum <= 16; paddingnum++)
                {
                    payload.writeUInt8(padTotal);
                }
            }

            var key = device._crypto._encrypt(header.toBuffer().slice(0, 16), device._crypto.getIv());
            var encrypted_payload = device._crypto._encrypt(payload.toBuffer(), device._crypto.getEncryptionKey(), key);

            var packet = Buffer.concat([
                header.toBuffer(),
                encrypted_payload
            ]);

            var protected_payload_hash = device._crypto._sign(packet);
            packet = Buffer.concat([
                packet,
                Buffer.from(protected_payload_hash)
            ]);

            return packet;
        }
    }
}
