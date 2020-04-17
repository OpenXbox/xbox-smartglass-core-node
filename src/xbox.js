var Packer = require('./packet/packer');
const SGCrypto = require('./sgcrypto.js');
const uuidParse = require('uuid-parse');
var uuid = require('uuid');
const os = require('os');
const EOL = os.EOL;
const crypto = require('crypto');
var jsrsasign = require('jsrsasign');
var Debug = require('debug')('smartglass:xbox')

module.exports = function(ip, certificate)
{
    return {
        _ip: ip,
        _certificate: certificate,

        _iv: false,
        _liveid: false,
        _is_authenticated: false,
        _participantid: false,

        _connection_status: false,
        _request_num: 1,
        _target_participant_id: 0,
        _source_participant_id: 0,

        _fragments: {},

        _crypto: false,

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

            Debug('this._request_num set to '+this._request_num)
            return num;
        },

        set_participantid: function(participantId)
        {
            this._participantid =  participantId;
            this._source_participant_id = participantId;
        },

        connect: function(uhs, xsts_token)
        {
            // // Set liveid
            var pem = '-----BEGIN CERTIFICATE-----'+EOL+this.getCertificate().toString('base64').match(/.{0,64}/g).join('\n')+'-----END CERTIFICATE-----';
            var deviceCert = new jsrsasign.X509();
            deviceCert.readCertPEM(pem);

            // var hSerial    = deviceCert.getSerialNumberHex(); // '009e755e" hexadecimal string
            // var sIssuer    = deviceCert.getIssuerString();    // '/C=US/O=z2'
            // var sSubject   = deviceCert.getSubjectString();   // '/C=US/O=z2'
            // var sNotBefore = deviceCert.getNotBefore();       // '100513235959Z'
            // var sNotAfter  = deviceCert.getNotAfter();        // '200513235959Z'

            this.setLiveid(deviceCert.getSubjectString().slice(4))

            // Set uuid
            var uuid4 = Buffer.from(uuidParse.parse(uuid.v4()));

            // Create public key
            var ecKey = jsrsasign.X509.getPublicKeyFromCertPEM(pem);

            Debug('Signing public key: '+ecKey.pubKeyHex);


            this._crypto = new SGCrypto();
            var object = this._crypto.signPublicKey(ecKey.pubKeyHex)

            Debug('Crypto output:', object);


            // Load crypto data
            this.loadCrypto(object.public_key, object.secret);

            Debug('Sending connect_request to xbox');
            var discovery_request = Packer('simple.connect_request');
            discovery_request.set('uuid', uuid4);
            discovery_request.set('public_key', this._crypto.getPublicKey());
            discovery_request.set('iv', this._crypto.getIv());

            if(uhs != undefined && xsts_token != undefined){
                Debug('- Connecting using token:', uhs+':'+xsts_token);
                discovery_request.set('userhash', uhs, true);
                discovery_request.set('jwt', xsts_token, true);

                this._is_authenticated = true
            } else {
                Debug('- Connecting using anonymous login');
                this._is_authenticated = false
            }

            var message = discovery_request.pack(this);

            return message
        },

        loadCrypto: function(public_key, shared_secret)
        {
            Debug('Loading crypto:');
            Debug('- Public key:', public_key);
            Debug('- Shared secret:', shared_secret);
            this._crypto = new SGCrypto();
            this._crypto.load(Buffer.from(public_key, 'hex'), Buffer.from(shared_secret, 'hex'))
        }
    };
}
