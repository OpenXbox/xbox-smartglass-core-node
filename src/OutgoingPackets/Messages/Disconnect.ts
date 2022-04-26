import { Flags } from "../../Flags";
import { UInt32 } from "../pack";
import { Message } from "./Message";

export class Disconnect extends Message {
  readonly reason = UInt32(0);
  readonly error = UInt32(0);

  readonly flags = new Flags({
    version: 2,
    messageType: 0x2a,
    needsAck: false,
    isFragment: false,
  });

  protected getPayload() {
    return [this.reason, this.error];
  }
}
