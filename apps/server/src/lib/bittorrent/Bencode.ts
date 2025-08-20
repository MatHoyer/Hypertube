import { isInt } from "@hypertube/libs";

type BencodePrimitive = number | string;
interface BencodeList extends Array<BencodeValue> {}
interface BencodeDict {
  [key: string]: BencodeValue;
}
type BencodeValue = BencodePrimitive | BencodeList | BencodeDict;

class BencodeEncoder {
  constructor(private readonly data: any) {}

  encode() {
    return this.data;
  }
}

class BencodeDecoder {
  private data: string;
  private cursor: number;

  constructor(data: string) {
    this.data = data;
    this.cursor = 0;
  }

  _getCurrentByte() {
    const byte = this.data[this.cursor];
    this.cursor++;

    return byte;
  }

  _decodeInteger() {
    console.log("int");

    let buffer = "";

    let currentByte = this._getCurrentByte();

    while (currentByte !== "e") {
      if (!isInt(currentByte)) {
        throw new Error(
          `Invalid int pattern at ${this.cursor}: ${this.data[this.cursor]}`
        );
      }
      buffer += currentByte;
      currentByte = this._getCurrentByte();
    }

    return parseInt(buffer);
  }

  _decodeString(length: number) {
    console.log("string");

    let buffer = "";

    for (let i = 0; i < length; i++) {
      buffer += this._getCurrentByte();
    }

    return buffer;
  }

  _decodeList() {
    console.log("list");

    const lst: BencodeList = [];

    let currentByte = this.data[this.cursor];

    while (currentByte !== "e") {
      lst.push(this.decode());
      currentByte = this.data[this.cursor];
    }

    this.cursor++;

    return lst;
  }

  _decodeDict() {
    console.log("dict");

    const dict: BencodeDict = {};

    let currentByte = this.data[this.cursor];

    while (currentByte !== "e") {
      const key = this.decode();
      if (typeof key !== "string") {
        throw new Error(
          `Invalid dict key pattern at ${this.cursor}: ${
            this.data[this.cursor]
          }`
        );
      }

      const value = this.decode();
      dict[key] = value;
      currentByte = this.data[this.cursor];
    }

    this.cursor++;

    return dict;
  }

  decode() {
    let currentByte = this._getCurrentByte();

    switch (currentByte) {
      case "i":
        return this._decodeInteger();

      case "l":
        return this._decodeList();

      case "d":
        return this._decodeDict();

      default:
        let buffer = "";
        if (this.data.length <= this.cursor) throw new Error("out");
        while (isInt(currentByte)) {
          buffer += currentByte;
          currentByte = this._getCurrentByte();
        }
        if (buffer && currentByte === ":") {
          return this._decodeString(parseInt(buffer));
        }

        throw new Error(
          `Invalid character at ${this.cursor}: ${this.data[this.cursor]}`
        );
    }
  }
}

export { BencodeDecoder, BencodeEncoder };
