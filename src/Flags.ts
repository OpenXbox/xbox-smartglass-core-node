import { bufferToBin } from "./Utilities";

export class Flags {
  readonly version: number;
  readonly needsAck: boolean;
  readonly isFragment: boolean;
  readonly messageType: number;

  static parse(buff: Buffer) {
    if (buff.length !== 2) {
      throw new Error("Invalid buffer for flags. Must be of length 2.");
    }

    const flagBinaryString = bufferToBin(buff);

    return new Flags({
      needsAck: flagBinaryString.slice(2, 3) === "1",
      isFragment: flagBinaryString.slice(3, 4) === "1",
      version: parseInt(flagBinaryString.slice(0, 2), 2),
      messageType: parseInt(flagBinaryString.slice(4, 16), 2),
    });
  }

  constructor(flags: {
    version: number;
    messageType: number;
    needsAck: boolean;
    isFragment: boolean;
  }) {
    if (flags.messageType > 4095 || flags.messageType < 0) {
      throw new Error("Message Type is out of range");
    }

    if (flags.version > 3 || flags.version < 0) {
      throw new Error("Version is out of range");
    }

    this.version = flags.version;
    this.messageType = flags.messageType;
    this.needsAck = flags.needsAck;
    this.isFragment = flags.isFragment;
  }

  // This method is only used for testing.
  toBinary() {
    return bufferToBin(this.toBuffer());
  }

  toBuffer() {
    const needsAck = this.needsAck ? 1 : 0;
    const isFragment = this.isFragment ? 1 : 0;
    const number =
      (this.version << 14) +
      (needsAck << 13) +
      (isFragment << 12) +
      this.messageType;
    const buff = Buffer.alloc(2);
    buff.writeUInt16BE(number);
    return buff;
  }
}
