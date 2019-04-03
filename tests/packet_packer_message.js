var assert = require('assert');
var fs = require('fs');
var Packer = require('../src/packet/packer');
var Xbox = require('../src/xbox');

var secret = Buffer.from('82bba514e6d19521114940bd65121af2'+'34c53654a8e67add7710b3725db44f77'+'30ed8e3da7015a09fe0f08e9bef3853c0506327eb77c9951769d923d863a2f5e', 'hex');
var certificate = Buffer.from('041db1e7943878b28c773228ebdcfb05b985be4a386a55f50066231360785f61b60038caf182d712d86c8a28a0e7e2733a0391b1169ef2905e4e21555b432b262d', 'hex');

var packets = {
    'message.console_status': 'tests/data/packets/console_status',
}

var device = Xbox('127.0.0.1', certificate);
device.loadCrypto(certificate, secret);

describe('packet/packer/message', function(){

    it('should unpack a console_status packet', function(){
        var data_packet = fs.readFileSync('tests/data/packets/console_status')

        var poweron_request = Packer(data_packet)
        var message = poweron_request.unpack(device)

        assert.deepStrictEqual(message.type, 'message')
        assert.deepStrictEqual(message.packet_decoded.flags.version, '2')
        assert.deepStrictEqual(message.packet_decoded.flags.need_ack, true)
        assert.deepStrictEqual(message.packet_decoded.flags.is_fragment, false)
        assert.deepStrictEqual(message.packet_decoded.flags.type, 'console_status')
        assert.deepStrictEqual(message.packet_decoded.channel_id, 0)
        assert.deepStrictEqual(message.packet_decoded.protected_payload.live_tv_provider, 0)
        assert.deepStrictEqual(message.packet_decoded.protected_payload.major_version, 10)
        assert.deepStrictEqual(message.packet_decoded.protected_payload.minor_version, 0)
        assert.deepStrictEqual(message.packet_decoded.protected_payload.build_number, 14393)
        assert.deepStrictEqual(message.packet_decoded.protected_payload.locale, 'en-US')

        assert.deepStrictEqual(message.packet_decoded.protected_payload.apps[0].title_id, 714681658)
        assert.deepStrictEqual(message.packet_decoded.protected_payload.apps[0].flags, Buffer.from('8003', 'hex'))

        assert.deepStrictEqual(message.packet_decoded.protected_payload.apps[0].product_id, Buffer.from('00000000000000000000000000000000', 'hex'))
        assert.deepStrictEqual(message.packet_decoded.protected_payload.apps[0].sandbox_id, Buffer.from('00000000000000000000000000000000', 'hex'))
        assert.deepStrictEqual(message.packet_decoded.protected_payload.apps[0].aum_id, 'Xbox.Home_8wekyb3d8bbwe!Xbox.Home.Application')
    });

    describe('should repack messages correctly', function(){
        for(packetType in packets) {
            it('should repack a valid '+packetType+' packet', function(){
                var data_packet = fs.readFileSync(packets[packetType])

                var discovery_request = Packer(data_packet)
                var message = discovery_request.unpack(device)

                var repacked = message.pack(device);

                //assert.deepStrictEqual(data_packet, Buffer.from(repacked))
            });
        }
    });
})
