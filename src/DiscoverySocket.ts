import dgram from "dgram";
import { DiscoveryRequest } from "./OutgoingPackets/Simple/DiscoveryRequest";
import { GetPacketType } from "./IncomingPackets/unpack";
import { DiscoveryResponse } from "./IncomingPackets/Simple/DiscoveryResponse";
import { EventEmitter } from "events";
import { debug } from "debug";
import { PowerOn } from "./OutgoingPackets/Simple/PowerOn";
const log = debug("Discovery Socket");

export declare interface DiscoverySocket {
  on(
    event: "discovery",
    listener: (discoveryResponse: DiscoveryResponse) => void
  ): this;
}

export class DiscoverySocket extends EventEmitter {
  private readonly socket: dgram.Socket;
  private discoveryInterval?: NodeJS.Timeout;
  private activeStartCalls = 0;

  startDiscovery() {
    this.activeStartCalls++;
    // TODO, we need to make sure that the server is listening.
    this.discoveryInterval = setInterval(() => {
      this.sendDiscoveryPacket();
    }, 1000);
  }

  stopDiscovery() {
    // Attempting to make sure that if multiple calls to
    // startDiscovery are made, that we wait for the same amount
    // of calls to stopDiscovery before stopping.
    if (this.activeStartCalls > 0) {
      this.activeStartCalls--;
    }
    if (this.activeStartCalls > 0) {
      return;
    }

    if (this.discoveryInterval) {
      clearInterval(this.discoveryInterval);
      this.discoveryInterval = undefined;
    }
  }

  dispose() {
    if (this.discoveryInterval) {
      clearInterval(this.discoveryInterval);
    }

    this.socket.close();
  }

  constructor() {
    super();
    this.socket = dgram.createSocket("udp4");
    this.socket.bind();

    this.socket.on("error", (err) => {
      log("Server Error");
      log(err);
      this.socket.close();
    });

    this.socket.on("close", () => {
      log("Server Closed");
      // TODO, what should we do now??
    });

    this.socket.on("message", (msg, rinfo) => {
      const type = GetPacketType(msg);
      // We only care about DiscoveryResponses here.
      if (type.toLowerCase() === DiscoveryResponse.type.toLowerCase()) {
        log(`Xbox discovered at ${rinfo.address}:${rinfo.port}`);
        const discoveryResponse = new DiscoveryResponse(msg, rinfo);
        log(discoveryResponse);
        this.emit("discovery", discoveryResponse);
      }
    });

    this.socket.on("listening", () => {
      this.socket.setBroadcast(true);
      const address = this.socket.address();
      log(`Discovery socket listening ${address.address}:${address.port}`);
    });
  }

  sendPowerOn(liveId: string, ip: string) {
    const buffer = new PowerOn(liveId).toBuffer();
    this.socket.send(buffer, 0, buffer.length, 5050, ip);
  }

  private sendDiscoveryPacket() {
    log("Sending Discovery Packet");
    const packet = new DiscoveryRequest();
    const buffer = packet.toBuffer();
    this.socket.send(buffer, 0, buffer.length, 5050, "255.255.255.255");
  }
}
