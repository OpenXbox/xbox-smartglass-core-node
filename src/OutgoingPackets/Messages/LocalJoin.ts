import { Flags } from "../../Flags";
import { UInt32, UInt16, SmartGlassString } from "../pack";
import { Message } from "./Message";

export class LocalJoin extends Message {
  readonly clientType = UInt16(3);
  readonly nativeWidth = UInt16(1080);
  readonly nativeHeight = UInt16(1920);
  readonly dpiX = UInt16(96);
  readonly dpiY = UInt16(96);
  readonly deviceCapabilities = Buffer.from("FFFFFFFFFFFFFFFF", "hex");
  readonly clientVersion = UInt32(15);
  readonly osMajorVersion = UInt32(6);
  readonly osMinorVersion = UInt32(2);
  readonly displayName = SmartGlassString("Xbox-SmartGlass-Node");
  readonly flags = new Flags({
    version: 2,
    messageType: 0x03,
    needsAck: true,
    isFragment: false,
  });

  protected getPayload() {
    return [
      this.clientType,
      this.nativeWidth,
      this.nativeHeight,
      this.dpiX,
      this.dpiY,
      this.deviceCapabilities,
      this.clientVersion,
      this.osMajorVersion,
      this.osMinorVersion,
      this.displayName,
    ];
  }
}
