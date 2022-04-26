import { Bytes, Cursor, UInt32 } from "../unpack";
import { Message, MessageHeader } from "./Message";

export class StartChannelResponse implements Message {
  readonly channelRequestId: number;
  readonly channelId: Buffer;
  readonly result: number;

  get success() {
    return this.result === 0;
  }

  constructor(readonly header: MessageHeader, payload: Buffer) {
    const cursor = new Cursor();
    this.channelRequestId = UInt32(payload, cursor);
    this.channelId = Bytes(payload, cursor, 8);
    this.result = UInt32(payload, cursor);
  }
}
