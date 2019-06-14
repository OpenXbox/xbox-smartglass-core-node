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
    {'message.disconnect': 'tests/data/packets/disconnect'},
    {'message.start_channel_request': 'tests/data/packets/start_channel_request'},
    {'message.start_channel_response': 'tests/data/packets/disconnect'},
    {'message.gamepad': 'tests/data/packets/gamepad'},
    {'message.media_state': 'tests/data/packets/media_state'},
    {'message.media_command': 'tests/data/packets/media_command'},
    {'message.json': 'tests/data/packets/json'}
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

    it('should unpack a start_channel_request packet', function(){
        var data_packet = fs.readFileSync('tests/data/packets/start_channel_request')

        var poweroff_request = Packer(data_packet)
        var message = poweroff_request.unpack(device)

        assert.deepStrictEqual(message.type, 'message')
        assert.deepStrictEqual(message.packet_decoded.sequence_number, 2)
        assert.deepStrictEqual(message.packet_decoded.source_participant_id, 31)
        assert.deepStrictEqual(message.packet_decoded.target_participant_id, 0)

        assert.deepStrictEqual(message.packet_decoded.flags.version, '2')
        assert.deepStrictEqual(message.packet_decoded.flags.need_ack, true)
        assert.deepStrictEqual(message.packet_decoded.flags.is_fragment, false)
        assert.deepStrictEqual(message.packet_decoded.flags.type, 'start_channel_request')
        assert.deepStrictEqual(message.packet_decoded.channel_id, Buffer.from('\x00\x00\x00\x00\x00\x00\x00\x00'))

        assert.deepStrictEqual(message.packet_decoded.protected_payload.channel_request_id, 1)
        assert.deepStrictEqual(message.packet_decoded.protected_payload.title_id, 0)
        assert.deepStrictEqual(message.packet_decoded.protected_payload.service, Buffer.from('fa20b8ca66fb46e0adb60b978a59d35f', 'hex')) // SystemInput
        assert.deepStrictEqual(message.packet_decoded.protected_payload.activity_id, 0)
    });

    it('should unpack a start_channel_response packet', function(){
        var data_packet = fs.readFileSync('tests/data/packets/start_channel_response')

        var poweroff_request = Packer(data_packet)
        var message = poweroff_request.unpack(device)

        assert.deepStrictEqual(message.type, 'message')
        assert.deepStrictEqual(message.packet_decoded.sequence_number, 6)
        assert.deepStrictEqual(message.packet_decoded.source_participant_id, 0)
        assert.deepStrictEqual(message.packet_decoded.target_participant_id, 31)

        assert.deepStrictEqual(message.packet_decoded.flags.version, '2')
        assert.deepStrictEqual(message.packet_decoded.flags.need_ack, true)
        assert.deepStrictEqual(message.packet_decoded.flags.is_fragment, false)
        assert.deepStrictEqual(message.packet_decoded.flags.type, 'start_channel_response')
        assert.deepStrictEqual(message.packet_decoded.channel_id, Buffer.from('\x00\x00\x00\x00\x00\x00\x00\x00'))

        assert.deepStrictEqual(message.packet_decoded.protected_payload.channel_request_id, 1)
        assert.deepStrictEqual(message.packet_decoded.protected_payload.target_channel_id, Buffer.from('0000000000000094', 'hex'))
        assert.deepStrictEqual(message.packet_decoded.protected_payload.result, 0)
    });

    it('should unpack a gamepad packet', function(){
        var data_packet = fs.readFileSync('tests/data/packets/gamepad')

        var poweroff_request = Packer(data_packet)
        var message = poweroff_request.unpack(device)

        assert.deepStrictEqual(message.type, 'message')
        assert.deepStrictEqual(message.packet_decoded.sequence_number, 79)
        assert.deepStrictEqual(message.packet_decoded.source_participant_id, 41)
        assert.deepStrictEqual(message.packet_decoded.target_participant_id, 0)

        assert.deepStrictEqual(message.packet_decoded.flags.version, '2')
        assert.deepStrictEqual(message.packet_decoded.flags.need_ack, false)
        assert.deepStrictEqual(message.packet_decoded.flags.is_fragment, false)
        assert.deepStrictEqual(message.packet_decoded.flags.type, 'gamepad')
        assert.deepStrictEqual(message.packet_decoded.channel_id, Buffer.from('00000000000000b4', 'hex'))

        assert.deepStrictEqual(message.packet_decoded.protected_payload.timestamp, Buffer.from('0000000000000000', 'hex'))
        assert.deepStrictEqual(message.packet_decoded.protected_payload.buttons, 32)
        assert.deepStrictEqual(message.packet_decoded.protected_payload.left_trigger, 0)
        assert.deepStrictEqual(message.packet_decoded.protected_payload.right_trigger, 0)
        assert.deepStrictEqual(message.packet_decoded.protected_payload.left_thumbstick_x, 0)
        assert.deepStrictEqual(message.packet_decoded.protected_payload.left_thumbstick_y, 0)
        assert.deepStrictEqual(message.packet_decoded.protected_payload.right_thumbstick_x, 0)
        assert.deepStrictEqual(message.packet_decoded.protected_payload.right_thumbstick_y, 0)
    });

    it('should unpack a media_state packet', function(){
        var data_packet = fs.readFileSync('tests/data/packets/media_state')

        var poweroff_request = Packer(data_packet)
        var message = poweroff_request.unpack(device)

        assert.deepStrictEqual(message.type, 'message')
        assert.deepStrictEqual(message.packet_decoded.sequence_number, 158)
        assert.deepStrictEqual(message.packet_decoded.source_participant_id, 0)
        assert.deepStrictEqual(message.packet_decoded.target_participant_id, 32)

        assert.deepStrictEqual(message.packet_decoded.flags.version, '2')
        assert.deepStrictEqual(message.packet_decoded.flags.need_ack, true)
        assert.deepStrictEqual(message.packet_decoded.flags.is_fragment, false)
        assert.deepStrictEqual(message.packet_decoded.flags.type, 'media_state')
        assert.deepStrictEqual(message.packet_decoded.channel_id, Buffer.from('0000000000000099', 'hex'))

        assert.deepStrictEqual(message.packet_decoded.protected_payload.title_id, 274278798)
        assert.deepStrictEqual(message.packet_decoded.protected_payload.aum_id, 'AIVDE_s9eep9cpjhg6g!App')
        assert.deepStrictEqual(message.packet_decoded.protected_payload.asset_id, '')
        assert.deepStrictEqual(message.packet_decoded.protected_payload.media_type, 'No Media')
        assert.deepStrictEqual(message.packet_decoded.protected_payload.sound_level, 'Full')
        assert.deepStrictEqual(message.packet_decoded.protected_payload.enabled_commands, 33758)
        assert.deepStrictEqual(message.packet_decoded.protected_payload.playback_status, 'Stopped')
        assert.deepStrictEqual(message.packet_decoded.protected_payload.rate, 0)
    });

    it('should unpack a media_command packet', function(){
        var data_packet = fs.readFileSync('tests/data/packets/media_command')

        var poweroff_request = Packer(data_packet)
        var message = poweroff_request.unpack(device)

        assert.deepStrictEqual(message.type, 'message')
        assert.deepStrictEqual(message.packet_decoded.sequence_number, 597)
        assert.deepStrictEqual(message.packet_decoded.source_participant_id, 32)
        assert.deepStrictEqual(message.packet_decoded.target_participant_id, 0)

        assert.deepStrictEqual(message.packet_decoded.flags.version, '2')
        assert.deepStrictEqual(message.packet_decoded.flags.need_ack, true)
        assert.deepStrictEqual(message.packet_decoded.flags.is_fragment, false)
        assert.deepStrictEqual(message.packet_decoded.flags.type, 'media_command')
        assert.deepStrictEqual(message.packet_decoded.channel_id, Buffer.from('0000000000000099', 'hex'))

        assert.deepStrictEqual(message.packet_decoded.protected_payload.request_id, Buffer.from('0000000000000000', 'hex'))
        assert.deepStrictEqual(message.packet_decoded.protected_payload.title_id, 274278798)
        assert.deepStrictEqual(message.packet_decoded.protected_payload.command, 256)
        assert.deepStrictEqual(message.packet_decoded.protected_payload.seek_position, undefined) // Should be tested when implemented
    });

    it('should unpack a json packet', function(){
        var data_packet = fs.readFileSync('tests/data/packets/json')

        var poweroff_request = Packer(data_packet)
        var message = poweroff_request.unpack(device)

        assert.deepStrictEqual(message.type, 'message')
        assert.deepStrictEqual(message.packet_decoded.sequence_number, 11)
        assert.deepStrictEqual(message.packet_decoded.source_participant_id, 31)
        assert.deepStrictEqual(message.packet_decoded.target_participant_id, 0)

        assert.deepStrictEqual(message.packet_decoded.flags.version, '2')
        assert.deepStrictEqual(message.packet_decoded.flags.need_ack, true)
        assert.deepStrictEqual(message.packet_decoded.flags.is_fragment, false)
        assert.deepStrictEqual(message.packet_decoded.flags.type, 'json')
        assert.deepStrictEqual(message.packet_decoded.channel_id, Buffer.from('0000000000000097', 'hex'))

        assert.deepStrictEqual(message.packet_decoded.protected_payload.json, '{"msgid":"2ed6c0fd.2","request":"GetConfiguration"}')
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
