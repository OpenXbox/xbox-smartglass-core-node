import { debug, Debugger } from "debug";
import { EventEmitter } from "events";
import { Controller } from "./Controller";
import { DedicatedSocket } from "./DedicatedSocket";
import { DiscoverySocket } from "./DiscoverySocket";
import { HeartBeat } from "./HeartBeat";
import { DiscoveryResponse } from "./IncomingPackets/Simple/DiscoveryResponse";
import { InputChannel } from "./InputChannel";
import { Disconnect } from "./OutgoingPackets/Messages/Disconnect";
import { PowerOff } from "./OutgoingPackets/Messages/PowerOff";
import { ConnectRequest } from "./OutgoingPackets/Simple/ConnectRequest";
import { SGCrypto } from "./SGCrypto";
import { TurnOn } from "./TurnOn";

export declare interface Xbox {
  on(event: "disconnected", listener: () => void): this;
  once(event: "disconnected", listener: () => void): this;
  on(event: "connected", listener: () => void): this;
  once(event: "connected", listener: () => void): this;
  on(event: "disposed", listener: () => void): this;
  once(event: "disposed", listener: () => void): this;
}

export class Xbox extends EventEmitter {
  readonly Buttons = Controller.Buttons;
  readonly ip: string;
  readonly liveId: string;
  private readonly log: Debugger;
  private readonly crypto: SGCrypto;
  private readonly socket: DedicatedSocket;
  private readonly inputChannel: InputChannel;
  private readonly heartBeat: HeartBeat;
  private connectInterval?: NodeJS.Timeout;
  private connected = false;
  private autoReconnectEnabled = true;
  private disposed = false;

  get isConnected() {
    return this.connected;
  }

  get isAutoReconnectEnabled() {
    return this.autoReconnectEnabled;
  }

  get isDisposed() {
    return this.disposed;
  }

  readonly controller = new Controller();

  constructor(
    discoveryResponse: DiscoveryResponse,
    private readonly discoverySocket: DiscoverySocket
  ) {
    super();
    this.log = debug(`XboxConsole:${discoveryResponse.ip}`);
    this.crypto = new SGCrypto(discoveryResponse.certificate);
    this.socket = new DedicatedSocket(
      discoveryResponse.ip,
      discoveryResponse.port,
      this.crypto
    );

    this.liveId = this.crypto.liveId;
    this.ip = discoveryResponse.ip;

    this.inputChannel = new InputChannel(
      this.crypto,
      this.socket,
      this.controller,
      this.ip
    );

    this.heartBeat = new HeartBeat(this.socket, this.crypto);

    this.heartBeat.on("dead", () => {
      this.log("Connection has died...");
      this.connected = false;
      this.disconnect();
      this.startConnectionInterval();
      this.emit("disconnected");
    });

    this.heartBeat.on("alive", () => {
      this.log("Connection established");
      this.connected = true;
      this.emit("connected");
    });

    this.socket.on("console_status", (consoleStatus) => {
      // TODO keep track of the console status, maybe re-emit the event?
    });

    this.socket.on("connect_response", () => {
      this.stopConnectionInterval();
    });
  }

  private startConnectionInterval() {
    if (this.connectInterval) return;
    this.connectInterval = setInterval(() => {
      if (this.autoReconnectEnabled) {
        this.socket.sendPacket(new ConnectRequest(this.crypto));
      } else {
        this.stopConnectionInterval();
      }
    }, 1000);
  }

  private stopConnectionInterval() {
    if (!this.connectInterval) return;
    clearInterval(this.connectInterval);
    this.connectInterval = undefined;
  }

  async connect(timeout = 10000) {
    if (this.connected) return;

    this.startConnectionInterval();

    return Promise.race([
      new Promise((_resolve, reject) =>
        setTimeout(() => reject(new Error("Connection timed out")), timeout)
      ),
      new Promise((resolve) => {
        // TODO this feels memory leaky.
        this.heartBeat.once("alive", resolve);
      }),
    ]);
  }

  disconnect() {
    this.stopConnectionInterval();
    this.heartBeat.stop();
    this.inputChannel.stop();
    this.socket.sendPacket(new Disconnect(this.crypto));
    this.connected = false;
  }

  setAutoReconnect(autoReconnectEnabled: boolean) {
    this.autoReconnectEnabled = autoReconnectEnabled;
  }

  powerOff() {
    this.socket.sendPacket(new PowerOff(this.crypto));
  }

  async powerOn(timeout = 15000) {
    await TurnOn(this.crypto.liveId, this.ip, this.discoverySocket, timeout);
  }

  // TODO this is meant to be called when the user is done with the xboxConsole.
  dispose() {
    if (this.disposed) return;
    // TODO make sure we don't have anything else still running.

    this.stopConnectionInterval();
    this.socket.removeAllListeners();
    this.disconnect();
    this.socket.dispose();
    this.disposed = true;
    // Make sure to emit disposed before removing all listeners
    this.emit("disposed");
    this.removeAllListeners();
    this.log("Disposed");
  }
}
