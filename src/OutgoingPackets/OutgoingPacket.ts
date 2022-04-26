export abstract class OutgoingPacket {
  abstract readonly type: string;
  abstract readonly version: number;

  abstract toBuffer(packetInfo: {
    requestNumber: number;
    participantId: number;
  }): Buffer;

  /**
   * Pads the buffer to be evenly divisible by 16.
   * Padding consists of the count of bytes added.
   * @param buff The buffer to apply padding to.
   * @returns A new buffer with padding applied.
   */
  protected pad(buff: Buffer) {
    return Buffer.concat([
      buff,
      buff.length % 16 === 0
        ? Buffer.from([])
        : Buffer.from(
            new Array(16 - (buff.length % 16)).fill(16 - (buff.length % 16))
          ),
    ]);
  }
}
