import { Reader } from "./reader";
import * as Byte from "./byte";

export class Decoder {
  private src: Reader;

  constructor(src: Uint8Array) {
    this.src = new Reader(src);
  }

  // TODO: maybe replace any with a more specific type
  // TODO: maybe check buffer bounds before accessing the bytes or
  // just throw the default out of bounds error
  decode():
    | null
    | false
    | true
    | Uint8Array
    | string
    | number
    | bigint
    | any[]
    | Record<string, any> {
    const head = this.src.readUint8();
    if (!head) {
      // TODO: replace throw by result
      throw new Error("Expected head byte");
    }

    if (Byte.isNil(head)) {
      return null;
    } else if (Byte.isFalse(head)) {
      return false;
    } else if (Byte.isTrue(head)) {
      return true;
    } else if (Byte.isBin8(head)) {
      return this.decodeBin8(this.src);
    } else if (Byte.isBin16(head)) {
      return this.decodeBin16(this.src);
    } else if (Byte.isBin32(head)) {
      return this.decodeBin32(this.src);
    } else if (Byte.isFixstr(head)) {
      return this.decodeFixstr(this.src, head);
    } else if (Byte.isStr8(head)) {
      return this.decodeStr8(this.src);
    } else if (Byte.isStr16(head)) {
      return this.decodeStr16(this.src);
    } else if (Byte.isStr32(head)) {
      return this.decodeStr32(this.src);
    } else if (Byte.isPositiveFixint(head)) {
      return this.decodePositiveFixint(head);
    } else if (Byte.isNegativeFixint(head)) {
      return this.decodeNegativeFixint(head);
    } else if (Byte.isInt8(head)) {
      return this.decodeInt8(this.src);
    } else if (Byte.isInt16(head)) {
      return this.decodeInt16(this.src);
    } else if (Byte.isInt32(head)) {
      return this.decodeInt32(this.src);
    } else if (Byte.isInt64(head)) {
      return this.decodeInt64(this.src);
    } else if (Byte.isUint8(head)) {
      return this.decodeUint8(this.src);
    } else if (Byte.isUint16(head)) {
      return this.decodeUint16(this.src);
    } else if (Byte.isUint32(head)) {
      return this.decodeUint32(this.src);
    } else if (Byte.isUint64(head)) {
      return this.decodeUint64(this.src);
    } else if (Byte.isFloat32(head)) {
      return this.decodeFloat32(this.src);
    } else if (Byte.isFloat64(head)) {
      return this.decodeFloat64(this.src);
    } else if (Byte.isFixarray(head)) {
      return this.decodeFixarray(head);
    } else if (Byte.isArray16(head)) {
      return this.decodeArray16(this.src);
    } else if (Byte.isArray32(head)) {
      return this.decodeArray32(this.src);
    } else if (Byte.isFixmap(head)) {
      return this.decodeFixmap(head);
    } else if (Byte.isMap16(head)) {
      return this.decodeMap16(this.src);
    } else if (Byte.isMap32(head)) {
      return this.decodeMap32(this.src);
    } else {
      throw new Error("Decoding other types is still not implemented");
    }
  }

  // TODO: replace throw by result
  private decodeBin8(reader: Reader): Uint8Array {
    const size = reader.readUint8();
    if (!size) {
      throw new Error("Missing size byte for bin8");
    } else if (size > Byte.BIN8_MAX) {
      throw new Error("Decoded bin8 size is bigger than max allowed");
    }

    const bin = reader.read(size);
    if (!bin) {
      throw new Error(`Given bin8 size of ${size} does not match actual size`);
    }

    return bin;
  }

  // TODO: replace throw by result
  private decodeBin16(reader: Reader): Uint8Array {
    const size = reader.readUint16();
    if (!size) {
      throw new Error("Missing size bytes for bin16");
    } else if (size > Byte.BIN16_MAX) {
      throw new Error("Decoded size of bin16 is bigger than max allowed");
    }

    const bin = reader.read(size);
    if (!bin) {
      throw new Error(`Given bin16 size of ${size} does not match actual size`);
    }

    return bin;
  }

  // TODO: replace throw by result
  private decodeBin32(reader: Reader): Uint8Array {
    const size = reader.readUint32();
    if (!size) {
      throw new Error("Missing size bytes for bin32");
    } else if (size > Byte.BIN32_MAX) {
      throw new Error("Decoded size of bin32 is bigger than max allowed");
    }

    const bin = reader.read(size);
    if (!bin) {
      throw new Error(`Given bin32 size of ${size} does not match actual size`);
    }

    return bin;
  }

  // TODO: replace throw by result
  private decodeFixstr(reader: Reader, head: number): string {
    let size = head & Byte.FIXSTR_SIZE_MASK;
    if (size > Byte.FIXSTR_MAX_BYTES) {
      throw new Error("Decoded size do fixstr is bigger than max allowed");
    }

    const bytes = reader.read(size);
    if (!bytes) {
      throw new Error(`Could not read ${size} bytes for fixstr`);
    }

    const decoder = new TextDecoder("utf-8");
    return decoder.decode(bytes);
  }

