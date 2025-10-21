import { Reader } from "./reader";
import * as Byte from "./byte";
import { Ok, Err, type Result } from "./result";

export type MsgpackValue =
  | null
  | false
  | true
  | Uint8Array
  | string
  | number
  | bigint
  | MsgpackValue[]
  | { [key: string]: MsgpackValue };

export type DecodeIssueKind =
  | "unknown"
  | "bin8"
  | "bin16"
  | "bin32"
  | "fixstr"
  | "str8"
  | "str16"
  | "str32"
  | "int8"
  | "int16"
  | "int32"
  | "int64"
  | "uint8"
  | "uint16"
  | "uint32"
  | "uint64"
  | "float32"
  | "float64"
  | "array16"
  | "array32"
  | "map"
  | "map16"
  | "map32";

export class DecodeIssue {
  public readonly kind: DecodeIssueKind;
  public readonly msg: string;
  public readonly at: number;

  constructor(kind: DecodeIssueKind, msg: string, at: number) {
    this.kind = kind;
    this.msg = msg;
    this.at = at;
  }

  static unknown(msg: string, at: number): DecodeIssue {
    return new DecodeIssue("unknown", msg, at);
  }

  static bin8(msg: string, at: number): DecodeIssue {
    return new DecodeIssue("bin8", msg, at);
  }

  static bin16(msg: string, at: number): DecodeIssue {
    return new DecodeIssue("bin16", msg, at);
  }

  static bin32(msg: string, at: number): DecodeIssue {
    return new DecodeIssue("bin32", msg, at);
  }

  static fixstr(msg: string, at: number): DecodeIssue {
    return new DecodeIssue("fixstr", msg, at);
  }

  static str8(msg: string, at: number): DecodeIssue {
    return new DecodeIssue("str8", msg, at);
  }

  static str16(msg: string, at: number): DecodeIssue {
    return new DecodeIssue("str16", msg, at);
  }

  static str32(msg: string, at: number): DecodeIssue {
    return new DecodeIssue("str32", msg, at);
  }

  static int8(msg: string, at: number): DecodeIssue {
    return new DecodeIssue("int8", msg, at);
  }

  static int16(msg: string, at: number): DecodeIssue {
    return new DecodeIssue("int16", msg, at);
  }

  static int32(msg: string, at: number): DecodeIssue {
    return new DecodeIssue("int32", msg, at);
  }

  static int64(msg: string, at: number): DecodeIssue {
    return new DecodeIssue("int64", msg, at);
  }

  static uint8(msg: string, at: number): DecodeIssue {
    return new DecodeIssue("uint8", msg, at);
  }

  static uint16(msg: string, at: number): DecodeIssue {
    return new DecodeIssue("uint16", msg, at);
  }

  static uint32(msg: string, at: number): DecodeIssue {
    return new DecodeIssue("uint32", msg, at);
  }

  static uint64(msg: string, at: number): DecodeIssue {
    return new DecodeIssue("uint64", msg, at);
  }

  static float32(msg: string, at: number): DecodeIssue {
    return new DecodeIssue("float32", msg, at);
  }

  static float64(msg: string, at: number): DecodeIssue {
    return new DecodeIssue("float64", msg, at);
  }

  static array16(msg: string, at: number): DecodeIssue {
    return new DecodeIssue("array16", msg, at);
  }

  static array32(msg: string, at: number): DecodeIssue {
    return new DecodeIssue("array32", msg, at);
  }

  static map(msg: string, at: number): DecodeIssue {
    return new DecodeIssue("map", msg, at);
  }

  static map16(msg: string, at: number): DecodeIssue {
    return new DecodeIssue("map16", msg, at);
  }

  static map32(msg: string, at: number): DecodeIssue {
    return new DecodeIssue("map32", msg, at);
  }
}

export class Decoder {
  private src: Reader;

  constructor(src: Uint8Array) {
    this.src = new Reader(src);
  }

