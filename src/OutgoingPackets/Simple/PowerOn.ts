import { SmartGlassString } from "../pack";
import { Simple } from "./Simple";

export class PowerOn extends Simple {
  readonly type = "dd02";
  readonly version = 0;
  constructor(readonly liveId: string) {
    super();
  }

  getUnprotectedPayload() {
    return [SmartGlassString(this.liveId)];
  }
}
