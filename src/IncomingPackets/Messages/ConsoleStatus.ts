import {
  Bytes,
  Cursor,
  SmartGlassShortArray,
  SmartGlassString,
  UInt32,
} from "../unpack";
import { Message, MessageHeader } from "./Message";

interface App {
  id: number;
  flags: Buffer;
  productId: Buffer;
  sandboxId: Buffer;
  aumId: String;
}

export class ConsoleStatus implements Message {
  readonly liveTVProvider: number;
  readonly majorVersion: number;
  readonly minorVersion: number;
  readonly buildNumber: number;
  readonly locale: string;
  readonly apps: App[];

  constructor(readonly header: MessageHeader, payload: Buffer) {
    const cursor = new Cursor();
    this.liveTVProvider = UInt32(payload, cursor);
    this.majorVersion = UInt32(payload, cursor);
    this.minorVersion = UInt32(payload, cursor);
    this.buildNumber = UInt32(payload, cursor);
    this.locale = SmartGlassString(payload, cursor);
    this.apps = SmartGlassShortArray(payload, cursor, (data, cursor) => {
      return {
        id: UInt32(data, cursor),
        flags: Bytes(data, cursor, 2),
        productId: Bytes(data, cursor, 16),
        sandboxId: Bytes(data, cursor, 16),
        aumId: SmartGlassString(data, cursor),
      };
    });
  }
}
