import { Flags } from "../../Flags";
import { SGCrypto } from "../../SGCrypto";
import { Message } from "./Message";

export class StopChannel extends Message {
  readonly flags = new Flags({
    needsAck: false,
    isFragment: false,
    version: 2,
    messageType: 0x28,
  });

  constructor(crypto: SGCrypto, private readonly stopChannel: Buffer) {
    super(crypto);
  }

  protected getPayload() {
    return [this.stopChannel];
  }
}
