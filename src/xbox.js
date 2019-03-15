var SimplePacket = require('./simplepacket.js');
var PacketStructure = require('./packet/structure.js');
var MessagePacket = require('./packet/message.js');
const SGCrypto = require('./sgcrypto.js');
var os = require('os');
var EOL = require('os').EOL;

const crypto = require('crypto');
//const { ECDH } = require('crypto');
//const x509 = require('x509');
const uuidParse = require('uuid-parse');

var jsrsasign = require('jsrsasign');
var keyutil = jsrsasign.KEYUTIL;
var uuid = require('uuid');
//var forge = require('node-forge');

module.exports = function(ip, certificate)
{
    return {
        _ip: ip,
        _certificate: certificate,

        _iv: false,
        _liveid: false,
        _participantid: false,

        _connection_status: false,
        _request_num: 1,

        _crypto: false,
        _crypto_iv: false,
        _crypto_device_keys: false,
        _crypto_client_keys: false,

        get_ip: function()
        {
            return this._ip
        },

        get_certificate: function()
        {
            return this._certificate
        },

        set_iv: function(iv)
        {
            this._iv = iv;
        },

        set_liveid: function(liveid)
        {
            this._liveid = liveid;
        },

        get_requestnum: function()
        {
            var num = this._request_num;

            this._request_num++;

            return num;
        },

        set_participantid: function(participantId)
        {
            this._participantid = participantId;
        },

        shutdown: function()
        {
            var packet = new MessagePacket(this);

            console.log('Turn off: '+this._liveid);
            return packet.pack(0x39, this._participantid, this._liveid);
        },

        connect_request: function()
        {
            var iv = this._generate_iv();

            var pem = '-----BEGIN CERTIFICATE-----'+EOL+this._certificate.toString('base64').match(/.{0,64}/g).join('\n')+'-----END CERTIFICATE-----';
            var deviceCert = new jsrsasign.X509();
            deviceCert.readCertPEM(pem);

            var hSerial    = deviceCert.getSerialNumberHex(); // '009e755e" hexadecimal string
            var sIssuer    = deviceCert.getIssuerString();    // '/C=US/O=z2'
            var sSubject   = deviceCert.getSubjectString();   // '/C=US/O=z2'
            var sNotBefore = deviceCert.getNotBefore();       // '100513235959Z'
            var sNotAfter  = deviceCert.getNotAfter();        // '200513235959Z'

            var ecKey = jsrsasign.X509.getPublicKeyFromCertPEM(pem);

            var uuid4 = Buffer.from(uuidParse.parse(uuid.v4()));

            // var sgcrypto = new SGCrypto();
            // this._crypto = sgcrypto;

            // Sign certificate using python
            const { spawnSync } = require('child_process');
            var process = spawnSync("python", ["src/python/crypto.py", ecKey.pubKeyHex])
            object = JSON.parse(process.stdout);

            //console.log('++ Xbox connection created: ', object);
            //this._crypto.load(Buffer.from(object.public_key, 'hex'), Buffer.from(object.secret, 'hex'))

            this.loadCrypto(object.public_key, object.secret);

            return SimplePacket.connect_request(this, uuid4, this._crypto);
        },

        readPayload: function(payload, iv)
        {
            var payload = this._crypto.decrypt(payload, iv);

            return new PacketStructure(Buffer.from(payload, 'hex'));
        },

        loadCrypto: function(public_key, shared_secret)
        {
            var sgcrypto = new SGCrypto();
            this._crypto = sgcrypto;
            this._crypto.load(Buffer.from(public_key, 'hex'), Buffer.from(shared_secret, 'hex'))
        },

        /* Private functions */

        _generate_iv: function(seed)
        {
            if(seed != undefined)
            {
                var seeder = crypto.createCipher('aes-128-cbc', this._crypto_client_keys.aes_key, this._crypto_client_keys.aes_iv)
                seeder.update(seed)
                return seeder.final();
            }

            return crypto.randomBytes(16);
        }


    };
}
