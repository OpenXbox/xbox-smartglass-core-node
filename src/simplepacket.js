var PacketStructure = require('./packet/structure.js');

//const crypto = require('crypto');
const x509 = require('x509');
var EOL = require('os').EOL;

const PACKET_TYPE_DISCOVERY_REQUEST = Buffer.from('dd00', 'hex');
const PACKET_TYPE_DISCOVERY_RESPONSE = Buffer.from('dd01', 'hex');

const PACKET_TYPE_CONNECT_REQUEST = Buffer.from('cc00', 'hex');
const PACKET_TYPE_CONNECT_RESPONSE = Buffer.from('cc01', 'hex');

module.exports = {

    power_on: function(live_id)
    {
        var payload = PacketStructure();
        payload.writeSGString(live_id);
        var packet = this._pack(Buffer.from('dd02', 'hex'), payload.toBuffer(), Buffer.from('0000', 'hex'))

        return packet;
    },

    discovery: function()
    {
        var payload = PacketStructure();

        payload.writeUInt32(0x00000000);
        payload.writeUInt16('3'); // Client Type: Windows Desktop
        payload.writeUInt16('0');
        payload.writeUInt16('2');

        var packet = this._pack(PACKET_TYPE_DISCOVERY_REQUEST, payload.toBuffer(), Buffer.from('0000', 'hex'))

        return packet;
    },

    // discovery_response: function(name, uuid, certificate)
    // {
    //     var payload = PacketStructure();
    //
    //     payload.writeUInt32(0x00000006);
    //     payload.writeUInt16('1'); // Client Type: Xbox One
    //     payload.writeSGString(name);
    //     payload.writeSGString(Buffer.from(uuid));
    //     payload.writeUInt32('0');
    //     payload.writeUInt16(certificate.length);
    //     payload.writeBytes(certificate);
    //
    //     var packet = this._pack(PACKET_TYPE_DISCOVERY_RESPONSE, payload.toBuffer(), Buffer.from('0002', 'hex'))
    //
    //     return packet;
    // },

    connect_request: function(xbox, uuid, sgcrypto, userhash, jwt)
    {
        var payload = PacketStructure();
        payload.writeBytes(uuid);
        payload.writeUInt16('0');
        payload.writeBytes(sgcrypto.getPublicKey());
        payload.writeBytes(sgcrypto.getIv());

        if(userhash == undefined)
            userhash = '';

        if(jwt == undefined)
            jwt = '';

        var protectedPayload = PacketStructure();
        protectedPayload.writeSGString(userhash); // userhash // 3 bytes
        protectedPayload.writeSGString(jwt); // JWT Token // 3 bytes
        protectedPayload.writeUInt32('0'); // Request_num // 4 bytes
        protectedPayload.writeUInt32('0'); // Start of group // 4 bytes
        protectedPayload.writeUInt32('1'); // End of group // 4 bytes

        var protectedPayloadLength = protectedPayload.toBuffer().toString().length;

        if(protectedPayload.toBuffer().length > 16)
        {
            var padStart = protectedPayload.toBuffer().length % 16;
            var padTotal = (16-padStart);
            for(var paddingnum = (padStart+1); paddingnum <= 16; paddingnum++)
            {
                //var pad = Buffer.from(String.fromCharCode(padTotal));
                //protectedPayload.writeBytes(pad);

                //var pad = PacketStructure();
                protectedPayload.writeUInt8(padTotal);

            }
            //console.log('padding added: ', protectedPayload.toBuffer().toString('hex'), ' ('+protectedPayload.toBuffer().toString().length+')');
        }

        var encryptedPayload = sgcrypto.encrypt(protectedPayload.toBuffer(), sgcrypto.getIv());

        var packet = this._pack(PACKET_TYPE_CONNECT_REQUEST, payload.toBuffer(), 2, Buffer.concat([
            Buffer.from(encryptedPayload, 'hex'),
        ]), protectedPayloadLength);

        var protectedPayloadHash = sgcrypto.sign(packet);

        packet = Buffer.concat([
            packet,
            Buffer.from(protectedPayloadHash.toString('hex'), 'hex')
        ]);

        return packet;
    },

    unpack: function(payload)
    {
        return this._unpack(payload);
    },

    /* Private functions */

    _pack: function(type, payload, version, protectedPayload, protectedPayloadLength)
    {
        if(version == undefined)
            var version = 0;

        var payloadLength = PacketStructure();
        payloadLength.writeUInt16(payload.length);
        payloadLength = payloadLength.toBuffer();

        if(protectedPayload == undefined)
        {
            return Buffer.concat([
                type,
                payloadLength,
                Buffer.from('\x00' + String.fromCharCode(version)),
                payload
            ]);

        } else {
            var encryptedPayloadLength = PacketStructure();
            encryptedPayloadLength.writeUInt16(protectedPayloadLength);
            encryptedPayloadLength = encryptedPayloadLength.toBuffer();

            return Buffer.concat([
                type,
                payloadLength,
                encryptedPayloadLength,
                Buffer.from('\x00' + String.fromCharCode(version)),
                payload,
                protectedPayload
            ]);

        }
    },

    _unpack: function(packet_raw)
    {
        var packet = this._unpack_headers(packet_raw);
        console.log('_unpack - Headers:', packet);

        var type = packet.type;
        var payloadLength = packet.payload_length;
        var version = packet.version;
        var unprotected_payload = packet.unprotected_payload;

        // console.log('type: '+type);
        // console.log('payloadLength: '+payloadLength);
        // console.log('version: '+version);

        // if(type == PACKET_TYPE_DISCOVERY_REQUEST.toString('hex'))
        // {
        //     var recvPayload = PacketStructure(unprotected_payload);
        //
        //     var deviceFlags = recvPayload.readUInt32();
        //     var clientType = recvPayload.readUInt16();
        //     var version = recvPayload.readUInt16();
        //
        //     var data = {
        //         device_flags: deviceFlags,
        //         client_type: clientType,
        //         version: version
        //     }
        //
        //     return {
        //         type: 'DISCOVERY_REQUEST',
        //         payload: data
        //     };
        //
        // } else
        if(type == PACKET_TYPE_DISCOVERY_RESPONSE.toString('hex'))
        {
            var recvPayload = PacketStructure(unprotected_payload);

            var deviceFlags = recvPayload.readUInt32();
            var clientType = recvPayload.readUInt16();
            var consoleName = recvPayload.readSGString();
            var udid = recvPayload.readSGString();
            var lastError = recvPayload.readUInt32();
            var certificateLength = recvPayload.readUInt16();
            var certificate = recvPayload.readBytes(certificateLength);

            try {
                //var certInfo = x509.parseCert('-----BEGIN CERTIFICATE-----'+EOL+certificate.toString('base64').match(/.{0,64}/g).join('\n')+'-----END CERTIFICATE-----');
            }
            catch(error)
            {
                var certInfo = { 'error:': error };
            }

            var data = {
                device_flags: deviceFlags,
                device_type: clientType,
                device_name: consoleName,
                device_udid: udid,
                //device_certificate: certInfo,
                device_certificate_pem: '-----BEGIN CERTIFICATE-----'+EOL+certificate.toString('base64').match(/.{0,64}/g).join('\n')+'-----END CERTIFICATE-----',
                device_certificate_raw: certificate,
                last_error: lastError,
            }

            return {
                type: 'DISCOVERY_RESPONSE',
                payload: data
            };
        // } else if(type == PACKET_TYPE_CONNECT_REQUEST.toString('hex'))
        // {
            // var unprotectedPayload = PacketStructure(unprotected_payload);
            //
            // //console.log('unprotectedPayload', unprotectedPayload);
            // var data = {
            // };
            //
            // return {
            //     type: 'CONNECT_REQUEST',
            //     payload: data
            // };
        } else if(type == PACKET_TYPE_CONNECT_RESPONSE.toString('hex'))
        {
            var unprotectedPayload = PacketStructure(unprotected_payload);

            //console.log('unprotectedPayload', unprotectedPayload);
            var iv = unprotectedPayload.readBytes(16);
            //console.log('payload', packet.protected_payload);
            var data = {
                'iv': iv,
                'protected_payload': packet.protected_payload
            };
            //console.log('connect response: ', data)

            return {
                type: 'CONNECT_RESPONSE',
                payload: data
            };
        }
        return false;
    },

    _unpack_headers: function(packet)
    {
        var packet = new PacketStructure(packet);

        var type = Buffer.from(packet.readBytes(2)).toString('hex');
        var payloadLength = packet.readUInt16();
        var version = packet.readUInt16();

        if((version == 2) || (version == 0))
        {
            //console.log('_unpack_headers: unprotected decode');
            var unprotectedPayload = packet.readBytes(payloadLength);

            return {
                'type': type,
                'payload_length': payloadLength,
                'version': version,
                'unprotected_payload': unprotectedPayload
            }
        } else {
            //console.log('_unpack_headers: protected decode');

            var protectedPayloadLength = version
            version = packet.readUInt16();
            var unprotectedPayload = packet.readBytes(payloadLength);
            var protectedPayload = packet.readBytes(packet._totalLength-packet._offset-32);
            var signature = packet.readBytes(32);

            // @TODO: Add validation of incoming packet

            return {
                'type': type,
                'payload_length': payloadLength,
                'protectedpayload_length': protectedPayloadLength,
                'version': version,
                'unprotected_payload': unprotectedPayload,
                'protected_payload': protectedPayload,
                'signature': signature
            }
        }
    }
}
