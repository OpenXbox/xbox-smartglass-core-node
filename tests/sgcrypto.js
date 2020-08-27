var assert = require('assert');
var sgCrypto = require('../src/sgcrypto');

describe('sgcrypto', function(){
    it('should not generate random iv without a secret', function(){
        var clientCrypto = sgCrypto();
        var rand_iv = clientCrypto.getIv();

        assert.deepStrictEqual(rand_iv.length, 0);
    });

    it('should return an encryption key', function(){
        var clientCrypto = sgCrypto();
        clientCrypto.load('pubkey', '0123456789012345678901234567890123456789012345678901234567890123');
        var encryptionKey = clientCrypto.getEncryptionKey();

        assert.deepStrictEqual(encryptionKey, Buffer.from('0123456789012345'));
    });

    it('should return a secret', function(){
        var clientCrypto = sgCrypto();
        clientCrypto.load('pubkey', '0123456789012345678901234567890123456789012345678901234567890123');
        var secret = clientCrypto.getSecret();

        assert.deepStrictEqual(secret, Buffer.from('0123456789012345678901234567890123456789012345678901234567890123'));
    });

    it('should return a hmac', function(){
        var clientCrypto = sgCrypto();
        clientCrypto.load('pubkey', '0123456789012345678901234567890123456789012345678901234567890123');
        var hmac = clientCrypto.getHmac();

        assert.deepStrictEqual(hmac, Buffer.from('23456789012345678901234567890123'));
    });

    it('should generate a static iv with a secret', function(){
        var clientCrypto = sgCrypto();
        clientCrypto.load('pubkey', '0123456789012345678901234567890123456789012345678901234567890123');

        var static_iv = clientCrypto.getIv();

        assert.deepStrictEqual(static_iv.length, 16);
        assert.deepStrictEqual(static_iv, Buffer.from('6789012345678901'));
    });

    it('should generate a static iv with a secret using a seed', function(){
        var clientCrypto = sgCrypto();
        clientCrypto.load('pubkey', '0123456789012345678901234567890123456789012345678901234567890123');

        var static_iv = clientCrypto.getIv(123456);

        assert.deepStrictEqual(static_iv.length, 16);
        assert.deepStrictEqual(static_iv, Buffer.from('6789012345678901'));
    });

    it('should encrypt a string', function(){
        var clientCrypto = sgCrypto();
        clientCrypto.load('pubkey', '0123456789012345678901234567890123456789012345678901234567890123');

        var key = clientCrypto.getIv();
        var encoded_string = clientCrypto._encrypt(Buffer.from('Test String\x00\x00\x00\x00\x00'), key);
        assert.deepStrictEqual(key, Buffer.from('6789012345678901'));
        assert.deepStrictEqual(encoded_string, Buffer.from('0a558e2b483d9c4ccc24296c9ac8a85d', 'hex'));
    });

    it('should decode an encrypted string', function(){
        var clientCrypto = sgCrypto();
        clientCrypto.load('pubkey', '0123456789012345678901234567890123456789012345678901234567890123');

        var key = clientCrypto.getIv();
        var encoded_string = clientCrypto._encrypt(Buffer.from('Test String\x00\x00\x00\x00\x00'), key);
        var decoded_string = clientCrypto._decrypt(encoded_string, false, key);
        assert.deepStrictEqual(decoded_string, Buffer.from('Test String\x00\x00\x00\x00\x00'));
    });

    it('should encrypt a string with iv', function(){
        var clientCrypto = sgCrypto();
        clientCrypto.load('pubkey', '0123456789012345678901234567890123456789012345678901234567890123');

        var iv = clientCrypto.getIv();
        var key = Buffer.from('000102030405060708090A0B0C0D0E0F', 'hex');

        var encoded_string = clientCrypto._encrypt(Buffer.from('Test String\x00\x00\x00\x00\x00'), key, iv);
        assert.deepStrictEqual(iv, Buffer.from('6789012345678901'));
        assert.deepStrictEqual(encoded_string, Buffer.from('ac641fbc44858dbb6869dfeca062f05c', 'hex'));
    });

    it('should decode an encrypted string with iv', function(){
        var clientCrypto = sgCrypto();
        clientCrypto.load('pubkey', '0123456789012345678901234567890123456789012345678901234567890123');

        var key = clientCrypto.getIv();
        var iv = Buffer.from('000102030405060708090A0B0C0D0E0F', 'hex');
        var encoded_string = clientCrypto._encrypt(Buffer.from('Test String\x00\x00\x00\x00\x00'), key, iv);
        var decoded_string = clientCrypto._decrypt(encoded_string, iv, key);
        assert.deepStrictEqual(decoded_string, Buffer.from('Test String\x00\x00\x00\x00\x00'));
    });
});
