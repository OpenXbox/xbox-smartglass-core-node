import { EventEmitter } from "events";
import { DiscoverySocket } from "./DiscoverySocket";
import { TurnOn } from "./TurnOn";
import { Xbox } from "./Xbox";

declare interface XboxSmartGlass {
  on(event: "discovery", listener: (xbox: Xbox) => void): this;
  once(event: "discovery", listener: (xbox: Xbox) => void): this;
  on(event: "disposed", listener: () => void): this;
  once(event: "disposed", listener: () => void): this;
}

class XboxSmartGlass extends EventEmitter {
  private readonly discoverySocket = new DiscoverySocket();
  private disposed = false;
  private consoles: { [key: string]: Xbox } = {};
  private isDiscovering = false;

  getXboxConsoles() {
    return Object.values(this.consoles);
  }

  startDiscovery() {
    this.isDiscovering = true;
    this.discoverySocket.startDiscovery();
  }

  stopDiscovery() {
    this.isDiscovering = false;
    this.discoverySocket.stopDiscovery();
  }

  dispose() {
    if (this.disposed) return;
    this.getXboxConsoles().forEach((xbox) => xbox.dispose());
    this.discoverySocket.dispose();
    this.disposed = true;
    this.emit("disposed");
    this.removeAllListeners();
  }

  async powerOn(liveId: string, ip: string, timeout?: number) {
    if (this.consoles[ip]) {
      await this.consoles[ip].powerOn(timeout);
      return this.consoles[ip];
    } else {
      await TurnOn(liveId, ip, this.discoverySocket, timeout);
      if (!this.consoles[ip]) {
        throw new Error("An unknown error ocurred");
      }

      return this.consoles[ip];
    }
  }

  constructor() {
    super();

    this.discoverySocket.on("discovery", (discoveryResponse) => {
      if (!this.consoles[discoveryResponse.ip]) {
        const newXbox = new Xbox(discoveryResponse, this.discoverySocket);
        this.consoles[discoveryResponse.ip] = newXbox;

        // Setup a listener for when the xbox is disposed so we can
        // remove our reference to it.
        newXbox.on("disposed", () => {
          delete this.consoles[discoveryResponse.ip];
        });
      }

      if (this.isDiscovering) {
        this.emit("discovery", this.consoles[discoveryResponse.ip]);
      }
    });
  }
}

const xboxSmartGlass = new XboxSmartGlass();

// This ensures that we dispose of everything when the process is killed.
// I've found that during development too many unclosed channels can cause
// the Xbox to stop responding to things like controller input.
process.on("SIGINT", () => xboxSmartGlass.dispose());

export default xboxSmartGlass;
