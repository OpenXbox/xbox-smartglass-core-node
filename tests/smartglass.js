var assert = require('assert');
var Smartglass = require('../src/smartglass');
var SimplePacket = require('../src/simplepacket');
var PacketStructure = require('../src/packet/structure');

describe('smartglass', function(){
    describe('getConsoles()', function(){
        it('should return an ampty array on init', function(){
            assert(Smartglass.getConsoles().length == 0);
        });
    });
    // describe('_on_discovery_response()', function(){
    //     it('should test callback on DISCOVERY_REQUEST packet', function(done){
    //         var smartglass = Smartglass._on_discovery_response.push(function(payload, device, smartglass){
    //             assert.equal(payload.payload.device_name, 'Xbox-Smartglass-Test');
    //             assert.equal(payload.payload.device_udid, 'UUID_TEST');
    //             assert.equal(payload.payload.device_certificate_raw, 'MOCK_TEST_CERT');
    //
    //             done();
    //         });
    //
    //         var remote = {
    //             'address': '127.0.0.1',
    //             'port': 5050
    //         }
    //
    //         var payload = PacketStructure();
    //         payload.writeUInt32('6');
    //         payload.writeUInt16('1');
    //         payload.writeSGString('Xbox-Smartglass-Test');
    //         payload.writeSGString('UUID_TEST');
    //         payload.writeUInt32('0');
    //         payload.writeSGString('MOCK_TEST_CERT');
    //
    //         var message = SimplePacket._pack(Buffer.from('dd01', 'hex'), payload.toBuffer());
    //
    //         Smartglass._receive(message, remote, smartglass);
    //
    //     });
    // });
})
