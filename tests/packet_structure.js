var assert = require('assert');
var PacketStructure = require('../src/packet/structure');

describe('packet/structure', function(){
    it('obj._packet should be empty on new instance without parameters', function(){
        var packet = PacketStructure();
        assert.deepStrictEqual(packet.toBuffer(), Buffer.from(''));
    });
    it('obj._packet should be not empty on new instance with parameters', function(){
        var packet = PacketStructure(Buffer.from('0x0001'));
        assert.deepStrictEqual(packet.toBuffer(), Buffer.from('0x0001'));
    });


    describe('test write and read types', function(){

        it('should write UInt8 to the packet and check packet', function(){
            var lPacket = PacketStructure();
            lPacket.writeUInt8(10);

            assert.deepStrictEqual(lPacket.toBuffer(), Buffer.from('\x0a'));
        });

        it('should write UInt16 to the packet and check packet', function(){
            var lPacket = PacketStructure();
            lPacket.writeUInt16(10);

            assert.deepStrictEqual(lPacket.toBuffer(), Buffer.from('\x00\x0a'));
        });

        it('should write UInt32 to the packet and check packet', function(){
            var lPacket = PacketStructure();
            lPacket.writeUInt32(10);

            assert.deepStrictEqual(lPacket.toBuffer(), Buffer.from('\x00\x00\x00\x0a'));
        });

        it('should write SGString to the packet and check packet', function(){
            var lPacket = PacketStructure();
            lPacket.writeSGString('test');

            assert.deepStrictEqual(lPacket.toBuffer(), Buffer.from('\x00\x04\x74\x65\x73\x74\x00'));
        });



        it('should read UInt8 from the packet and check value and offset', function(){
            var lPacket = PacketStructure();
            lPacket.writeUInt8(10);

            var uint16 = lPacket.readUInt8(10);
            assert.deepStrictEqual(lPacket.toBuffer(), Buffer.from('\x0a'));
            assert.deepStrictEqual(lPacket.getOffset(), 1);
        });

        it('should read UInt16 from the packet and check value and offset', function(){
            var lPacket = PacketStructure();
            lPacket.writeUInt16(10);

            var uint16 = lPacket.readUInt16(10);
            assert.deepStrictEqual(lPacket.toBuffer(), Buffer.from('\x00\x0a'));
            assert.deepStrictEqual(lPacket.getOffset(), 2);
        });

        it('should read UInt32 from the packet and check value and offset', function(){
            var lPacket = PacketStructure();
            lPacket.writeUInt32(10);

            var uint32 = lPacket.readUInt32(10);
            assert.deepStrictEqual(lPacket.toBuffer(), Buffer.from('\x00\x00\x00\x0a'));
            assert.deepStrictEqual(lPacket.getOffset(), 4);
        });

        it('should read UInt64 from the packet and check value and offset', function(){
            var lPacket = PacketStructure(Buffer.from('\x67\xa1\x60\x60\x01\x00\x00\x00'));

            var uint64 = lPacket.readUInt64(); // 5911912807
            assert.deepStrictEqual(lPacket.toBuffer(), Buffer.from('\x67\xa1\x60\x60\x01\x00\x00\x00'));
            // assert.deepStrictEqual(uint64, 5911912807);
            assert.deepStrictEqual(lPacket.getOffset(), 8);
        });

        it('should read SGString from the packet and check value and offset', function(){
            var lPacket = PacketStructure();
            lPacket.writeSGString('test');

            var sgstring = lPacket.readSGString('test');
            assert.deepStrictEqual(lPacket.toBuffer(), Buffer.from('\x00\x04\x74\x65\x73\x74\x00'));
            assert.deepStrictEqual(sgstring, Buffer.from('test'));
            assert.deepStrictEqual(lPacket.getOffset(), 7);
        });


        it('should set offset', function(){
            var lPacket = PacketStructure();
            lPacket.writeSGString('testtesttesttest');

            assert.deepStrictEqual(lPacket.getOffset(), 0);
            lPacket.setOffset(7)
            assert.deepStrictEqual(lPacket.getOffset(), 7);
            lPacket.setOffset(0)
            assert.deepStrictEqual(lPacket.getOffset(), 0);
        });
    });
})
