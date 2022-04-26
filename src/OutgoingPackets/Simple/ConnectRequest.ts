import { SGCrypto } from "../../SGCrypto";
import { OutgoingPacket } from "../OutgoingPacket";
import { SmartGlassString, UInt16, UInt32, UInt8 } from "../pack";
import { Simple } from "./Simple";

export class ConnectRequest extends Simple {
  readonly type = "cc00";
  readonly version = 2;
  readonly uuid: Buffer;
  readonly pubkey: Buffer;
  readonly iv: Buffer;
  constructor(crypto: SGCrypto) {
    super(crypto);
    this.uuid = crypto.uuid;
    this.pubkey = crypto.pubkey;
    this.iv = crypto.iv;
  }

  getProtectedPayload() {
    return [
      SmartGlassString(""),
      SmartGlassString(""),
      UInt32(0),
      UInt32(0),
      UInt32(1),
    ];
  }

  getUnprotectedPayload() {
    return [this.uuid, UInt16(0), this.pubkey, this.iv];
  }
}
