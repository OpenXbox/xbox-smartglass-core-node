var assert = require('assert');
var fs = require('fs');
const Packer = require('../src/packet/packer');
var Xbox = require('../src/xbox');

var secret = Buffer.from('82bba514e6d19521114940bd65121af2'+'34c53654a8e67add7710b3725db44f77'+'30ed8e3da7015a09fe0f08e9bef3853c0506327eb77c9951769d923d863a2f5e', 'hex');
var certificate = Buffer.from('041db1e7943878b28c773228ebdcfb05b985be4a386a55f50066231360785f61b60038caf182d712d86c8a28a0e7e2733a0391b1169ef2905e4e21555b432b262d', 'hex');

var packets = [
    {'message.console_status': 'tests/data/packets/console_status'},
    {'message.power_off': 'tests/data/packets/poweroff'},
    {'message.acknowledgement': 'tests/data/packets/acknowledge'},
    {'message.local_join': 'tests/data/packets/local_join'},
    {'message.disconnect': 'tests/data/packets/disconnect'}
]

var device = Xbox('127.0.0.1', certificate);
device.loadCrypto(certificate.toString('hex'), secret.toString('hex'));

describe('packet/packer/message', function(){

    it('should unpack a console_status packet', function(){
        var data_packet = fs.readFileSync('tests/data/packets/console_status')

        var poweron_request = Packer(data_packet)
        var message = poweron_request.unpack(device)

        assert.deepStrictEqual(message.type, 'message')
        assert.deepStrictEqual(message.packet_decoded.sequence_number, 5)
        assert.deepStrictEqual(message.packet_decoded.source_participant_id, 0)
        assert.deepStrictEqual(message.packet_decoded.target_participant_id, 31)

        assert.deepStrictEqual(message.packet_decoded.flags.version, '2')
        assert.deepStrictEqual(message.packet_decoded.flags.need_ack, true)
        assert.deepStrictEqual(message.packet_decoded.flags.is_fragment, false)
        assert.deepStrictEqual(message.packet_decoded.flags.type, 'console_status')
        assert.deepStrictEqual(message.packet_decoded.channel_id, Buffer.from('\x00\x00\x00\x00\x00\x00\x00\x00'))
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

    it('should unpack a poweroff packet', function(){
        var data_packet = fs.readFileSync('tests/data/packets/poweroff')

        var poweroff_request = Packer(data_packet)
        var message = poweroff_request.unpack(device)

        assert.deepStrictEqual(message.type, 'message')
        assert.deepStrictEqual(message.packet_decoded.sequence_number, 1882)
        assert.deepStrictEqual(message.packet_decoded.source_participant_id, 2)
        assert.deepStrictEqual(message.packet_decoded.target_participant_id, 0)

        assert.deepStrictEqual(message.packet_decoded.flags.version, '2')
        assert.deepStrictEqual(message.packet_decoded.flags.need_ack, true)
        assert.deepStrictEqual(message.packet_decoded.flags.is_fragment, false)
        assert.deepStrictEqual(message.packet_decoded.flags.type, 'power_off')
        assert.deepStrictEqual(message.packet_decoded.channel_id, Buffer.from('\x00\x00\x00\x00\x00\x00\x00\x00'))

        assert.deepStrictEqual(message.packet_decoded.protected_payload.liveid, 'FD00112233FFEE66')
    });

    it('should unpack an acknowledge packet', function(){
        var data_packet = fs.readFileSync('tests/data/packets/acknowledge')

        var acknowledge = Packer(data_packet)
        var message = acknowledge.unpack(device)

        assert.deepStrictEqual(message.type, 'message')
        assert.deepStrictEqual(message.packet_decoded.sequence_number, 1)
        assert.deepStrictEqual(message.packet_decoded.source_participant_id, 0)
        assert.deepStrictEqual(message.packet_decoded.target_participant_id, 31)

        assert.deepStrictEqual(message.packet_decoded.flags.version, '2')
        assert.deepStrictEqual(message.packet_decoded.flags.need_ack, false)
        assert.deepStrictEqual(message.packet_decoded.flags.is_fragment, false)
        assert.deepStrictEqual(message.packet_decoded.flags.type, 'acknowledge')
        assert.deepStrictEqual(message.packet_decoded.channel_id, Buffer.from('\x10\x00\x00\x00\x00\x00\x00\x00'))

        assert.deepStrictEqual(message.packet_decoded.protected_payload.low_watermark, 0)
        assert.deepStrictEqual(message.packet_decoded.protected_payload.processed_list.length, 1)
        assert.deepStrictEqual(message.packet_decoded.protected_payload.rejected_list.length, 0)
        assert.deepStrictEqual(message.packet_decoded.protected_payload.processed_list[0].id, 1)
    });

    it('should unpack a local_join packet', function(){
        var data_packet = fs.readFileSync('tests/data/packets/local_join')

        var local_join = Packer(data_packet)
        var message = local_join.unpack(device)

        assert.deepStrictEqual(message.type, 'message')
        assert.deepStrictEqual(message.packet_decoded.sequence_number, 1)
        assert.deepStrictEqual(message.packet_decoded.source_participant_id, 31)
        assert.deepStrictEqual(message.packet_decoded.target_participant_id, 0)

        assert.deepStrictEqual(message.packet_decoded.flags.version, '0')
        assert.deepStrictEqual(message.packet_decoded.flags.need_ack, true)
        assert.deepStrictEqual(message.packet_decoded.flags.is_fragment, false)
        assert.deepStrictEqual(message.packet_decoded.flags.type, 'local_join')
        assert.deepStrictEqual(message.packet_decoded.channel_id, Buffer.from('\x00\x00\x00\x00\x00\x00\x00\x00'))

        assert.deepStrictEqual(message.packet_decoded.protected_payload.client_type, 8)
        assert.deepStrictEqual(message.packet_decoded.protected_payload.native_width, 600)
        assert.deepStrictEqual(message.packet_decoded.protected_payload.native_height, 1024)
        assert.deepStrictEqual(message.packet_decoded.protected_payload.dpi_x, 160)
        assert.deepStrictEqual(message.packet_decoded.protected_payload.dpi_y, 160)
        assert.deepStrictEqual(message.packet_decoded.protected_payload.device_capabilities, Buffer.from('ffffffffffffffff', 'hex'))
        assert.deepStrictEqual(message.packet_decoded.protected_payload.client_version, 133713371)
        assert.deepStrictEqual(message.packet_decoded.protected_payload.os_major_version, 42)
        assert.deepStrictEqual(message.packet_decoded.protected_payload.os_minor_version, 0)
        assert.deepStrictEqual(message.packet_decoded.protected_payload.display_name, 'package.name.here')
    });

    it('should unpack a disconnect packet', function(){
        var data_packet = fs.readFileSync('tests/data/packets/disconnect')

        var poweroff_request = Packer(data_packet)
        var message = poweroff_request.unpack(device)
        console.log(message)

        assert.deepStrictEqual(message.type, 'message')
        assert.deepStrictEqual(message.packet_decoded.sequence_number, 57)
        assert.deepStrictEqual(message.packet_decoded.source_participant_id, 31)
        assert.deepStrictEqual(message.packet_decoded.target_participant_id, 0)

        assert.deepStrictEqual(message.packet_decoded.flags.version, '2')
        assert.deepStrictEqual(message.packet_decoded.flags.need_ack, false)
        assert.deepStrictEqual(message.packet_decoded.flags.is_fragment, false)
        assert.deepStrictEqual(message.packet_decoded.flags.type, 'disconnect')
        assert.deepStrictEqual(message.packet_decoded.channel_id, Buffer.from('\x00\x00\x00\x00\x00\x00\x00\x00'))

        assert.deepStrictEqual(message.packet_decoded.protected_payload.reason, 0)
        assert.deepStrictEqual(message.packet_decoded.protected_payload.error_code, 0)
    });

    describe('should repack messages correctly', function(){
        packets.forEach(function(element, packetType){
            for (var name in element) break;

            it('should repack a valid '+name+' packet', function(){
                var data_packet = fs.readFileSync(element[name])
                // console.log('d_packet', data_packet.toString('hex'));

                var response = Packer(data_packet)
                var message = response.unpack(device)
                // console.log('d_packet message:', message.packet_decoded.decrypted_payload.toString('hex'));
                // console.log(message);

                device._request_num = message.packet_decoded.sequence_number
                device._target_participant_id = message.packet_decoded.target_participant_id
                device._source_participant_id = message.packet_decoded.source_participant_id

                var repacked = message.pack(device)
                // console.log('repacked', repacked.toString('hex'));

                assert.deepStrictEqual(data_packet, Buffer.from(repacked))
            });
        })
    });
})
