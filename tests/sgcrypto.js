var assert = require('assert');
var sgCrypto = require('../src/sgcrypto');

describe('sgcrypto', function(){
    it('should not generate random iv without a secret', function(){
        clientCrypto = sgCrypto();
        var rand_iv = clientCrypto.getIv();

        assert.deepStrictEqual(rand_iv.length, 0);
    });

    it('should generate a static iv with a secret', function(){
        clientCrypto = sgCrypto();
        clientCrypto.load('pubkey', '0123456789012345678901234567890123456789012345678901234567890123');

        static_iv = clientCrypto.getIv();

        assert.deepStrictEqual(static_iv.length, 16);
        assert.deepStrictEqual(static_iv, Buffer.from('6789012345678901'));
    });
});
