var assert = require('assert');
var fs = require('fs');
var Packer = require('../src/packet/packer');
var Xbox = require('../src/xbox');

var publicKey = '82bba514e6d19521114940bd65121af2'+'34c53654a8e67add7710b3725db44f77'
var sharedSecret = '30ed8e3da7015a09fe0f08e9bef3853c0506327eb77c9951769d923d863a2f5e';

describe('packet/packer', function(){
    it('Paket should pack a valid discovery request packet', function(){
        var discovery_request = Packer('simple.discovery_request')
        discovery_request.set('client_type', '8')
        var message = discovery_request.pack()

        var data_packet = fs.readFileSync('tests/data/packets/discovery_request')

        assert.deepStrictEqual(message, Buffer.from(data_packet));
    });

    it('Paket should unpack a discovery request packet', function(){
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

    it('Paket should pack a valid discovery response packet', function(){
        var certificate = fs.readFileSync('tests/data/selfsigned_cert.crt')

        var discovery_response = Packer('simple.discovery_response')
        discovery_response.set('flags', 2)
        discovery_response.set('client_type', 1)
        discovery_response.set('name', 'XboxOne')
        discovery_response.set('uuid', 'DE305D54-75B4-431B-ADB2-EB6B9E546014')
        discovery_response.set('last_error', 0)
        discovery_response.set('certificate_length', 519)
        discovery_response.set('certificate', certificate)
        var message = discovery_response.pack()

        var data_packet = fs.readFileSync('tests/data/packets/discovery_response')

        console.log('test:', message)
        console.log('test:', data_packet)
        //assert.deepStrictEqual(message, Buffer.from(data_packet));
    });

    it('Paket should unpack a discovery response packet', function(){
        var data_packet = fs.readFileSync('tests/data/packets/discovery_response')

        var discovery_respopnse = Packer(data_packet)
        var message = discovery_respopnse.unpack()

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

    it('Paket should pack a valid connect request packet', function(){

    });

    it('Paket should unpack a console request packet', function(){

    });
})
