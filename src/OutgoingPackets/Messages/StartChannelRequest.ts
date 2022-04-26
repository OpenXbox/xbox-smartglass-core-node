import { Flags } from "../../Flags";
import { SGCrypto } from "../../SGCrypto";
import { UInt32 } from "../pack";
import { Message } from "./Message";

export class StartChannelRequest extends Message {
  private readonly titleId = 0;
  private readonly activityId = 0;
  flags = new Flags({
    needsAck: false,
    isFragment: false,
    version: 2,
    messageType: 0x26,
  });

  constructor(
    crypto: SGCrypto,
    private readonly channelRequestId: number,
    private readonly service: string
  ) {
    super(crypto);
  }

  protected getPayload() {
    return [
      UInt32(this.channelRequestId),
      UInt32(this.titleId),
      Buffer.from(this.service, "hex"),
      UInt32(this.activityId),
    ];
  }
}
