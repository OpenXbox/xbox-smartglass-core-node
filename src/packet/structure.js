module.exports = function(packet)
{
    if(packet == undefined)
        packet = new Buffer('');

    return {
        _packet: packet,
        _offset: 0,

        writeSGString: function(data)
        {
            var lengthBuffer = Buffer.allocUnsafe(2);
            lengthBuffer.writeUInt16BE(data.length, 0);

            var dataBuffer = new Buffer(data + '\x00');

            this._add(Buffer.concat([
                lengthBuffer,
                dataBuffer
            ]));
        },

        readSGString: function(buffer = false)
        {
            var dataLength = this.readUInt16();
            var data = this._packet.slice(this._offset, this._offset+dataLength);

            this._offset = (this._offset+1+dataLength);

            if(buffer == false)
                return data.toString();
            else
                return data;
        },

        writeUInt16: function(data)
        {
            var tempBuffer = Buffer.allocUnsafe(2);
            tempBuffer.writeUInt16BE(data, 0);
            this._add(tempBuffer);
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
        },

        readUInt32: function()
        {
            var data = this._packet.readUInt32BE(this._offset);
            this._offset = (this._offset+4);

            return data;
        },

        toBuffer: function()
        {
            return new Buffer(this._packet);
        },

        /* Private functions */
        _add(data)
        {
            this._packet = new Buffer.concat([
                this._packet,
                data
            ]);
        }
    };
}
