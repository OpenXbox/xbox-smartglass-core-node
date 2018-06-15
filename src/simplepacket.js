var PacketStructure = require('./packet/structure.js');

const x509 = require('x509');
var EOL = require('os').EOL;

const PACKET_TYPE_DISCOVERY_REQUEST = new Buffer('dd00', 'hex');
const PACKET_TYPE_DISCOVERY_RESPONSE = new Buffer('dd01', 'hex');

module.exports = {

    power_on: function(live_id)
    {
        var payload = PacketStructure();
        payload.writeSGString(live_id);
        var packet = this._pack(new Buffer('dd02', 'hex'), payload.toBuffer(), new Buffer('0000', 'hex'))

        return packet;
    },

    discovery: function()
    {
        var payload = PacketStructure();

        payload.writeUInt32(0x00000000);
        payload.writeUInt16('3'); // Client Type: Windows Desktop
        payload.writeUInt16('0');
        payload.writeUInt16('2');

        var packet = this._pack(PACKET_TYPE_DISCOVERY_REQUEST, payload.toBuffer(), new Buffer('0000', 'hex'))

        return packet;
    },

    unpack: function(payload)
    {
        return this._unpack(payload);
    },

    /* Private functions */

    _pack: function(type, payload, version = 0)
    {
        var payloadLength = Buffer.concat([
            new Buffer('00', 'hex'),
            new Buffer(String.fromCharCode(payload.length))
        ]);

        return Buffer.concat([type, payloadLength, new Buffer('\x00' + String.fromCharCode(version)), payload])
    },

    _unpack: function(payload)
    {
        var type = payload.slice(0,2).toString('hex');
        var payloadLength = payload.readUInt16BE(2);
        var version = payload.readUInt16BE(4);
        var unpackedPayload = payload.slice(6);

        // console.log('type: '+type);
        // console.log('payloadLength: '+payloadLength);
        // console.log('version: '+version);

        if(type == PACKET_TYPE_DISCOVERY_RESPONSE.toString('hex'))
        {
            var recvPayload = PacketStructure(unpackedPayload);

            var deviceFlags = recvPayload.readUInt32();
            var clientType = recvPayload.readUInt16();
            var consoleName = recvPayload.readSGString();
            var udid = recvPayload.readSGString();
            var lastError = recvPayload.readUInt32();
            var certificate = recvPayload.readSGString(true);

            try {
                var certInfo = x509.parseCert('-----BEGIN CERTIFICATE-----'+EOL+certificate.toString('base64').match(/.{0,64}/g).join('\n')+'-----END CERTIFICATE-----');
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
                device_certificate: certInfo,
                device_certificate_pem: '-----BEGIN CERTIFICATE-----'+EOL+certificate.toString('base64').match(/.{0,64}/g).join('\n')+'-----END CERTIFICATE-----',
                device_certificate_raw: certificate,
                last_error: deviceFlags,
            }

            return {
                type: 'DISCOVERY_RESPONSE',
                payload: data
            };
        }
        return false;
    }
}
