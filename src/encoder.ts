import * as Byte from "./byte";
import { Writer } from "./writer";
import { Ok, Err, type Result } from "./result";

export type EncodingTarget =
  | { kind: "unknown"; src: unknown }
  | { kind: "bin"; src: Uint8Array }
  | { kind: "str"; src: string }
  | { kind: "int"; src: number | bigint }
  | { kind: "array"; src: any[] }
  | { kind: "map"; src: Record<string, any> };

export class EncodeIssue {
  public readonly msg: string;
  public readonly target: EncodingTarget;

  constructor(msg: string, target: EncodingTarget) {
    this.msg = msg;
    this.target = target;
  }

  static unknown(msg: string, src: unknown): EncodeIssue {
    return new EncodeIssue(msg, { kind: "unknown", src });
  }

  static bin(msg: string, src: Uint8Array): EncodeIssue {
    return new EncodeIssue(msg, { kind: "bin", src });
  }

  static str(msg: string, src: string): EncodeIssue {
    return new EncodeIssue(msg, { kind: "str", src });
  }

  static int(msg: string, src: number | bigint): EncodeIssue {
    return new EncodeIssue(msg, { kind: "int", src });
  }

  static array(msg: string, src: any[]): EncodeIssue {
    return new EncodeIssue(msg, { kind: "array", src });
  }

  static map(msg: string, src: Record<string, any>): EncodeIssue {
    return new EncodeIssue(msg, { kind: "map", src });
  }
}

export class Encoder {
  private writer: Writer;

  constructor(capacity?: number) {
    this.writer = new Writer(capacity);
  }

  encode(value: unknown): Result<Uint8Array, EncodeIssue> {
    const result = this.encodeIn(this.writer, value);
    if (Err.is(result)) {
      return result;
    }
    return new Ok(this.writer.toBytes());
  }

  private encodeIn(writer: Writer, value: any): Result<void, EncodeIssue> {
    if (value === null) {
      this.encodeNil(writer);
    } else if (value instanceof ArrayBuffer || value instanceof Uint8Array) {
      const result = this.encodeBin(writer, new Uint8Array(value));
      if (Err.is(result)) {
        return result;
      }
    } else if (typeof value === "string") {
      const result = this.encodeStr(writer, value);
      if (Err.is(result)) {
        return result;
      }
    } else if (typeof value === "boolean") {
      this.encodeBool(writer, value);
    } else if (typeof value === "number") {
      if (Number.isInteger(value)) {
        const result = this.encodeInt(writer, value);
        if (Err.is(result)) {
          return result;
        }
      } else {
        this.encodeFloat(value);
      }
    } else if (typeof value === "bigint") {
      const result = this.encodeInt(writer, value);
      if (Err.is(result)) {
        return result;
      }
    } else if (Array.isArray(value)) {
      const result = this.encodeArray(writer, value);
      if (Err.is(result)) {
        return result;
      }
    } else if (typeof value === "object") {
      const result = this.encodeMap(writer, value);
      if (Err.is(result)) {
        return result;
      }
    } else {
      return new Err(EncodeIssue.unknown("Encoding not supported for given object", value));
    }

    return Ok.empty();
  }

  private encodeNil(writer: Writer): void {
    writer.ensureCapacity(1);
    writer.writeUint8(Byte.NIL);
  }

  private encodeBool(writer: Writer, value: boolean): void {
    writer.ensureCapacity(1);
    writer.writeUint8(value ? Byte.BOOL_TRUE : Byte.BOOL_FALSE);
  }

  private encodeBin(writer: Writer, value: Uint8Array): Result<void, EncodeIssue> {
    const size = value.byteLength;
    if (size <= Byte.BIN8_MAX) {
      writer.ensureCapacity(size + 2);
      writer.writeUint8(Byte.BIN8);
      writer.writeUint8(size);
    } else if (size <= Byte.BIN16_MAX) {
      writer.ensureCapacity(size + 3);
      writer.writeUint8(Byte.BIN16);
      writer.writeUint16(size);
    } else if (size <= Byte.BIN32_MAX) {
      writer.ensureCapacity(size + 5);
      writer.writeUint8(Byte.BIN32);
      writer.writeUint32(size);
    } else {
      return new Err(EncodeIssue.bin(`Binary of size ${size} not supported`, value));
    }

    writer.writeBytes(new Uint8Array(value.buffer));
    return Ok.empty();
  }

  private encodeStr(writer: Writer, value: string): Result<void, EncodeIssue> {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(value);
    const size = bytes.length;

    if (size <= Byte.FIXSTR_MAX_BYTES) {
      writer.ensureCapacity(size + 1);
      writer.writeUint8(size | Byte.FIXSTR);
    } else if (size <= Byte.STR8_MAX_BYTES) {
      writer.ensureCapacity(size + 2);
      writer.writeUint8(Byte.STR8);
      writer.writeUint8(size);
    } else if (size <= Byte.STR16_MAX_BYTES) {
      writer.ensureCapacity(size + 3);
      writer.writeUint8(Byte.STR16);
      writer.writeUint16(size);
    } else if (size <= Byte.STR32_MAX_BYTES) {
      writer.ensureCapacity(size + 5);
      writer.writeUint8(Byte.STR32);
      writer.writeUint32(size);
    } else {
      return new Err(EncodeIssue.str(`Cannot encode str with more than ${size} bytes`, value));
    }

    writer.writeBytes(bytes);
    return Ok.empty();
  }

