export const bufferToBin = (buff: Buffer) => {
  let binary = "";
  buff.forEach((byte) => {
    binary += byte.toString(2).padStart(8, "0");
  });
  return binary;
};
