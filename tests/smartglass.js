var assert = require('assert');
const Smartglass = require('../src/smartglass');
const PacketStructure = require('../src/packet/structure');
const Packer = require('../src/packet/packer');

describe('smartglass', function(){
    it('should create a new Smartglass object', function(){
        var sgClient = Smartglass()

        assert.deepStrictEqual(sgClient._client, false)
        assert.deepStrictEqual(sgClient._last_received_time, false)
        assert.deepStrictEqual(sgClient.getConsoles(), [])
    });

    describe('powerOn()', function(){
        it('should send a power_on packet without a response', function(){
            var sgClient = Smartglass()
            sgClient.powerOn({
                live_id: 'FD000000000000',
                tries: 5,
                ip: '127.0.0.1'
            }, function(result){
                assert.fail('Should not trigger a response')
            })
        });
    });

    describe('connect()', function(){
        it('should try to connect but fails', function(){
            var sgClient = Smartglass()
            sgClient.connect({
                ip: '127.0.0.1'
            }, function(result){
                assert.fail('Should not trigger a response')
            })
        });
    });

    describe('powerOff()', function(){
        it('should send a power_off packet without a response', function(){
            var sgClient = Smartglass()
            sgClient.powerOff({
                ip: '127.0.0.1'
            }, function(result){
                console.log('result', result)
                assert.fail('Should not trigger a response')
            })
        });
    });

    describe('discovery()', function(){
        it('should send a discovery_request packet without a response', function(){
            var sgClient = Smartglass()
            sgClient.discovery({
                ip: '127.0.0.1'
            }, function(result){
                assert.fail('Should not trigger a response')
            })
        });
    });

    describe('_on_discovery_response()', function(){
        it('should test callback on DISCOVERY_REQUEST packet', function(done){
            var sgClient = Smartglass()
            sgClient._on_discovery_response.push(function(payload, device, smartglass){
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

            sgClient._receive(message, remote, sgClient);

        });
    });
})
