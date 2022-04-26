import dgram from "dgram";
import { OutgoingPacket } from "./OutgoingPackets/OutgoingPacket";
import { SGCrypto } from "./SGCrypto";
import { Unpacker } from "./IncomingPackets/Unpacker";
import { debug, Debugger } from "debug";
import { ConnectRequest } from "./OutgoingPackets/Simple/ConnectRequest";
import { ConnectResponse } from "./IncomingPackets/Simple/ConnectResponse";
import { LocalJoin } from "./OutgoingPackets/Messages/LocalJoin";

export class DedicatedSocket extends Unpacker {
  private readonly socket: dgram.Socket;
  private readonly log: Debugger;
  // TODO confirm that 0 is not a valid participant ID?
  private participantId = 0;
  private totalRequests = 1;

  private ready = false;
  private queuedPackets: OutgoingPacket[] = [];

  constructor(ip: string, port: number, sgCrypto: SGCrypto) {
    super(sgCrypto);
    this.log = debug("Dedicated Socket:" + ip + ":" + port);
    this.socket = dgram.createSocket("udp4");
    this.socket.connect(port, ip, () => {
      this.log("Connected");
    });

    this.socket.on("error", (err) => {
      this.log("Server Error");
      this.log(err);
      this.socket.close();
    });

    this.socket.on("close", () => {
      this.log("Server closed");
      // TODO, what should we do now??
    });

    this.socket.on("message", (msg, rinfo) => {
      const packet = this.unpack(msg);
      this.log("Packet Received");
      this.log(packet);

      if (packet instanceof ConnectResponse) {
        this.participantId = packet.participantId;
        this.totalRequests = 1;
        // TODO make sure connection state is 0?
        // TODO maybe we want to have some retry logic for sending LocalJoin?
        const localJoin = new LocalJoin(sgCrypto);
        this.sendPacket(localJoin);
      }
    });

    this.socket.on("listening", () => {
      const address = this.socket.address();
      this.log(`Listening on ${address.address}:${address.port}`);
      this.queuedPackets.forEach((packet) => {
        setTimeout(() => this.sendPacket(packet));
      });
      this.queuedPackets = [];
      this.ready = true;
    });
  }

  dispose() {
    this.socket.close();
  }

  sendPacket(packet: OutgoingPacket, silent = false) {
    if (!this.ready) {
      this.queuedPackets.push(packet);
      return;
    }

    if (!this.participantId && !(packet instanceof ConnectRequest)) {
      this.log("Must connect first");
      return;
    }

    if (!silent) {
      this.log(`Sending Packet: ${this.totalRequests}`);
      this.log(packet);
    }

    this.socket.send(
      packet.toBuffer({
        requestNumber: this.totalRequests,
        participantId: this.participantId,
      }),
      (err, bytes) => {
        // TODO should we check for errors and retry?
      }
    );

    this.totalRequests++;
  }

  getNextRequestNumber() {
    return this.totalRequests;
  }
  getParticipantId() {
    return this.participantId;
  }
}
