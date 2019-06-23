module.exports = function(packet)
{
    if(packet == undefined)
        packet = Buffer.from('');

    return {
        _packet: packet,
        _totalLength: packet.length,
        _offset: 0,

        setOffset: function(offset)
        {
            this._offset = offset;
        },

        getOffset: function()
        {
            return this._offset;
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

        readSGString: function()
        {
            var dataLength = this.readUInt16();
            var data = this._packet.slice(this._offset, this._offset+dataLength);

            this._offset = (this._offset+1+dataLength);

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
            var data =  '';

            if(count == false){
                data = this._packet.slice(this._offset);
                this._offset = (this._totalLength);
            } else {
                data = this._packet.slice(this._offset, this._offset+count);
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

        readUInt64: function()
        {
            var data = this.readBytes(8)

            return data
        },

        toBuffer: function()
        {
            return this._packet;
        },

        /* Private functions */
        _add(data)
        {
            this._packet = Buffer.concat([
                this._packet,
                data
            ]);
        },
    };
}
