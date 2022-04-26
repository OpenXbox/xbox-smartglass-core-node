import EventEmitter from "events";
import { DedicatedSocket } from "./DedicatedSocket";
import { Message } from "./IncomingPackets/Messages/Message";
import { Acknowledge as AckIn } from "./IncomingPackets/Messages/Acknowledge";
import { Acknowledge as AckOut } from "./OutgoingPackets/Messages/Acknowledge";
import { SGCrypto } from "./SGCrypto";

// TODO need to come back to connection management.
// We need to do a better job of tracking sequence numbers and acks.
export class HeartBeat extends EventEmitter {
  private readonly deadTimeoutInMS = 10000;
  private readonly retryTimeoutInMS = 5000;
  private deadTimeout?: NodeJS.Timeout;
  private retryTimeout?: NodeJS.Timeout;
  private isAlive = false;

  constructor(
    private readonly socket: DedicatedSocket,
    private readonly crypto: SGCrypto
  ) {
    super();

    socket.on("message", this.handleMessage.bind(this));
  }

  stop() {
    if (this.deadTimeout) {
      clearTimeout(this.deadTimeout);
    }
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  private handleMessage(message: Message) {
    if (message instanceof AckIn && !this.isAlive) {
      this.isAlive = true;
      this.emit("alive");
    }

    if (this.isAlive) {
      this.resetDeadTimeout();
      this.resetRetryTimeout();
    }

    if (message.header.needsAck) {
      this.socket.sendPacket(
        new AckOut(this.crypto, [message.header.sequenceNumber])
      );
    }
  }

  private resetRetryTimeout() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
    this.retryTimeout = setTimeout(() => {
      this.socket.sendPacket(new AckOut(this.crypto, []));
      this.resetRetryTimeout();
    }, this.retryTimeoutInMS);
  }

  private resetDeadTimeout() {
    if (this.deadTimeout) {
      clearTimeout(this.deadTimeout);
    }
    this.deadTimeout = setTimeout(() => {
      this.isAlive = false;
      if (this.retryTimeout) {
        clearTimeout(this.retryTimeout);
      }
      this.emit("dead");
    }, this.deadTimeoutInMS);
  }
}
