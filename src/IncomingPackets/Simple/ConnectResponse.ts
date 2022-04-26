import { SGCrypto } from "../../SGCrypto";
import { Bytes, Cursor, UInt16, UInt32 } from "../unpack";

export class ConnectResponse {
  readonly connectResult: number;
  readonly pairingState: number;
  readonly participantId: number;
  constructor(payload: Buffer, sgCrypto: SGCrypto) {
    const cursor = new Cursor(2);
    const payloadLength = UInt16(payload, cursor);
    const protectedPayloadLength = UInt16(payload, cursor);
    const version = UInt16(payload, cursor);
    const iv = Bytes(payload, cursor, 16);
    const encryptedPayload = Bytes(payload, cursor);
    const decryptedPayload = sgCrypto.decrypt(encryptedPayload, iv);
    const cursor2 = new Cursor();
    this.connectResult = UInt16(decryptedPayload, cursor2);
    this.pairingState = UInt16(decryptedPayload, cursor2);
    this.participantId = UInt32(decryptedPayload, cursor2);
  }
}
