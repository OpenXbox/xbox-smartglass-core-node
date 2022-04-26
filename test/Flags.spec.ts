import { expect } from "chai";
import { Flags } from "../src/Flags";
import "mocha";

describe("Flags", () => {
  describe("Generic Tests", () => {
    it("should set the needsAck flag", () => {
      const flag = new Flags({
        version: 0,
        messageType: 0,
        needsAck: true,
        isFragment: false,
      });

      expect(flag.toBinary()).to.equal("0010000000000000");
    });

    it("should set the isFragment flag", () => {
      const flag = new Flags({
        version: 0,
        messageType: 0,
        needsAck: false,
        isFragment: true,
      });

      expect(flag.toBinary()).to.equal("0001000000000000");
    });

    it("should set the isFragment and needsAck flag", () => {
      const flag = new Flags({
        version: 0,
        messageType: 0,
        needsAck: true,
        isFragment: true,
      });

      expect(flag.toBinary()).to.equal("0011000000000000");
    });

    it("should set the version flag", () => {
      const flag = new Flags({
        version: 3,
        messageType: 0,
        needsAck: false,
        isFragment: false,
      });

      expect(flag.toBinary()).to.equal("1100000000000000");
    });

    it("should throw if version flag is out of range", () => {
      expect(
        () =>
          new Flags({
            version: 4,
            messageType: 0,
            needsAck: false,
            isFragment: false,
          })
      ).to.throw();

      expect(
        () =>
          new Flags({
            version: -1,
            messageType: 0,
            needsAck: false,
            isFragment: false,
          })
      ).to.throw();
    });

    it("should set the messageType flag", () => {
      let flag = new Flags({
        version: 0,
        messageType: 4095,
        needsAck: false,
        isFragment: false,
      });

      expect(flag.toBinary()).to.equal("0000111111111111");

      flag = new Flags({
        version: 0,
        messageType: 1,
        needsAck: false,
        isFragment: false,
      });

      expect(flag.toBinary()).to.equal("0000000000000001");
    });

    it("should throw if messageType is out of range", () => {
      expect(
        () =>
          new Flags({
            version: 0,
            messageType: 4096,
            needsAck: false,
            isFragment: false,
          })
      ).to.throw();

      expect(
        () =>
          new Flags({
            version: 0,
            messageType: -1,
            needsAck: false,
            isFragment: false,
          })
      ).to.throw();
    });

    it("should throw when parsing an invalid buffer", () => {
      expect(() => Flags.parse(Buffer.from([]))).to.throw();
    });
  });

  describe("Local Join Flags", () => {
    const LocalJoinFlagBuffer = Buffer.from("a003", "hex");
    const LocalJoinFlagBytes = "1010000000000011";
    const version = 2;
    const messageType = 3;
    const needsAck = true;
    const isFragment = false;

    it("should parse from a buffer", () => {
      const localJoinFlag = Flags.parse(LocalJoinFlagBuffer);
      expect(localJoinFlag.toBinary()).to.equal(LocalJoinFlagBytes);
      expect(localJoinFlag.toBuffer()).to.deep.equal(LocalJoinFlagBuffer);
      expect(localJoinFlag.version).to.equal(version);
      expect(localJoinFlag.messageType).to.equal(messageType);
      expect(localJoinFlag.needsAck).to.equal(needsAck);
      expect(localJoinFlag.isFragment).to.equal(isFragment);
    });

    it("should correctly create a new instance", () => {
      const localJoinFlag = new Flags({
        version,
        messageType,
        needsAck,
        isFragment,
      });
      expect(localJoinFlag.toBinary()).to.equal(LocalJoinFlagBytes);
      expect(localJoinFlag.toBuffer()).to.deep.equal(LocalJoinFlagBuffer);
    });
  });

  describe("Acknowledge Flags", () => {
    const AcknowledgeFlagBuffer = Buffer.from("8001", "hex");
    const AcknowledgeFlagBytes = "1000000000000001";
    const version = 2;
    const messageType = 1;
    const needsAck = false;
    const isFragment = false;

    it("should parse from a buffer", () => {
      const acknowledgeFlag = Flags.parse(AcknowledgeFlagBuffer);
      expect(acknowledgeFlag.toBinary()).to.equal(AcknowledgeFlagBytes);
      expect(acknowledgeFlag.toBuffer()).to.deep.equal(AcknowledgeFlagBuffer);
      expect(acknowledgeFlag.version).to.equal(version);
      expect(acknowledgeFlag.messageType).to.equal(messageType);
      expect(acknowledgeFlag.needsAck).to.equal(needsAck);
      expect(acknowledgeFlag.isFragment).to.equal(isFragment);
    });

    it("should correctly create a new instance", () => {
      const acknowledgeFlag = new Flags({
        version,
        messageType,
        needsAck,
        isFragment,
      });
      expect(acknowledgeFlag.toBinary()).to.equal(AcknowledgeFlagBytes);
      expect(acknowledgeFlag.toBuffer()).to.deep.equal(AcknowledgeFlagBuffer);
    });
  });
});
