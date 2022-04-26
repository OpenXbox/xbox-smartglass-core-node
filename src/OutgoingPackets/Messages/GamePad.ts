import { Flags } from "../../Flags";
import { SGCrypto } from "../../SGCrypto";
import { UInt16, Int32 } from "../pack";
import { Message } from "./Message";

export class GamePad extends Message {
  readonly timestamp = Buffer.from(
    "000" + new Date().getTime().toString(),
    "hex"
  );
  readonly buttons: Buffer;
  readonly leftTrigger: Buffer;
  readonly rightTrigger: Buffer;
  readonly leftThumbStickX: Buffer;
  readonly leftThumbStickY: Buffer;
  readonly rightThumbStickX: Buffer;
  readonly rightThumbStickY: Buffer;
  readonly flags = new Flags({
    version: 2,
    messageType: 0xf0a,
    needsAck: false,
    isFragment: false,
  });

  constructor(
    crypto: SGCrypto,
    channel: Buffer,
    state: {
      buttons: number;
      leftTrigger: number;
      rightTrigger: number;
      leftThumbStickX: number;
      leftThumbStickY: number;
      rightThumbStickX: number;
      rightThumbStickY: number;
    }
  ) {
    super(crypto, channel);
    this.buttons = UInt16(state.buttons);
    this.leftTrigger = Int32(state.leftTrigger);
    this.rightTrigger = Int32(state.rightTrigger);
    this.leftThumbStickX = Int32(state.leftThumbStickX);
    this.leftThumbStickY = Int32(state.leftThumbStickY);
    this.rightThumbStickX = Int32(state.rightThumbStickX);
    this.rightThumbStickY = Int32(state.rightThumbStickY);
  }

  protected getPayload() {
    return [
      this.timestamp,
      this.buttons,
      this.leftTrigger,
      this.rightTrigger,
      this.leftThumbStickX,
      this.leftThumbStickY,
      this.rightThumbStickX,
      this.rightThumbStickY,
    ];
  }
}
