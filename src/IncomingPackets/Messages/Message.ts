import { Flags } from "../../Flags";
import { Bytes, Cursor, UInt16, UInt32 } from "../unpack";

export class MessageHeader {
  readonly type: string;
  readonly headerEndOffset: number;
  readonly payloadLength: number;
  readonly sequenceNumber: number;
  readonly targetParticipantId: number;
  readonly sourceParticipantId: number;
  readonly version: number;
  readonly needsAck: boolean;
  readonly isFragment: boolean;
  readonly channelId: String;
  readonly messageType: number;

  constructor(msg: Buffer) {
    const cursor = new Cursor();
    this.type = Bytes(msg, cursor, 2).toString("hex");
    this.payloadLength = UInt16(msg, cursor);
    this.sequenceNumber = UInt32(msg, cursor);
    this.targetParticipantId = UInt32(msg, cursor);
    this.sourceParticipantId = UInt32(msg, cursor);
    const flags = Flags.parse(Bytes(msg, cursor, 2));
    this.needsAck = flags.needsAck;
    this.isFragment = flags.isFragment;
    this.version = flags.version;
    this.messageType = flags.messageType;
    this.channelId = Bytes(msg, cursor, 8).toString("hex");
    this.headerEndOffset = cursor.getOffset();
  }
}

export interface Message {
  readonly header: MessageHeader;
}

export interface MessageConstructable {
  new (header: MessageHeader, payload: Buffer): Message;
}
