import { SGCrypto } from "../../SGCrypto";
import { OutgoingPacket } from "../OutgoingPacket";
import { UInt16 } from "../pack";

export abstract class Simple extends OutgoingPacket {
  protected abstract getUnprotectedPayload(): Buffer[];
  protected getProtectedPayload?(crypto: SGCrypto): Buffer[];

  constructor(private readonly crypto?: SGCrypto) {
    super();
  }

  toBuffer() {
    const unprotectedPayload = Buffer.concat(this.getUnprotectedPayload());

    if (this.getProtectedPayload) {
      if (!this.crypto) {
        throw new Error("SGCrypto must be provided for getProtectedPayload.");
      }

      const protectedPayload = Buffer.concat(
        this.getProtectedPayload(this.crypto)
      );
      const encryptedPayload = this.crypto.encrypt(
        this.pad(protectedPayload),
        this.crypto.encryptionkey,
        this.crypto.iv
      );

      return this.crypto.sign(
        Buffer.concat([
          Buffer.from(this.type, "hex"),
          UInt16(unprotectedPayload.length),
          UInt16(protectedPayload.length),
          UInt16(this.version),
          unprotectedPayload,
          encryptedPayload,
        ])
      );
    }

    return Buffer.concat([
      Buffer.from(this.type, "hex"),
      UInt16(unprotectedPayload.length),
      UInt16(this.version),
      unprotectedPayload,
    ]);
  }
}