  // TODO: maybe check buffer bounds before accessing the bytes or
  // just throw the default out of bounds error
  decode(): Result<MsgpackValue, DecodeIssue> {
    const head = this.src.readUint8();
    if (!head) {
      const idx = this.src.getIndex();
      return new Err(DecodeIssue.unknown("Missing type head byte", idx));
    }

    if (Byte.isNil(head)) {
      return new Ok(null);
    } else if (Byte.isFalse(head)) {
      return new Ok(false);
    } else if (Byte.isTrue(head)) {
      return new Ok(true);
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
      return new Ok(this.decodePositiveFixint(head));
    } else if (Byte.isNegativeFixint(head)) {
      return new Ok(this.decodeNegativeFixint(head));
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
      return this.decodeFixmap(this.src, head);
    } else if (Byte.isMap16(head)) {
      return this.decodeMap16(this.src);
    } else if (Byte.isMap32(head)) {
      return this.decodeMap32(this.src);
    } else {
      const idx = this.src.getIndex();
      return new Err(DecodeIssue.unknown("Failed decoding unsupported type", idx));
    }
  }

  private decodeBin8(reader: Reader): Result<Uint8Array, DecodeIssue> {
    const size = reader.readUint8();
    if (!size) {
      const idx = reader.getIndex();
      return new Err(DecodeIssue.bin8("Missing size byte for bin8", idx));
    } else if (size > Byte.BIN8_MAX) {
      const idx = reader.getIndex();
      return new Err(DecodeIssue.bin8("Decoded bin8 size is bigger than max allowed", idx));
    }

    const bin = reader.read(size);
    if (!bin) {
      const idx = reader.getIndex();
      const msg = `Given bin8 size of ${size} does not match actual size`;
      return new Err(DecodeIssue.bin8(msg, idx));
    }

    return new Ok(bin);
  }

  private decodeBin16(reader: Reader): Result<Uint8Array, DecodeIssue> {
    const size = reader.readUint16();
    if (!size) {
      const idx = reader.getIndex();
      return new Err(DecodeIssue.bin16("Missing size bytes for bin16", idx));
    } else if (size > Byte.BIN16_MAX) {
      const idx = reader.getIndex();
      return new Err(DecodeIssue.bin16("Decoded size of bin16 is bigger than max allowed", idx));
    }

    const bin = reader.read(size);
    if (!bin) {
      const at = reader.getIndex();
      const msg = `Given bin16 size of ${size} does not match actual size`;
      return new Err(DecodeIssue.bin16(msg, at));
    }

    return new Ok(bin);
  }

  private decodeBin32(reader: Reader): Result<Uint8Array, DecodeIssue> {
    const size = reader.readUint32();
    if (!size) {
      const idx = reader.getIndex();
      return new Err(DecodeIssue.bin32("Missing size bytes for bin32", idx));
    } else if (size > Byte.BIN32_MAX) {
      const idx = reader.getIndex();
      return new Err(DecodeIssue.bin32("Decoded size of bin32 is bigger than max allowed", idx));
    }

    const bin = reader.read(size);
    if (!bin) {
      const idx = reader.getIndex();
      const msg = `Given bin32 size of ${size} does not match actual size`;
      return new Err(DecodeIssue.bin32(msg, idx));
    }

    return new Ok(bin);
  }

  private decodeFixstr(reader: Reader, head: number): Result<string, DecodeIssue> {
    const size = head & Byte.FIXSTR_SIZE_MASK;
    if (size > Byte.FIXSTR_MAX_BYTES) {
      const idx = reader.getIndex();
      return new Err(DecodeIssue.fixstr("Decoded size do fixstr is bigger than max allowed", idx));
    }

    const bytes = reader.read(size);
    if (!bytes) {
      const idx = reader.getIndex();
      return new Err(DecodeIssue.fixstr(`Could not read ${size} bytes for fixstr`, idx));
    }

    const decoder = new TextDecoder("utf-8");
    return new Ok(decoder.decode(bytes));
  }