  private encodeInt(writer: Writer, value: number | bigint): Result<void, EncodeIssue> {
    if (value >= 0) {
      if (value <= Byte.POSITIVE_FIXINT_MAX) {
        writer.ensureCapacity(1);
        writer.writeInt8(Number(value) & Byte.POSITIVE_FIXINT_MASK);
      } else if (value <= Byte.UINT8_MAX) {
        writer.ensureCapacity(2);
        writer.writeUint8(Byte.UINT8);
        writer.writeUint8(Number(value));
      } else if (value <= Byte.UINT16_MAX) {
        writer.ensureCapacity(3);
        writer.writeUint8(Byte.UINT16);
        writer.writeUint16(Number(value));
      } else if (value <= Byte.UINT32_MAX) {
        writer.ensureCapacity(5);
        writer.writeUint8(Byte.UINT32);
        writer.writeUint32(Number(value));
      } else if (value <= Byte.UINT64_MAX) {
        writer.ensureCapacity(9);
        writer.writeUint8(Byte.UINT64);
        writer.writeUint64(BigInt(value));
      } else {
        return new Err(EncodeIssue.int("Integers bigger than uint64 max are not supported", value));
      }
    } else {
      if (value >= Byte.NEGATIVE_FIXINT_MIN) {
        writer.ensureCapacity(1);
        // add 0x20 (0b00100000) to convert from unsigned to signed
        writer.writeInt8(Byte.NEGATIVE_FIXINT_MASK | (Number(value) + 0x20));
      } else if (value >= Byte.INT8_MIN) {
        writer.ensureCapacity(2);
        writer.writeUint8(Byte.INT8);
        writer.writeInt8(Number(value));
      } else if (value >= Byte.INT16_MIN) {
        writer.ensureCapacity(3);
        writer.writeUint8(Byte.INT16);
        writer.writeInt16(Number(value));
      } else if (value >= Byte.INT32_MIN) {
        writer.ensureCapacity(5);
        writer.writeUint8(Byte.INT32);
        writer.writeInt32(Number(value));
      } else if (value >= Byte.INT64_MIN) {
        writer.ensureCapacity(9);
        writer.writeUint8(Byte.INT64);
        writer.writeInt64(BigInt(value));
      } else {
        return new Err(EncodeIssue.int("Integers smaller than int64 min are not supported", value));
      }
    }

    return Ok.empty();
  }

  private encodeFloat(value: number): void {
    const isFloat32 = Math.fround(value) === value;
    if (isFloat32) {
      this.writer.ensureCapacity(5);
      this.writer.writeUint8(Byte.FLOAT32);
      this.writer.writeFloat32(value);
    } else {
      this.writer.ensureCapacity(9);
      this.writer.writeUint8(Byte.FLOAT64);
      this.writer.writeFloat64(value);
    }
  }

  private encodeArray(writer: Writer, value: any[]): Result<void, EncodeIssue> {
    const length = value.length;
    if (length <= Byte.FIXARRAY_MAX) {
      writer.ensureCapacity(1);
      writer.writeUint8(length | Byte.FIXARRAY_MASK);
    } else if (length <= Byte.ARRAY16_MAX) {
      writer.ensureCapacity(3);
      writer.writeUint8(Byte.ARRAY16);
      writer.writeUint16(length);
    } else if (length <= Byte.ARRAY32_MAX) {
      writer.ensureCapacity(5);
      writer.writeUint8(Byte.ARRAY32);
      writer.writeUint32(length);
    } else {
      const msg = `Cannot encode array with more than ${length} items`;
      return new Err(EncodeIssue.array(msg, value));
    }

    for (const v of value) {
      const result = this.encodeIn(writer, v);
      if (Err.is(result)) {
        return result;
      }
    }

    return Ok.empty();
  }

  private encodeMap(writer: Writer, value: Record<string, any>): Result<void, EncodeIssue> {
    const keys = Object.keys(value);
    const length = keys.length;
    if (length <= Byte.FIXMAP_MAX) {
      writer.ensureCapacity(1);
      writer.writeUint8(Byte.FIXMAP_MASK | length);
    } else if (length <= Byte.MAP16_MAX) {
      writer.ensureCapacity(3);
      writer.writeUint8(Byte.MAP16);
      writer.writeUint16(length);
    } else if (length <= Byte.MAP32_MAX) {
      writer.ensureCapacity(5);
      writer.writeUint8(Byte.MAP32);
      writer.writeUint32(length);
    } else {
      const msg = `Map cannot have more than ${length} items`;
      return new Err(EncodeIssue.map(msg, value));
    }

    for (const k in value) {
      const v = value[k];
      // for now we do not encode undefined but may add a config to allow it
      if (v !== undefined) {
        let result = this.encodeStr(writer, k);
        if (Err.is(result)) {
          return result;
        }

        result = this.encodeIn(writer, v);
        if (Err.is(result)) {
          return result;
        }
      }
    }

    return Ok.empty();
  }
}
