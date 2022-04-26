import { EventEmitter } from "events";
import { ConnectResponse } from "./Simple/ConnectResponse";
import { ConsoleStatus } from "./Messages/ConsoleStatus";
import {
  Message,
  MessageConstructable,
  MessageHeader,
} from "./Messages/Message";
import { Bytes, Cursor, GetPacketType, UInt16 } from "./unpack";
import { SGCrypto } from "../SGCrypto";
import { debug } from "debug";
import { Acknowledge } from "./Messages/Acknowledge";
import { StartChannelResponse } from "./Messages/StartChannelResponse";
const log = debug("Unpacker");

const MESSAGE_CLASSES: { [key: number]: MessageConstructable } = {
  0x1: Acknowledge,
  0x1e: ConsoleStatus,
  0x27: StartChannelResponse,
};

export declare interface Unpacker {
  on(event: "message", listener: (connectResponse: Message) => void): this;
  on(
    event: "connect_response",
    listener: (connectResponse: ConnectResponse) => void
  ): this;
  on(event: "console_status", listener: (packet: ConsoleStatus) => void): this;
  on(event: "acknowledge", listener: (packet: Acknowledge) => void): this;
  on(
    event: "start_channel",
    listener: (packet: StartChannelResponse) => void
  ): this;
}
export class Unpacker extends EventEmitter {
  constructor(readonly crypto: SGCrypto) {
    super();
  }

  protected unpack = (msg: Buffer) => {
    log("Unpacking Message");
    const packetType = GetPacketType(msg);
    log(`Packet type: ${packetType}`);

    switch (packetType) {
      // A generic message
      case "d00d":
        const messageHeader = new MessageHeader(msg);
        const cursor = new Cursor(messageHeader.headerEndOffset);
        const remainder = Bytes(msg, cursor);
        const protectedPayload = remainder.slice(0, -32);
        // const signature = remainder.slice(-32);
        const iv = this.crypto.encrypt(msg.slice(0, 16), this.crypto.iv);
        // TODO this can throw.  everything throws here....
        const decryptedPayload = this.crypto.decrypt(protectedPayload, iv);

        const MessageClass = MESSAGE_CLASSES[messageHeader.messageType];
        if (!MessageClass) {
          log("No message class found");
          return;
        }

        const message = new MessageClass(messageHeader, decryptedPayload);
        if (message instanceof ConsoleStatus) {
          this.emit("console_status", message);
        } else if (message instanceof Acknowledge) {
          this.emit("acknowledge", message);
        } else if (message instanceof StartChannelResponse) {
          this.emit("start_channel", message);
        }

        this.emit("message", message);

        return message;
      // A connect response
      case "cc01":
        const connectResponse = new ConnectResponse(msg, this.crypto);
        this.emit("connect_response", connectResponse);
        return connectResponse;
      default:
        log(`Unsupported packet type: ${packetType}`);
    }
  };
}
