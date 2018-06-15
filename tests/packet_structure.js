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

    var testValues = {
        '1': '\x00\x01',
        '2': '\x00\x02',
        '10': '\x00\x10',
        '100': '\x00\x64'
    };

    for (testValue in testValues)
    {
        describe('test writeUInt16 & readUInt16 with value ('+testValue+')', function(){
            var packet = PacketStructure();

            it('should write packet', function(){
                packet.writeUInt16(testValue);
                assert.deepStrictEqual(packet._packet, new Buffer(testValues[testValue]));
            }.bind(packet, testValue, testValues));

            it('should read from packet ('+testValue+')', function(){
                var value = packet.readUInt16();
                assert.equal(value, testValue);
            }.bind(packet, testValue, testValues));
        });

        describe('test writeUInt32 & readUInt32 with value ('+testValue+')', function(){
            var packet = PacketStructure();

            it('should write packet', function(){
                packet.writeUInt32(testValue);
                assert.deepStrictEqual(packet._packet, new Buffer(Buffer.concat([
                    new Buffer('\x00\x00'),
                    new Buffer(testValues[testValue])
                ])));
            }.bind(packet, testValue, testValues));

            it('should read from packet ('+testValue+')', function(){
                var value = packet.readUInt32();
                assert.equal(value, testValue);
            }.bind(packet, testValue, testValues));
        });
    }

    // it('obj._offset should be set to 2 when reading UInt16 and return 1', function(){
    //     var packet = PacketStructure(new Buffer('0x0001'));
    //     var returnValue = packet.readUInt16();
    //     console.log(returnValue);
    //     assert.strictEqual(packet._offset, 2);
    //     assert.strictEqual(returnValue, 1);
    // });
})
