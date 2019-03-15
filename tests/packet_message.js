var assert = require('assert');
var fs = require('fs');
var PacketMessage = require('../src/packet/message');
var Xbox = require('../src/xbox');

var publicKey = '82bba514e6d19521114940bd65121af2'+'34c53654a8e67add7710b3725db44f77'
var sharedSecret = '30ed8e3da7015a09fe0f08e9bef3853c0506327eb77c9951769d923d863a2f5e';

describe('packet/message', function(){
    it('obj._packet should be empty on new instance without parameters', function(){
        var packet = PacketMessage();
        assert.deepStrictEqual(packet._packet, Buffer.from(''));
    });

    it('obj._packet should be not empty on new instance with parameters without xbox object', function(){
        var packet = PacketMessage(undefined, Buffer.from('0x0001'));
        assert.deepStrictEqual(packet._packet.toBuffer(), Buffer.from('0x0001'));
    });

    it('obj._packet should be not empty on new instance with parameters with xbox object', function(){
        var public_cert = fs.readFileSync('tests/data/selfsigned_cert.crt', 'utf8');
        var test_box = Xbox('127.0.0.1', public_cert);

        var packet = PacketMessage(test_box, Buffer.from('0x0001'));
        assert.deepStrictEqual(packet._packet.toBuffer(), Buffer.from('0x0001'));
    });

    it('obj._packet should parse an encrypted packet', function(){
        var public_cert = fs.readFileSync('tests/data/selfsigned_cert.crt', 'utf8');
        var test_xbox = Xbox('127.0.0.1', public_cert);
        test_xbox.loadCrypto(Buffer.from('041db1e7943878b28c773228ebdcfb05b985be4a386a55f50066231360785f61b60038caf182d712d86c8a28a0e7e2733a0391b1169ef2905e4e21555b432b262d', 'hex'), Buffer.from(publicKey+sharedSecret));

        var console_status_packet = fs.readFileSync('tests/data/packets/console_status');

        var packet = PacketMessage(test_xbox);
        var packet_data = packet.unpack(Buffer.from(console_status_packet));
        console.log('packet_data:', packet_data);

        //assert.deepStrictEqual(packet._packet.toBuffer(), Buffer.from(console_status_packet));
    });
})
