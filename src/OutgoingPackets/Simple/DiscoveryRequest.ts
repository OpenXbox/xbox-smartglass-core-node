import { UInt32, UInt16 } from "../pack";
import { Simple } from "./Simple";

export class DiscoveryRequest extends Simple {
  readonly type = "DD00";
  readonly version = 0;
  readonly flags = UInt32(0);
  readonly client_type = 3;
  readonly min_version = 0;
  readonly max_version = 2;

  protected getUnprotectedPayload() {
    return [
      this.flags,
      UInt16(this.client_type),
      UInt16(this.min_version),
      UInt16(this.max_version),
    ];
  }
}