  private decodeStr8(reader: Reader): Result<string, DecodeIssue> {
    const size = reader.readUint8();
    if (!size) {
      const idx = reader.getIndex();
      return new Err(DecodeIssue.str8("Missing size bytes for str8", idx));
    } else if (size > Byte.STR8_MAX_BYTES) {
      const idx = reader.getIndex();
      return new Err(DecodeIssue.str8("Decoded size of str8 is bigger than max allowed", idx));
    }

    const bytes = reader.read(size);
    if (!bytes) {
      const idx = reader.getIndex();
      return new Err(DecodeIssue.str8(`Could not read ${size} bytes for str8`, idx));
    }

    const decoder = new TextDecoder("utf-8");
    return new Ok(decoder.decode(bytes));
  }

  private decodeStr16(reader: Reader): Result<string, DecodeIssue> {
    const size = reader.readUint16();
    if (!size) {
      const idx = reader.getIndex();
      return new Err(DecodeIssue.str16("Missing size bytes for str16", idx));
    } else if (size > Byte.STR16_MAX_BYTES) {
      const idx = reader.getIndex();
      return new Err(DecodeIssue.str16("Decoded size of str16 is bigger than max allowed", idx));
    }

    const bytes = reader.read(size);
    if (!bytes) {
      const idx = reader.getIndex();
      return new Err(DecodeIssue.str16(`Could not read ${size} bytes for str16`, idx));
    }

    const decoder = new TextDecoder("utf-8");
    return new Ok(decoder.decode(bytes));
  }

  private decodeStr32(reader: Reader): Result<string, DecodeIssue> {
    const size = reader.readUint32();
    if (!size) {
      const idx = reader.getIndex();
      return new Err(DecodeIssue.str32("Missing size bytes for str32", idx));
    } else if (size > Byte.STR32_MAX_BYTES) {
      const idx = reader.getIndex();
      return new Err(DecodeIssue.str32("Decoded size of str32 is bigger than max allowed", idx));
    }

    const bytes = reader.read(size);
    if (!bytes) {
      const idx = reader.getIndex();
      return new Err(DecodeIssue.str32(`Could not read ${size} bytes for str32`, idx));
    }

    const decoder = new TextDecoder("utf-8");
    return new Ok(decoder.decode(bytes));
  }

  private decodePositiveFixint(head: number): number {
    return head;
  }

  private decodeNegativeFixint(head: number): number {
    // subtract 0x100 to convert from unsigned to signed
    return head - 0x100;
  }

  private decodeInt8(reader: Reader): Result<number, DecodeIssue> {
    const value = reader.readInt8();
    if (!value) {
      const idx = reader.getIndex();
      return new Err(DecodeIssue.int16("Missing decoded value for int8", idx));
    }
    return new Ok(value);
  }

  private decodeInt16(reader: Reader): Result<number, DecodeIssue> {
    const value = reader.readInt16();
    if (!value) {
      const idx = reader.getIndex();
      return new Err(DecodeIssue.int16("Missing decoded value for int16", idx));
    }
    return new Ok(value);
  }

  private decodeInt32(reader: Reader): Result<number, DecodeIssue> {
    const value = reader.readInt32();
    if (!value) {
      const idx = reader.getIndex();
      return new Err(DecodeIssue.int32("Missing decoded value for int32", idx));
    }
    return new Ok(value);
  }

  private decodeInt64(reader: Reader): Result<bigint, DecodeIssue> {
    const value = reader.readInt64();
    if (!value) {
      const idx = reader.getIndex();
      return new Err(DecodeIssue.int64("Missing decoded value for int32", idx));
    }
    return new Ok(value);
  }

  private decodeUint8(reader: Reader): Result<number, DecodeIssue> {
    const value = reader.readUint8();
    if (!value) {
      const idx = reader.getIndex();
      return new Err(DecodeIssue.uint8("Missing decoded value for uint8", idx));
    }
    return new Ok(value);
  }

  private decodeUint16(reader: Reader): Result<number, DecodeIssue> {
    const value = reader.readUint16();
    if (!value) {
      const idx = reader.getIndex();
      return new Err(DecodeIssue.uint16("Missing decoded value for uint16", idx));
    }
    return new Ok(value);
  }

