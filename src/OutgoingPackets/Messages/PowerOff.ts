import { Flags } from "../../Flags";
import { SGCrypto } from "../../SGCrypto";
import { SmartGlassString } from "../pack";
import { Message } from "./Message";

export class PowerOff extends Message {
  readonly flags = new Flags({
    version: 2,
    messageType: 0x39,
    needsAck: false,
    isFragment: false,
  });

  readonly liveId: string;

  constructor(crypto: SGCrypto) {
    super(crypto);
    this.liveId = crypto.liveId;
  }

  protected getPayload() {
    return [SmartGlassString(this.liveId)];
  }
}
