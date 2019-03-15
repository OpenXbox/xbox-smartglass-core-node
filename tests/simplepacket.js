var assert = require('assert');
var SimplePacket = require('../src/simplepacket');

describe('simplepacket', function(){
    describe('power_on()', function(){
        it('should return a poweron packet (FD000000000000)', function(){
            var packet = SimplePacket.power_on('FD000000000000');
            assert.deepStrictEqual(packet, Buffer.from('dd0200110000000e464430303030303030303030303000', 'hex'));
        });
        it('should return a poweron packet (FD123456789123)', function(){
            var packet = SimplePacket.power_on('FD123456789123');
            assert.deepStrictEqual(packet, Buffer.from('dd0200110000000e464431323334353637383931323300', 'hex'));
        });
        it('should return a poweron packet (FD9999999999)', function(){
            var packet = SimplePacket.power_on('FD9999999999');
            assert.deepStrictEqual(packet, Buffer.from('dd02000f0000000c46443939393939393939393900', 'hex'));
        });
    });

    describe('discovery()', function(){
        it('should return a discovery request packet', function(){
            var packet = SimplePacket.discovery();
            assert.deepStrictEqual(packet, Buffer.from('dd00000a000000000000000300000002', 'hex'));
        });
    });
})
