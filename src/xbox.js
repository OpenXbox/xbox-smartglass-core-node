var SimplePacket = require('./simplepacket.js');
var PacketStructure = require('./packet/structure.js');
var MessagePacket = require('./packet/message.js');
var Packer = require('./packet/packer');
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

        connect: function()
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

            // Sign certificate using python
            const { spawnSync } = require('child_process');
            var process = spawnSync("python", ["src/python/crypto.py", ecKey.pubKeyHex])
            object = JSON.parse(process.stdout);

            this.loadCrypto(object.public_key, object.secret);




            var message = SimplePacket.connect_request(this, uuid4, this._crypto);
            
            // var discovery_request = Packer('simple.connect_request');
            // discovery_request.set('uuid', uuid4);
            // discovery_request.set('public_key', this._crypto.getPublicKey());
            // discovery_request.set('iv', this._crypto.getIv());
            // console.log('this._crypto.getIv()', this._crypto.getIv().toString('hex'))
            //
            // var protected_payload = Packer('simple.connect_request_protected');
            // discovery_request.set('protected_payload', protected_payload.pack(this));
            //
            // console.log('protected_payload new', protected_payload.pack(this));
            //
            // var message = discovery_request.pack(this);
            //  console.log('[smartglass.js:_connect] new message:', message.toString('hex'), message.length)
            //  // process.exit()

            return message
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
