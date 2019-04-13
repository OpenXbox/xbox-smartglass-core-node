var Packer = require('./packet/packer');
const SGCrypto = require('./sgcrypto.js');

const uuidParse = require('uuid-parse');
var uuid = require('uuid');

const os = require('os');
const EOL = os.EOL;

const crypto = require('crypto');
var jsrsasign = require('jsrsasign');

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
        _target_participant_id: 0,
        _source_participant_id: 0,

        _crypto: false,
        _crypto_iv: false,
        _crypto_device_keys: false,
        _crypto_client_keys: false,

        getIp: function()
        {
            return this._ip
        },

        getCertificate: function()
        {
            return this._certificate
        },

        getLiveid: function()
        {
            return this._liveid;
        },

        setLiveid: function(liveid)
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
            this._participantid =  participantId;
            this._source_participant_id = participantId;
        },

        connect: function()
        {
            var iv = this._generate_iv();

            // // Set liveid
            var pem = '-----BEGIN CERTIFICATE-----'+EOL+this.getCertificate().toString('base64').match(/.{0,64}/g).join('\n')+'-----END CERTIFICATE-----';
            var deviceCert = new jsrsasign.X509();
            deviceCert.readCertPEM(pem);

            var hSerial    = deviceCert.getSerialNumberHex(); // '009e755e" hexadecimal string
            var sIssuer    = deviceCert.getIssuerString();    // '/C=US/O=z2'
            var sSubject   = deviceCert.getSubjectString();   // '/C=US/O=z2'
            var sNotBefore = deviceCert.getNotBefore();       // '100513235959Z'
            var sNotAfter  = deviceCert.getNotAfter();        // '200513235959Z'

            this.setLiveid(deviceCert.getSubjectString().slice(4))

            // Set uuid
            var uuid4 = Buffer.from(uuidParse.parse(uuid.v4()));

            // Create public key
            var ecKey = jsrsasign.X509.getPublicKeyFromCertPEM(pem);

            // Sign certificate using python
            const { spawnSync } = require('child_process');
            var process = spawnSync("python", [__dirname+"/python/crypto.py", ecKey.pubKeyHex])
                        console.log('exec:',process.stdout.toString())
            object = JSON.parse(process.stdout);


            // Load crypto data
            this.loadCrypto(object.public_key, object.secret);

            var discovery_request = Packer('simple.connect_request');
            discovery_request.set('uuid', uuid4);
            discovery_request.set('public_key', this._crypto.getPublicKey());
            discovery_request.set('iv', this._crypto.getIv());
            //
            var protected_payload = Packer('simple.connect_request_protected');
            var result = protected_payload.pack(this)
            var message = discovery_request.pack(this);

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
