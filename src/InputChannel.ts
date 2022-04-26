import { debug, Debugger } from "debug";
import { Controller } from "./Controller";
import { DedicatedSocket } from "./DedicatedSocket";
import { GamePad } from "./OutgoingPackets/Messages/GamePad";
import { StartChannelRequest } from "./OutgoingPackets/Messages/StartChannelRequest";
import { StopChannel } from "./OutgoingPackets/Messages/StopChannel";
import { SGCrypto } from "./SGCrypto";

export class InputChannel {
  private channelId?: Buffer;
  private channelInterval?: NodeJS.Timeout;
  private readonly log: Debugger;

  stop() {
    this.log("Stopping Input Channel");
    if (this.channelId) {
      this.socket.sendPacket(new StopChannel(this.crypto, this.channelId));
      this.channelId = undefined;
    }

    if (this.channelInterval) {
      clearInterval(this.channelInterval);
    }
  }

  // TODO this needs to be handled by xboxConsole.
  private channelNumber = 0;

  constructor(
    private readonly crypto: SGCrypto,
    private readonly socket: DedicatedSocket,
    private readonly controller: Controller,
    ip: string
  ) {
    this.log = debug(`InputChannel:${ip}`);
    this.socket.on("start_channel", (response) => {
      if (!response.success) {
        this.log(
          "***\n\n\n\n****\n\n\nNeed to handle start channel failing\n\n\n\n*****"
        );
        throw new Error("lol");
      }
      if (response.success && !this.channelId) {
        this.channelId = response.channelId;
        this.channelInterval = setInterval(() => {
          if (this.channelId) {
            this.socket.sendPacket(
              new GamePad(
                this.crypto,
                this.channelId,
                this.controller.getState()
              ),
              true
            );
          }
        }, 20); // TODO this value should be modifiable by the user.
      }
    });

    this.socket.on("acknowledge", () => {
      if (this.channelId) return;
      this.socket.sendPacket(
        new StartChannelRequest(
          this.crypto,
          this.channelNumber++,
          "fa20b8ca66fb46e0adb60b978a59d35f"
        )
      );
    });
  }
}
