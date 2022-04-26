import { Cursor, SmartGlassLongArray, UInt32 } from "../unpack";
import { Message, MessageHeader } from "./Message";

export class Acknowledge implements Message {
  readonly lowWaterMark: number;
  readonly processedList: number[];
  readonly rejectedList: number[];

  constructor(readonly header: MessageHeader, payload: Buffer) {
    const cursor = new Cursor();
    this.lowWaterMark = UInt32(payload, cursor);
    this.processedList = SmartGlassLongArray(payload, cursor, UInt32);
    this.rejectedList = SmartGlassLongArray(payload, cursor, UInt32);
  }
}
