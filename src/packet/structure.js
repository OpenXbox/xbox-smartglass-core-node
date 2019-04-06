module.exports = function(packet)
{
    if(packet == undefined)
        packet = Buffer.from('');
    else
        packet = packet;

    return {
        _packet: packet,
        _totalLength: packet.length,
        _offset: 0,

        setOffset: function(offset)
        {
            this._offset = offset;
        },

        writeSGString: function(data)
        {
            var lengthBuffer = Buffer.allocUnsafe(2);
            lengthBuffer.writeUInt16BE(data.length, 0);

            var dataBuffer = Buffer.from(data + '\x00');

            this._add(Buffer.concat([
                lengthBuffer,
                dataBuffer
            ]));

            return this;
        },

        readSGString: function(buffer = false)
        {
            var dataLength = this.readUInt16();
            var data = this._packet.slice(this._offset, this._offset+dataLength);

            this._offset = (this._offset+1+dataLength);

            if(buffer == false)
                return data;
            else
                return data;
        },

        writeBytes: function(data, type)
        {
            var dataBuffer = Buffer.from(data, type);

            this._add(dataBuffer);
            return this;
        },

        readBytes: function(count = false)
        {
            if(count == false){
                var data = this._packet.slice(this._offset);
                this._offset = (this._totalLength);
            } else {
                var data = this._packet.slice(this._offset, this._offset+count);
                this._offset = (this._offset+count);
            }

            return data;
        },

        writeUInt8: function(data)
        {
            var tempBuffer = Buffer.allocUnsafe(1);
            tempBuffer.writeUInt8(data, 0);
            this._add(tempBuffer);
            return this;
        },

        readUInt8: function()
        {
            var data = this._packet.readUInt8(this._offset);
            this._offset = (this._offset+1);

            return data;
        },

        writeUInt16: function(data)
        {
            var tempBuffer = Buffer.allocUnsafe(2);
            tempBuffer.writeUInt16BE(data, 0);
            this._add(tempBuffer);
            return this;
        },

        readUInt16: function()
        {
            var data = this._packet.readUInt16BE(this._offset);
            this._offset = (this._offset+2);

            return data;
        },

        writeUInt32: function(data)
        {
            var tempBuffer = Buffer.allocUnsafe(4);
            tempBuffer.writeUInt32BE(data, 0);
            this._add(tempBuffer);
            return this;
        },

        readUInt32: function()
        {
            var data = this._packet.readUInt32BE(this._offset);
            this._offset = (this._offset+4);

            return data;
        },

        // writeUInt64: function(data)
        // {
        //     var tempBuffer = Buffer.allocUnsafe(8);
        //     tempBuffer.writeUIntBE(data, 8);
        //     this._add(tempBuffer);
        // },

        readUInt64: function()
        {
            var n = this.readUInt32();
            var low = this.readUInt32();

            var calc =  n * 4294967296.0 + low;
            if (low < 0)
                calc += 4294967296;

            return calc;
        },

        toBuffer: function()
        {
            return this._packet;
        },

        /* Private functions */
        _add(data)
        {
            this._packet = new Buffer.concat([
                this._packet,
                data
            ]);
        },

        _readInt64BEasFloat(buffer, offset) {
            var low = readInt32BE(buffer, offset + 4);
            var n = readInt32BE(buffer, offset) * 4294967296.0 + low;
            if (low < 0) n += 4294967296;
            return n;
        }
    };
}
