const crypto = require('crypto');

module.exports = function()
{
    return {
        pubkey: Buffer.from('', 'hex'),
        secret: Buffer.from('', 'hex'),
        encryptionkey: false,
        iv: false,
        hash_key: false,

        load: function(pubkey, secret)
        {
            if(pubkey != undefined && secret != undefined)
            {
                this.pubkey = Buffer.from(pubkey);
                this.secret = Buffer.from(secret);
            }

            var data = {
        		'aes_key': Buffer.from(this.secret.slice(0, 16)),
        		'aes_iv': Buffer.from(this.secret.slice(16, 32)),
        		'hmac_key': Buffer.from(this.secret.slice(32))
        	};

            this.iv = data.aes_iv;
            this.hash_key = data.hmac_key;
            this.encryptionkey = data.aes_key;
        },

        getSecret: function()
        {
            return this.secret;
        },

        getHmac: function()
        {
            if(this.encryptionkey == false)
                this.load();

            return this.hash_key;
        },

        getPublicKey: function()
        {
            return this.pubkey;
        },

        getEncryptionKey: function()
        {
            if(this.encryptionkey == false)
                this.load();

            return this.encryptionkey;
        },

        getIv: function(seed = false)
        {
            if(this.iv == false)
                this.load();

            if(seed != false)
                return Buffer(this.encrypt(seed, null), 'hex');
            else
                return this.iv;
        },

        getHashKey: function(seed = false)
        {
            if(this.hash_key == false)
                this.load();

            return this.hash_key;
        },

        _encrypt(data, key = false, iv = false)
        {
            data = Buffer.from(data);

            if(iv == false)
                iv = Buffer.from('\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00');

            if(key == false){
                key = this.getEncryptionKey()
            }

            var cipher = crypto.createCipheriv('aes-128-cbc', key, iv);

            cipher.setAutoPadding(false);
            var encryptedPayload = cipher.update(data, 'binary', 'binary');
            encryptedPayload += cipher.final('binary');

            return Buffer.from(encryptedPayload, 'binary');
        },

        _decrypt(data, iv, key = false)
        {
            data = this._addPadding(data);

            if(key == false){
                key = this.getEncryptionKey()
            }

            if(iv == false)
                iv = Buffer.from('\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00');

            var cipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
            cipher.setAutoPadding(false);

            var decryptedPayload = cipher.update(data, 'binary', 'binary');
            decryptedPayload += cipher.final('binary');


            return this._removePadding(Buffer.from(decryptedPayload, 'binary'));
        },

        _sign: function(data)
        {
            var hashHmac = crypto.createHmac('sha256', this.getHashKey());
            hashHmac.update(data, 'binary', 'binary');
            var protectedPayloadHash = hashHmac.digest('binary');

            return Buffer.from(protectedPayloadHash, 'binary');
        },

        _removePadding(payload)
        {
            var length = Buffer.from(payload.slice(-1));
            length = length.readUInt8(0);

            if(length > 0 && length < 16)
            {
                return Buffer.from(payload.slice(0, payload.length-length));
            } else {
                return payload;
            }
        },

        _addPadding(payload)
        {
            return payload;
        }
    }

}
