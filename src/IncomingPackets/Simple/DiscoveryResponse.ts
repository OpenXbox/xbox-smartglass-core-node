import dgram from "dgram";
import os from "os";
import { Cursor, SmartGlassString, UInt16, UInt32 } from "../unpack";

export class DiscoveryResponse {
  static readonly type = "DD01";
  readonly flags: number;
  readonly clientType: number;
  readonly name: string;
  readonly uuid: string;
  readonly lastError: number;
  readonly certificate: string;
  readonly ip: string;
  readonly port: number;

  constructor(rawPacket: Buffer, rinfo: dgram.RemoteInfo) {
    // TODO this throw away at the start should probably be its own function.
    const cursor = new Cursor(2);
    const payloadLength = UInt16(rawPacket, cursor);
    const version = UInt16(rawPacket, cursor);
    this.flags = UInt32(rawPacket, cursor);
    this.clientType = UInt16(rawPacket, cursor);
    this.name = SmartGlassString(rawPacket, cursor);
    this.uuid = SmartGlassString(rawPacket, cursor);
    this.lastError = UInt32(rawPacket, cursor);
    this.certificate =
      "-----BEGIN CERTIFICATE-----" +
      os.EOL +
      SmartGlassString(rawPacket, cursor, "base64")
        .match(/.{0,64}/g)!
        .join("\n") +
      "-----END CERTIFICATE-----";
    this.ip = rinfo.address;
    this.port = rinfo.port;
  }
}
