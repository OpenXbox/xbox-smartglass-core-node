var assert = require('assert');
var fs = require('fs');
const Xbox = require('../src/xbox');

// var public_key = Buffer.from('041db1e7943878b28c773228ebdcfb05b985be4a386a55f50066231360785f61b60038caf182d712d86c8a28a0e7e2733a0391b1169ef2905e4e21555b432b262d', 'hex');
var certificate = fs.readFileSync('tests/data/selfsigned_cert.crt')

describe('xbox', function(){
    it('should create an Xbox object using a public key', function(){
        var xbox = Xbox('127.0.0.1', certificate)

        assert.deepStrictEqual(xbox.getIp(), '127.0.0.1');
        assert.deepStrictEqual(xbox.getCertificate(), certificate);
        assert.deepStrictEqual(xbox.getLiveid(), false);
    });

    it('should create a new sgCrypto object using connect()', function(){
        certificate_b64 = certificate.toString().replace(/(\n|\r)+$/, '')

        var xbox = Xbox('127.0.0.1', Buffer.from(certificate_b64, 'base64'))
        var connect_request = xbox.connect()

        assert.deepStrictEqual(Buffer.from(connect_request).slice(0, 2), Buffer.from('cc00', 'hex'))
        assert.deepStrictEqual(xbox.getLiveid(), 'FFFFFFFFFFF');
        assert.deepStrictEqual(xbox._request_num, 1);
        assert.notDeepStrictEqual(xbox._crypto, false);
    });

    it('should create a new sgCrypto object using connect() using credentials', function(){
        certificate_b64 = certificate.toString().replace(/(\n|\r)+$/, '')

        var xbox = Xbox('127.0.0.1', Buffer.from(certificate_b64, 'base64'))
        var connect_request = xbox.connect('userhash', 'xsts_token')

        assert.deepStrictEqual(Buffer.from(connect_request).slice(0, 2), Buffer.from('cc00', 'hex'))
        assert.deepStrictEqual(xbox.getLiveid(), 'FFFFFFFFFFF');
        assert.deepStrictEqual(xbox._request_num, 1);
        assert.notDeepStrictEqual(xbox._crypto, false);
    });

    it('should create an Xbox object and return a value when calling get_requestnum()', function(){
        var xbox = Xbox('127.0.0.1', certificate)
        var request_num = xbox.get_requestnum()

        assert.deepStrictEqual(xbox.getIp(), '127.0.0.1');
        assert.deepStrictEqual(xbox.getCertificate(), certificate);
        assert.deepStrictEqual(xbox.getLiveid(), false);

        assert.deepStrictEqual(request_num, 1);
        
    });

    it('should create an Xbox object and set participant id when using set_participantid()', function(){
        var xbox = Xbox('127.0.0.1', certificate)
        xbox.set_participantid(1001)

        assert.deepStrictEqual(xbox.getIp(), '127.0.0.1');
        assert.deepStrictEqual(xbox.getCertificate(), certificate);
        assert.deepStrictEqual(xbox.getLiveid(), false);

        assert.deepStrictEqual(xbox._participantid, 1001);
        assert.deepStrictEqual(xbox._source_participant_id, 1001);
    });
})