  private decodeUint32(reader: Reader): Result<number, DecodeIssue> {
    const value = reader.readUint32();
    if (!value) {
      const idx = reader.getIndex();
      return new Err(DecodeIssue.uint32("Missing decoded value for uint32", idx));
    }
    return new Ok(value);
  }

  private decodeUint64(reader: Reader): Result<bigint, DecodeIssue> {
    const value = reader.readUint64();
    if (!value) {
      const idx = reader.getIndex();
      return new Err(DecodeIssue.uint64("Missing decoded value for uint64", idx));
    }
    return new Ok(value);
  }

  private decodeFloat32(reader: Reader): Result<number, DecodeIssue> {
    const value = reader.readFloat32();
    if (!value) {
      const idx = reader.getIndex();
      return new Err(DecodeIssue.float32("Missing decoded value for float32", idx));
    }
    return new Ok(value);
  }

  private decodeFloat64(reader: Reader): Result<number, DecodeIssue> {
    const value = reader.readFloat64();
    if (!value) {
      const idx = reader.getIndex();
      return new Err(DecodeIssue.float64("Missing decoded value for float64", idx));
    }
    return new Ok(value);
  }

  private decodeFixarray(head: number): Result<MsgpackValue[], DecodeIssue> {
    const size = head & 0x00001111;
    return this.decodeArray(size);
  }

  private decodeArray16(reader: Reader): Result<MsgpackValue[], DecodeIssue> {
    const size = reader.readUint16();
    if (!size) {
      const idx = reader.getIndex();
      return new Err(DecodeIssue.array16("Missing decoded size for array16", idx));
    }
    return this.decodeArray(size);
  }

  private decodeArray32(reader: Reader): Result<MsgpackValue[], DecodeIssue> {
    const size = reader.readUint32();
    if (!size) {
      const idx = reader.getIndex();
      return new Err(DecodeIssue.array32("Missing decoded size for array32", idx));
    }
    return this.decodeArray(size);
  }

  private decodeArray(size: number): Result<MsgpackValue[], DecodeIssue> {
    const arr: MsgpackValue[] = [];
    for (let i = 0; i < size; i += 1) {
      const decoded = this.decode();
      if (Err.is(decoded)) {
        return decoded;
      }
      arr.push(decoded.value);
    }
    return new Ok(arr);
  }

  private decodeFixmap(
    reader: Reader,
    head: number,
  ): Result<{ [key: string]: MsgpackValue }, DecodeIssue> {
    const size = head & 0x00001111;
    return this.decodeMap(reader, size);
  }

  private decodeMap16(reader: Reader): Result<{ [key: string]: MsgpackValue }, DecodeIssue> {
    const size = reader.readUint16();
    if (!size) {
      const idx = reader.getIndex();
      return new Err(DecodeIssue.map16("Missing decoded size for map16", idx));
    }
    return this.decodeMap(reader, size);
  }

  private decodeMap32(reader: Reader): Result<{ [key: string]: MsgpackValue }, DecodeIssue> {
    const size = reader.readUint32();
    if (!size) {
      const idx = reader.getIndex();
      return new Err(DecodeIssue.map32("Missing decoded size for map32", idx));
    }
    return this.decodeMap(reader, size);
  }

  private decodeMap(
    reader: Reader,
    size: number,
  ): Result<{ [key: string]: MsgpackValue }, DecodeIssue> {
    const map: Record<string, MsgpackValue> = {};
    for (let i = 0; i < size; i += 1) {
      const key = this.decode();
      if (Err.is(key)) {
        return key;
      } else if (typeof key.value !== "string") {
        const idx = reader.getIndex();
        return new Err(DecodeIssue.map("Expected map key to be a string", idx));
      }

      const decoded = this.decode();
      if (Err.is(decoded)) {
        return decoded;
      }

      map[key.value] = decoded.value;
    }
    return new Ok(map);
  }
}
