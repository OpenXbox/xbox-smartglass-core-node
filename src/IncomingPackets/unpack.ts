export const GetPacketType = (packet: Buffer) => {
  return packet.slice(0, 2).toString("hex");
};

export class Cursor {
  private offset = 0;
  getOffset = () => this.offset;
  increment = (amount: number) => {
    this.offset += amount;
  };
  constructor(initialOffset = 0) {
    this.offset = initialOffset;
  }
}

export const SmartGlassString = (
  data: Buffer,
  cursor: Cursor,
  base?: "base64"
) => {
  const dataLength = UInt16(data, cursor);
  const result = data.slice(
    cursor.getOffset(),
    cursor.getOffset() + dataLength
  );
  cursor.increment(dataLength + 1);
  return result.toString(base);
};

const SmartGlassArray: <T>(
  data: Buffer,
  cursor: Cursor,
  readLength: (data: Buffer, cursor: Cursor) => number,
  unpacker: (data: Buffer, cursor: Cursor) => T
) => T[] = (data, cursor, readLength, unpacker) => {
  const arrayCount = readLength(data, cursor);
  const result = [];
  for (let i = 0; i < arrayCount; i++) {
    result.push(unpacker(data, cursor));
  }
  return result;
};

export const SmartGlassShortArray: <T>(
  data: Buffer,
  cursor: Cursor,
  unpacker: (data: Buffer, cursor: Cursor) => T
) => T[] = (data, cursor, unpacker) => {
  return SmartGlassArray(data, cursor, UInt16, unpacker);
};

export const SmartGlassLongArray: <T>(
  data: Buffer,
  cursor: Cursor,
  unpacker: (data: Buffer, cursor: Cursor) => T
) => T[] = (data, cursor, unpacker) => {
  return SmartGlassArray(data, cursor, UInt32, unpacker);
};

export const Bytes = (data: Buffer, cursor: Cursor, count?: number) => {
  if (count === 0) {
    console.warn("Did you really mean to read 0 bytes?");
    return Buffer.from([]);
  }

  const result = data.slice(
    cursor.getOffset(),
    count ? cursor.getOffset() + count : undefined
  );
  cursor.increment(result.length);
  return result;
};

export const UInt8 = (data: Buffer, cursor: Cursor) => {
  const result = data.readUint8(cursor.getOffset());
  cursor.increment(1);
  return result;
};

export const UInt16 = (data: Buffer, cursor: Cursor) => {
  const result = data.readUint16BE(cursor.getOffset());
  cursor.increment(2);
  return result;
};

export const UInt32 = (data: Buffer, cursor: Cursor) => {
  const result = data.readUInt32BE(cursor.getOffset());
  cursor.increment(4);
  return result;
};

export const Int32 = (data: Buffer, cursor: Cursor) => {
  const result = data.readInt32BE(cursor.getOffset());
  cursor.increment(4);
  return result;
};
