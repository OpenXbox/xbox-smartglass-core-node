var assert = require('assert');
var fs = require('fs');
const Packer = require('../src/packet/packer');

describe('packet/packer', function(){

    it('should return false on the structure if a packet could not be identified', function(){
        var packer_data = Packer('{}')
        assert.deepStrictEqual(packer_data.structure, false)
    });

    it('should not return false on the structure if a packet could be identified', function(){
        var packer_data = Packer(Buffer.from('dd01', 'hex'))
        assert.notDeepStrictEqual(packer_data.structure, false)
    });
})
