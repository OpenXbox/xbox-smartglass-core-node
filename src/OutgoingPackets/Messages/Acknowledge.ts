import { Flags } from "../../Flags";
import { SGCrypto } from "../../SGCrypto";
import { SmartGlassLongArray, UInt32 } from "../pack";
import { Message } from "./Message";

export class Acknowledge extends Message {
  flags = new Flags({
    needsAck: true,
    isFragment: false,
    version: 2,
    messageType: 0x01,
  });

  constructor(crypto: SGCrypto, readonly acknowledgedSequenceIds: number[]) {
    super(crypto);
  }

  protected getPayload() {
    return [
      UInt32(
        this.acknowledgedSequenceIds[this.acknowledgedSequenceIds.length - 1]
      ),
      SmartGlassLongArray(this.acknowledgedSequenceIds, UInt32),
      SmartGlassLongArray([], UInt32),
    ];
  }
}