  // TODO: replace throw by result
  private decodeStr8(reader: Reader): string {
    const size = reader.readUint8();
    if (!size) {
      throw new Error("Missing size bytes for str8");
    } else if (size > Byte.STR8_MAX_BYTES) {
      throw new Error("Decoded size of str8 is bigger than max allowed");
    }

    const bytes = reader.read(size);
    if (!bytes) {
      throw new Error(`Could not read ${size} bytes for str8`);
    }

    const decoder = new TextDecoder("utf-8");
    return decoder.decode(bytes);
  }

  // TODO: replace throw by result
  private decodeStr16(reader: Reader): string {
    const size = reader.readUint16();
    if (!size) {
      throw new Error("Missing size bytes for str16");
    } else if (size > Byte.STR16_MAX_BYTES) {
      throw new Error("Decoded size of str16 is bigger than max allowed");
    }

    const bytes = reader.read(size);
    if (!bytes) {
      throw new Error(`Could not read ${size} bytes for str16`);
    }

    const decoder = new TextDecoder("utf-8");
    return decoder.decode(bytes);
  }

  // TODO: replace throw by result
  private decodeStr32(reader: Reader): string {
    const size = reader.readUint32();
    if (!size) {
      throw new Error("Missing size bytes for str32");
    } else if (size > Byte.STR32_MAX_BYTES) {
      throw new Error("Decoded size of str32 is bigger than max allowed");
    }

    const bytes = reader.read(size);
    if (!bytes) {
      throw new Error(`Could not read ${size} bytes for str32`);
    }

    const decoder = new TextDecoder("utf-8");
    return decoder.decode(bytes);
  }

  private decodePositiveFixint(head: number): number {
    return head;
  }

  private decodeNegativeFixint(head: number): number {
    // subtract 0x100 to convert from unsigned to signed
    return head - 0x100;
  }

  private decodeInt8(reader: Reader): number {
    const value = reader.readInt8();
    if (!value) {
      throw new Error("Missing decoded value for int8");
    }
    return value;
  }

  private decodeInt16(reader: Reader): number {
    const value = reader.readInt16();
    if (!value) {
      throw new Error("Missing decoded value for int16");
    }
    return value;
  }

  private decodeInt32(reader: Reader): number {
    const value = reader.readInt32();
    if (!value) {
      throw new Error("Missing decoded value for int32");
    }
    return value;
  }

  private decodeInt64(reader: Reader): bigint {
    const value = reader.readInt64();
    if (!value) {
      throw new Error("Missing decoded value for int32");
    }
    return value;
  }

  // TODO: replace throw by result
  private decodeUint8(reader: Reader): number {
    const value = reader.readUint8();
    if (!value) {
      throw new Error("Missing decoded value for uint8");
    }
    return value;
  }

  // TODO: replace throw by result
  private decodeUint16(reader: Reader): number {
    const value = reader.readUint16();
    if (!value) {
      throw new Error("Missing decoded value for uint16");
    }
    return value;
  }

  // TODO: replace throw by result
  private decodeUint32(reader: Reader): number {
    const value = reader.readUint32();
    if (!value) {
      throw new Error("Missing decoded value for uint32");
    }
    return value;
  }

  // TODO: replace throw by result
  private decodeUint64(reader: Reader): bigint {
    const value = reader.readUint64();
    if (!value) {
      throw new Error("Missing decoded value for uint64");
    }
    return value;
  }

  // TODO: replace throw by result
  private decodeFloat32(reader: Reader): number {
    const value = reader.readFloat32();
    if (!value) {
      throw new Error("Missing decoded value for float32");
    }
    return value;
  }

  // TODO: replace throw by result
  private decodeFloat64(reader: Reader): number {
    const value = reader.readFloat64();
    if (!value) {
      throw new Error("Missing decoded value for float64");
    }
    return value;
  }

  private decodeFixarray(head: number): any[] {
    const size = head & 0x00001111;
    return this.decodeArray(size);
  }

  // TODO: replace throw by result
  private decodeArray16(reader: Reader): any[] {
    const size = reader.readUint16();
    if (!size) {
      throw new Error("Missing decoded size for array16");
    }
    return this.decodeArray(size);
  }

  // TODO: replace throw by result
  private decodeArray32(reader: Reader): any[] {
    const size = reader.readUint32();
    if (!size) {
      throw new Error("Missing decoded size for array32");
    }
    return this.decodeArray(size);
  }

  private decodeArray(size: number): any[] {
    const arr: any[] = [];
    for (let i = 0; i < size; i += 1) {
      const value = this.decode();
      arr.push(value);
    }
    return arr;
  }

  private decodeFixmap(head: number): Record<string, any> {
    const size = head & 0x00001111;
    return this.decodeMap(size);
  }

  // TODO: replace throw by result
  private decodeMap16(reader: Reader): Record<string, any> {
    const size = reader.readUint16();
    if (!size) {
      throw new Error("Missing decoded size for map16");
    }
    return this.decodeMap(size);
  }

  // TODO: replace throw by result
  private decodeMap32(reader: Reader): Record<string, any> {
    const size = reader.readUint32();
    if (!size) {
      throw new Error("Missing decoded size for map32");
    }
    return this.decodeMap(size);
  }

  // TODO: replace throw by result
  private decodeMap(size: number): Record<string, any> {
    const map: Record<string, any> = {};
    for (let i = 0; i < size; i += 1) {
      const key = this.decode();
      if (typeof key !== "string") {
        throw new Error("Expected map key to be a string");
      }
      const value = this.decode();
      map[key] = value;
    }
    return map;
  }
}
