var assert = require('assert');
var fs = require('fs');
const Packer = require('../src/packet/packer');
var Xbox = require('../src/xbox');

var secret = Buffer.from('82bba514e6d19521114940bd65121af2'+'34c53654a8e67add7710b3725db44f77'+'30ed8e3da7015a09fe0f08e9bef3853c0506327eb77c9951769d923d863a2f5e', 'hex');
var certificate = Buffer.from('041db1e7943878b28c773228ebdcfb05b985be4a386a55f50066231360785f61b60038caf182d712d86c8a28a0e7e2733a0391b1169ef2905e4e21555b432b262d', 'hex');

var simple_packets = [
    {'simple.discovery_request': 'tests/data/packets/discovery_request'},
    {'simple.discovery_response': 'tests/data/packets/discovery_response'},
    {'simple.connect_request': 'tests/data/packets/connect_request'},
    // {'simple.connect_response': 'tests/data/packets/connect_response'},
    {'simple.poweron': 'tests/data/packets/poweron'}
]

var device = Xbox('127.0.0.1', certificate);
device.loadCrypto(certificate.toString('hex'), secret.toString('hex'));

describe('packet/packer', function(){

    it('should unpack a poweron packet', function(){
        var data_packet = fs.readFileSync('tests/data/packets/poweron')

        var poweron_request = Packer(data_packet)
        var message = poweron_request.unpack()

        assert.deepStrictEqual(message.type, 'simple')
        assert.deepStrictEqual(message.name, 'poweron')
        assert.deepStrictEqual(message.packet_decoded.liveid, 'FD00112233FFEE66')
    });

    it('should unpack a discovery_request packet', function(){
        var data_packet = fs.readFileSync('tests/data/packets/discovery_request')

        var discovery_request = Packer(data_packet)
        var message = discovery_request.unpack()

        assert.deepStrictEqual(message.type, 'simple')
        assert.deepStrictEqual(message.name, 'discovery_request')
        assert.deepStrictEqual(message.packet_decoded.flags, 0)
        assert.deepStrictEqual(message.packet_decoded.client_type, 8)
        assert.deepStrictEqual(message.packet_decoded.min_version, 0)
        assert.deepStrictEqual(message.packet_decoded.max_version, 2)
    });

    it('should unpack a discovery_response packet', function(){
        var data_packet = fs.readFileSync('tests/data/packets/discovery_response')

        var discovery_response = Packer(data_packet)
        var message = discovery_response.unpack()

        assert.deepStrictEqual(message.type, 'simple')
        assert.deepStrictEqual(message.name, 'discovery_response')
        assert.deepStrictEqual(message.packet_decoded.flags, 2)
        assert.deepStrictEqual(message.packet_decoded.client_type, 1)
        assert.deepStrictEqual(message.packet_decoded.name, 'XboxOne')
        assert.deepStrictEqual(message.packet_decoded.uuid, 'DE305D54-75B4-431B-ADB2-EB6B9E546014')
        assert.deepStrictEqual(message.packet_decoded.last_error, 0)
        assert.deepStrictEqual(message.packet_decoded.certificate_length, 519)
        assert.deepStrictEqual(message.packet_decoded.certificate.length, 519)
    });

    it('should unpack a connect_request packet', function(){
        var data_packet = fs.readFileSync('tests/data/packets/connect_request')

        var connect_request = Packer(data_packet)
        var message = connect_request.unpack(device)

        assert.deepStrictEqual(message.type, 'simple')
        assert.deepStrictEqual(message.name, 'connect_request')
        assert.deepStrictEqual(message.packet_decoded.payload_length, 98)
        assert.deepStrictEqual(message.packet_decoded.protected_payload_length, 47)
        assert.deepStrictEqual(message.packet_decoded.uuid, Buffer.from('de305d5475b4431badb2eb6b9e546014', 'hex'))
        assert.deepStrictEqual(message.packet_decoded.public_key_type, 0)
        //assert.deepStrictEqual(message.packet_decoded.public_key, "\xFF".repeat(64))
        assert.deepStrictEqual(message.packet_decoded.protected_payload.userhash, 'deadbeefdeadbeefde')
        assert.deepStrictEqual(message.packet_decoded.protected_payload.jwt, 'dummy_token')
        assert.deepStrictEqual(message.packet_decoded.protected_payload.connect_request_num, 0)
        assert.deepStrictEqual(message.packet_decoded.protected_payload.connect_request_group_start, 0)
        assert.deepStrictEqual(message.packet_decoded.protected_payload.connect_request_group_end, 2)
    });

    it('should unpack a connect_response packet', function(){
        var data_packet = fs.readFileSync('tests/data/packets/connect_response')

        var connect_response = Packer(data_packet)
        var message = connect_response.unpack(device)

        assert.deepStrictEqual(message.type, 'simple')
        assert.deepStrictEqual(message.name, 'connect_response')
        assert.deepStrictEqual(message.packet_decoded.payload_length, 16)
        assert.deepStrictEqual(message.packet_decoded.protected_payload_length, 8)
        assert.deepStrictEqual(message.packet_decoded.iv, Buffer.from('c6373202bdfd1167cf9693491d22322a', 'hex'))
        assert.deepStrictEqual(message.packet_decoded.protected_payload.connect_result, 0)
        assert.deepStrictEqual(message.packet_decoded.protected_payload.pairing_state, 0)
        assert.deepStrictEqual(message.packet_decoded.protected_payload.participant_id, 31)
    });

    describe('should repack messages correctly', function(){
        simple_packets.forEach(function(element, index){
            for (var name in element) break;

            it('should repack a valid '+name+' packet', function(){
                var data_packet = fs.readFileSync(element[name])
                // console.log('d_packet', data_packet.toString('hex'));

                var response = Packer(data_packet)
                var message = response.unpack(device)
                //console.log('d_packet message:', message.packet_decoded.decrypted_payload.toString('hex'));

                var repacked = message.pack(device)
                // console.log('repacked', repacked.toString('hex'));

                assert.deepStrictEqual(data_packet, Buffer.from(repacked))
            });
        })
    });
})
