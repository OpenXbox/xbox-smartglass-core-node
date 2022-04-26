import { Flags } from "../../Flags";
import { SGCrypto } from "../../SGCrypto";
import { OutgoingPacket } from "../OutgoingPacket";
import { UInt16, UInt32 } from "../pack";

export abstract class Message extends OutgoingPacket {
  readonly version = 2;
  readonly type = "d00d";
  readonly channel = Buffer.from("\x00\x00\x00\x00\x00\x00\x00\x00");
  protected abstract readonly flags: Flags;
  protected abstract getPayload(): Buffer[];

  constructor(private readonly crypto: SGCrypto, channel?: Buffer) {
    super();
    if (channel) {
      // TODO ensure channel buffer is correct length
      this.channel = channel;
    }
  }

  toBuffer(packetInfo: { requestNumber: number; participantId: number }) {
    const payload = Buffer.concat(this.getPayload());
    const header = this.getHeader(packetInfo, payload.length, this.channel);
    const iv = this.crypto.encrypt(header.slice(0, 16), this.crypto.iv);

    const encryptedPayload = this.crypto.encrypt(
      this.pad(payload),
      this.crypto.encryptionkey,
      iv
    );

    return this.crypto.sign(Buffer.concat([header, encryptedPayload]));
  }

  private getHeader(
    packetInfo: {
      requestNumber: number;
      participantId: number;
    },
    payloadLength: number,
    channel: Buffer
  ) {
    return Buffer.concat([
      Buffer.from(this.type, "hex"),
      UInt16(payloadLength),
      UInt32(packetInfo.requestNumber),
      UInt32(0), // Target participant ID is always 0.
      UInt32(packetInfo.participantId),
      this.flags.toBuffer(),
      channel,
    ]);
  }
}
