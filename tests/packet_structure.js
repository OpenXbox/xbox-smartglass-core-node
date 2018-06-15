var assert = require('assert');
var PacketStructure = require('../src/packet/structure');

describe('packet/structure', function(){
    it('obj._packet should be empty on new instance without parameters', function(){
        var packet = PacketStructure();
        assert.deepStrictEqual(packet._packet, new Buffer(''));
    });
    it('obj._packet should be not empty on new instance with parameters', function(){
        var packet = PacketStructure(new Buffer('0x0001'));
        assert.deepStrictEqual(packet._packet, new Buffer('0x0001'));
    });


    describe('test write and read types', function(){
        var lPacket = PacketStructure();

        it('should write UInt16 to the packet and check packet', function(){
            lPacket.writeUInt16(10);
            assert.deepEqual(lPacket._packet, new Buffer('\x00\x0a'));
        }.bind(lPacket));

        it('should write UInt32 to the packet and check packet', function(){
            lPacket.writeUInt32(10);
            assert.deepEqual(lPacket._packet, new Buffer('\x00\x0a\x00\x00\x00\x0a'));
        }.bind(lPacket));

        it('should write SGString to the packet and check packet', function(){
            lPacket.writeSGString('test');
            assert.deepEqual(lPacket._packet, new Buffer('\x00\x0a\x00\x00\x00\x0a\x00\x04\x74\x65\x73\x74\x00'));
        }.bind(lPacket));

        it('should read UInt16 from the packet and check value and offset', function(){
            var uint16 = lPacket.readUInt16(10);
            assert.equal(uint16, 10);
            assert.equal(lPacket._offset, 2);
        }.bind(lPacket));

        it('should read UInt32 from the packet and check value and offset', function(){
            var uint32 = lPacket.readUInt32(10);
            assert.equal(uint32, 10);
            assert.equal(lPacket._offset, 6);
        }.bind(lPacket));

        it('should read SGString from the packet and check value and offset', function(){
            var sgstring = lPacket.readSGString('test');
            assert.equal(sgstring, 'test');
            assert.equal(lPacket._offset, 13);
        }.bind(lPacket));
    });
})
