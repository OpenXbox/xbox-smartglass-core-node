export const SmartGlassString = (data: string) => {
  const lengthBuff = Buffer.alloc(2);
  lengthBuff.writeUInt16BE(data.length, 0);
  const dataBuff = Buffer.from(data + "\x00");

  return Buffer.concat([lengthBuff, dataBuff]);
};

export const SmartGlassShortArray: <T>(
  data: T[],
  packer: (data: T) => Buffer
) => Buffer = (data, packer) => {
  const result = Buffer.concat(data.map(packer));
  return Buffer.concat([UInt16(data.length), result]);
};

export const SmartGlassLongArray: <T>(
  data: T[],
  packer: (data: T) => Buffer
) => Buffer = (data, packer) => {
  const result = Buffer.concat(data.map(packer));

  return Buffer.concat([UInt32(data.length), result]);
};

export const UInt8 = (data: number) => {
  const buff = Buffer.alloc(1);
  buff.writeUInt8(data, 0);
  return buff;
};

export const UInt16 = (data: number) => {
  const buff = Buffer.alloc(2);
  buff.writeUInt16BE(data, 0);
  return buff;
};

export const UInt32 = (data: number) => {
  const buff = Buffer.alloc(4);
  buff.writeUInt32BE(data, 0);
  return buff;
};

export const Int32 = (data: number) => {
  const buff = Buffer.alloc(4);
  buff.writeInt32BE(data, 0);
  return buff;
};
