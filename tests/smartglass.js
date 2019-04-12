var assert = require('assert');
var Smartglass = require('../src/smartglass');
const PacketStructure = require('../src/packet/structure');
const Packer = require('../src/packet/packer');

describe('smartglass', function(){
    describe('getConsoles()', function(){
        it('should return an ampty array on init', function(){
            assert(Smartglass.getConsoles().length == 0);
        });
    });
    describe('_on_discovery_response()', function(){
        it('should test callback on DISCOVERY_REQUEST packet', function(done){
            var smartglass = Smartglass._on_discovery_response.push(function(payload, device, smartglass){
                assert.equal(payload.structure.name.value, 'Xbox-Smartglass-Test');
                assert.equal(payload.structure.uuid.value, 'UUID_TEST');
                assert.equal(payload.structure.certificate.value, 'MOCK_TEST_CERT');

                done();
            });

            var discovery = Packer('simple.discovery_response')
            discovery.set('name', 'Xbox-Smartglass-Test')
            discovery.set('uuid', 'UUID_TEST')
            discovery.set('certificate', 'MOCK_TEST_CERT')

            var message = discovery.pack()

            var remote = {
                'address': '127.0.0.1',
                'port': 5050
            }

            Smartglass._receive(message, remote, smartglass);

        });
    });
})
