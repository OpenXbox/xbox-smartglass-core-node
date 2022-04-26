import crypto from "crypto";
import jsrsasign from "jsrsasign";
import * as uuid from "uuid";
import uuidParse from "uuid-parse";
import { ec as EC } from "elliptic";

export class SGCrypto {
  readonly liveId: string;
  readonly pubkey: Buffer;
  readonly secret: Buffer;
  readonly encryptionkey: Buffer;
  readonly iv: Buffer;
  readonly hash_key: Buffer;
  readonly uuid: Buffer;

  constructor(pem: string) {
    const deviceCert = new jsrsasign.X509();
    deviceCert.readCertPEM(pem);
    this.liveId = deviceCert.getSubjectString().slice(4);
    this.uuid = Buffer.from(uuidParse.parse(uuid.v4()));
    const ecKey = jsrsasign.X509.getPublicKeyFromCertPEM(pem);
    // @ts-ignore (Don't know why pubKeyHex doesn't exist on ecKey...)
    const result = this.signPublicKey(ecKey.pubKeyHex);
    this.pubkey = Buffer.from(result.public_key, "hex");
    this.secret = Buffer.from(result.secret, "hex");
    this.encryptionkey = this.secret.slice(0, 16);
    this.iv = this.secret.slice(16, 32);
    this.hash_key = this.secret.slice(32);
  }

  private signPublicKey(public_key: string) {
    const sha512 = crypto.createHash("sha512");

    const ec = new EC("p256");

    // Generate keys
    const key1 = ec.genKeyPair();
    const key2 = ec.keyFromPublic(public_key, "hex");

    const shared1 = key1.derive(key2.getPublic());
    let derived_secret = Buffer.from(shared1.toString(16), "hex");

    const public_key_client = key1.getPublic("hex");

    const pre_salt = Buffer.from("d637f1aae2f0418c", "hex");
    const post_salt = Buffer.from("a8f81a574e228ab7", "hex");
    derived_secret = Buffer.from(
      pre_salt.toString("hex") +
        derived_secret.toString("hex") +
        post_salt.toString("hex"),
      "hex"
    );
    // Hash shared secret
    const sha = sha512.update(derived_secret);
    derived_secret = sha.digest();

    return {
      public_key: public_key_client.toString().slice(2),
      secret: derived_secret.toString("hex"),
    };
  }

  private removePadding(payload: Buffer) {
    const buff = Buffer.from(payload.slice(-1));
    const length = buff.readUInt8(0);

    if (length > 0 && length < 16) {
      return Buffer.from(payload.slice(0, payload.length - length));
    } else {
      return payload;
    }
  }

  encrypt(data: Buffer, optionalKey?: Buffer, optionalIv?: Buffer) {
    const cipher = crypto.createCipheriv(
      "aes-128-cbc",
      optionalKey || this.encryptionkey,
      optionalIv ||
        Buffer.from(
          "\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00"
        )
    );

    cipher.setAutoPadding(false);
    return Buffer.concat([cipher.update(data), cipher.final()]);
  }

  decrypt(data: Buffer, iv: Buffer) {
    const decipher = crypto.createDecipheriv(
      "aes-128-cbc",
      this.encryptionkey,
      iv
    );
    decipher.setAutoPadding(false);

    return this.removePadding(
      Buffer.concat([decipher.update(data), decipher.final()])
    );
  }

  sign(data: Buffer) {
    const hashHmac = crypto.createHmac("sha256", this.hash_key);
    hashHmac.update(data);
    return Buffer.concat([data, hashHmac.digest()]);
  }
}
