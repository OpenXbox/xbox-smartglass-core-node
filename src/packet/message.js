const PacketStructure = require('./structure');
var hexToBin = require('hex-to-binary');
var baseConvert = require('baseconvert');
//const utf8 = require('utf8');
//const jsesc = require('jsesc');
const crypto = require('crypto');

module.exports = function(xbox, packet)
{
    if(packet == undefined)
        packet = Buffer.from('');
    else
        packet = PacketStructure(packet);

    return {
        _packet: packet,
        _xbox: xbox,

        unpack: function(payload)
        {
            return this._unpack(payload);
        },

        pack: function(type, participantId, payload)
        {
            return this._pack(type, participantId, payload);
        },

        _unpack: function(payload)
        {
            var payload = new PacketStructure(payload);

            var type = payload.readBytes(2);
            var protectedPayloadLength = payload.readUInt16();
            var senquenceNumber = payload.readUInt32();
            var targetId = payload.readUInt32();
            var sourceId = payload.readUInt32();
            var packetFlags = payload.readBytes(2);
            var channelId = payload.readUInt64();

            console.log('_unpack - type:', type.toString('hex'));
            console.log('_unpack - targetId:', targetId);
            console.log('_unpack - sourceId:', sourceId);
            console.log('_unpack - channelId:', channelId);
            console.log('_unpack - protectedPayloadLength:', protectedPayloadLength);

            console.log('_unpack - packet hex:', payload.toBuffer().toString('hex'));

            console.log('_unpack - read bytes packed:', payload.toBuffer().length-payload._offset-32, payload);
            var protectedPayload = payload.toBuffer().slice(payload._offset, -32);
            //protectedPayload = protectedPayload.slice(protectedPayload.length-protectedPayloadLength, protectedPayloadLength);
            var signature = payload.toBuffer().slice(-32);

            //var iv = payload.toBuffer().slice(-32).slice(0, 16);
            var iv = payload.toBuffer().slice(0, 16);
            //var iv = this._xbox._crypto.getIv();

            var signature_verify = crypto.createHmac('sha256', this._xbox._crypto.getHmac()).update(payload.toBuffer()).digest('hex');
            console.log('---_unpack - Signature status:', signature_verify, '==', signature.toString('hex'))

            console.log('---_unpack - IV:', iv);
            console.log('---_unpack - Signature:', signature);
            //iv = this._xbox._crypto.getIv(iv);
            console.log('---_unpack - IV:', iv);
            //var iv = this._xbox._crypto.getIv();
            // console.log('_unpack - iv:', iv);


            console.log('protectedPayload', protectedPayload.toString('hex'));
            var protectedPayload = Buffer.from(protectedPayload);

            //console.log('dec payload:', Buffer.from(this._xbox._crypto.decrypt(protectedPayload, iv).toString('hex')));
            // var decryptedPayload = this._removePadding(Buffer.from(this._xbox._crypto.decrypt(protectedPayload, signature)));
            //
            // // Perform payload size check
            // if(decryptedPayload.toString().length != protectedPayloadLength)
            //    console.log('_unpack - decryptedPayload size mismatch ('+decryptedPayload.toString().length+' != '+protectedPayloadLength+')')
            //
            // console.log('_unpack: decryptedPayload:', Buffer.from(decryptedPayload).toString('hex'));

            console.log('_unpack msgType:', type);
            var decryptedPayload = this.decodePayload('ConsoleStatus', protectedPayload, iv, protectedPayloadLength);

            return {
                'type': type,
                'payload_length': protectedPayloadLength,
                'number': senquenceNumber,
                'target_id': targetId,
                'source_id': sourceId,
                'flags': this.readFlags(packetFlags),
                'channel': channelId,
                'protected_payload': protectedPayload.toString('hex'),
                'decrypted_payload': decryptedPayload,
                'signature': signature
            }
        },

        _removePadding(payload)
        {
            console.log('_removePadding - payload:', payload.toString('hex'));
            var length = Buffer.from(payload.charAt(payload.length - 1));

            console.log('_removePadding - length:', length);
            //length = parseInt(length.toString('hex'));
            length = length.readUInt8(0);

            if(length > 0 && length < 16)
            {
                console.log('_removePadding - padding length:', length);
                console.log('_removePadding - return:', Buffer.from(payload.slice(0, payload.length-length)).toString('hex'));

                return Buffer.from(payload.slice(0, payload.length-length));
            } else {
                console.log('_removePadding - No padding needed..('+length+')');
                return payload;
            }
        },

        _pack: function(type, participantId, payload)
        {
            var packedPayload = new PacketStructure();
            var payload = new PacketStructure(payload);

            packedPayload.writeUInt16(0xD00D); // Set type
            packedPayload.writeUInt16(payload.toBuffer().length); // Set payloadLength
            packedPayload.writeUInt32(this._xbox.get_requestnum()); // Set request number
            packedPayload.writeUInt32(0); // Set client id
            packedPayload.writeUInt32(participantId); // Set source id

            var typeDecimal = baseConvert.dec2bin(type);
            var typeFormat = '0000000000';
            var messageTypeDecimal = typeFormat.substring(0, typeFormat.length - typeDecimal.length) + typeDecimal;

            var flags = baseConvert.bin2hex("10"+"00"+"00"+messageTypeDecimal)
            packedPayload.writeBytes(Buffer.from(flags, 'hex'));

            packedPayload.writeBytes(Buffer.from('0000000000000000', 'hex'));

            if(payload.toBuffer().length != 16)
            {
                var padStart = payload.toBuffer().length % 16;
                var padTotal = (16-padStart);
                for(var paddingnum = (padStart+1); paddingnum <= 16; paddingnum++)
                {
                    payload.setOffset(payload._totalLength);
                    payload.writeUInt8(padTotal);
                }
            }

            var packetSign = payload.toBuffer().slice(0, 16);
            console.log('packetSign', packetSign);

            var iv = Buffer.from(this._xbox._crypto.encrypt(packetSign), 'hex');

            var encryptedPayload = this._xbox._crypto.encrypt(payload.toBuffer(), iv);
            packedPayload.writeBytes(Buffer.from(encryptedPayload, 'hex'));

            var protectedPayloadHash = this._xbox._crypto.sign(packedPayload.toBuffer());
            packedPayload.writeBytes(Buffer.from(protectedPayloadHash, 'hex'));

            return packedPayload;
        },

        getMsgType: function(type)
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
                0x1E: "ConsoleStatus",
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
        },

        readFlags: function(flags)
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

            var type = this.getMsgType(parseInt(flags.slice(4, 16), 2))

            return {
                'version': parseInt(flags.slice(0, 2), 2).toString(),
                'need_ack': need_ack,
                'is_fragment': is_fragment,
                'type': type
            }
        },

        decodePayload: function(type, payload, iv, payloadLength)
        {
            // payload = this._removePadding(payload);
            console.log('decodePayload input payload:', Buffer.from(payload).toString('hex'));
            console.log('decodePayload iv:', iv);

            iv = Buffer.from(this._xbox._crypto.encrypt(iv, undefined, true), 'hex');

            console.log('decodePayload iv:', iv);

            var decrypted_payload_padded = Buffer.from(this._xbox._crypto.decrypt(payload, iv), 'hex');
            var payload_padding = (decrypted_payload_padded.length-payloadLength);
            // var decrypted_payload = decrypted_payload_padded.slice(payload_padding);
            var decrypted_payload = decrypted_payload_padded;

            console.log('decodePayload payload padding:', payload_padding);
            console.log('decodePayload output payload padded:', Buffer.from(decrypted_payload_padded).toString('hex'));
            // console.log('decodePayload output payload no pad:', Buffer.from(decrypted_payload).toString('hex'));


            // var decryptedPayload = this._removePadding(Buffer.from(this._xbox._crypto.decrypt(protectedPayload, signature)));
            //
            // // Perform payload size check
            // if(decryptedPayload.toString().length != protectedPayloadLength)
            //    console.log('_unpack - decryptedPayload size mismatch ('+decryptedPayload.toString().length+' != '+protectedPayloadLength+')')
            //
            // console.log('_unpack: decryptedPayload:', Buffer.from(decryptedPayload).toString('hex'));

            mypayload = new PacketStructure(decrypted_payload);

            // console.log('mypayload hex', mypayload.toBuffer('hex'));
            console.log('mypayload', mypayload.toBuffer().toString('hex'));
            // console.log('mypayload string', mypayload.toBuffer('utf8').toString());

            if(type == 'ConsoleStatus')
            {

                var liveTvProvider = mypayload.readUInt32();
                var majorVersion = mypayload.readUInt32();
                var minorVersion = mypayload.readUInt32();
                var buildNumber = mypayload.readUInt32();

                var locale = mypayload.readSGString();
                var active_apps_count = parseInt(mypayload.readUInt16(), 2);
                //var locale = mypayload.readBytes(50);

                var apps = []
                var app = {
                    title_id: mypayload.readUInt32(),
                    flags: mypayload.readBytes(2),
                    product_id: mypayload.readBytes(16),
                    sandbox_id: mypayload.readBytes(16),
                    uam_id: mypayload.readSGString().toString(),
                }
                console.log('app:', app)
                apps.push(app)

                console.log('decode payload', decrypted_payload);
                //decoder

                var version = majorVersion+'.'+minorVersion+'.'+buildNumber;

                var data = {
                    'packet_hex': mypayload.toBuffer().toString('hex'),
                    'tv_provider': liveTvProvider,
                    'version': version,
                    'locale': locale.toString(),
                    'apps': apps
                }

                return data;
            }

            return false;
        }
    };
}
