import * as Byte from "./byte";
import { Writer } from "./writer";
import { Ok, Err, type Result } from "./result";

export class Encoder {
  private writer: Writer;

  constructor(capacity?: number) {
    this.writer = new Writer(capacity);
  }

  encode(value: unknown): Result<Uint8Array, string> {
    if (value === null) {
      this.encodeNil();
    } else if (value instanceof ArrayBuffer || value instanceof Uint8Array) {
      const result = this.encodeBin(new Uint8Array(value));
      if (Err.is(result)) {
        return result;
      }
    } else if (typeof value === "string") {
      const result = this.encodeStr(value);
      if (Err.is(result)) {
        return result;
      }
    } else if (typeof value === "boolean") {
      this.encodeBool(value);
    } else if (typeof value === "number") {
      if (Number.isInteger(value)) {
        const result = this.encodeInt(value);
        if (Err.is(result)) {
          return result;
        }
      } else {
        this.encodeFloat(value);
      }
    } else if (typeof value === "bigint") {
      const result = this.encodeInt(value);
      if (Err.is(result)) {
        return result;
      }
    } else if (Array.isArray(value)) {
      const result = this.encodeArray(value);
      if (Err.is(result)) {
        return result;
      }
    } else if (typeof value === "object") {
      const result = this.encodeMap(value);
      if (Err.is(result)) {
        return result;
      }
    } else {
      return new Err("Encoding not supported for given object");
    }

    return new Ok(this.writer.toBytes());
  }

  private encodeNil(): void {
    this.writer.ensureCapacity(1);
    this.writer.writeUint8(Byte.NIL);
  }

  private encodeBool(value: boolean): void {
    this.writer.ensureCapacity(1);
    this.writer.writeUint8(value ? Byte.BOOL_TRUE : Byte.BOOL_FALSE);
  }

  private encodeBin(value: Uint8Array): Result<void, string> {
    const size = value.byteLength;
    if (size <= Byte.BIN8_MAX) {
      this.writer.ensureCapacity(size + 2);
      this.writer.writeUint8(Byte.BIN8);
      this.writer.writeUint8(size);
    } else if (size <= Byte.BIN16_MAX) {
      this.writer.ensureCapacity(size + 3);
      this.writer.writeUint8(Byte.BIN16);
      this.writer.writeUint16(size);
    } else if (size <= Byte.BIN32_MAX) {
      this.writer.ensureCapacity(size + 5);
      this.writer.writeUint8(Byte.BIN32);
      this.writer.writeUint32(size);
    } else {
      return new Err(`Binary of size ${size} not supported`);
    }

    this.writer.writeBytes(new Uint8Array(value.buffer));
    return Ok.empty();
  }

  private encodeStr(value: string): Result<void, string> {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(value);
    const size = bytes.length;

    if (size <= Byte.FIXSTR_MAX_BYTES) {
      this.writer.ensureCapacity(size + 1);
      this.writer.writeUint8(size | Byte.FIXSTR);
    } else if (size <= Byte.STR8_MAX_BYTES) {
      this.writer.ensureCapacity(size + 2);
      this.writer.writeUint8(Byte.STR8);
      this.writer.writeUint8(size);
    } else if (size <= Byte.STR16_MAX_BYTES) {
      this.writer.ensureCapacity(size + 3);
      this.writer.writeUint8(Byte.STR16);
      this.writer.writeUint16(size);
    } else if (size <= Byte.STR32_MAX_BYTES) {
      this.writer.ensureCapacity(size + 5);
      this.writer.writeUint8(Byte.STR32);
      this.writer.writeUint32(size);
    } else {
      return new Err(`Cannot encode str with more than ${size} bytes`);
    }

    this.writer.writeBytes(bytes);
    return Ok.empty();
  }

  private encodeInt(value: number | bigint): Result<void, string> {
    if (value >= 0) {
      if (value <= Byte.POSITIVE_FIXINT_MAX) {
        this.writer.ensureCapacity(1);
        this.writer.writeInt8(Number(value) & Byte.POSITIVE_FIXINT_MASK);
      } else if (value <= Byte.UINT8_MAX) {
        this.writer.ensureCapacity(2);
        this.writer.writeUint8(Byte.UINT8);
        this.writer.writeUint8(Number(value));
      } else if (value <= Byte.UINT16_MAX) {
        this.writer.ensureCapacity(3);
        this.writer.writeUint8(Byte.UINT16);
        this.writer.writeUint16(Number(value));
      } else if (value <= Byte.UINT32_MAX) {
        this.writer.ensureCapacity(5);
        this.writer.writeUint8(Byte.UINT32);
        this.writer.writeUint32(Number(value));
      } else if (value <= Byte.UINT64_MAX) {
        this.writer.ensureCapacity(9);
        this.writer.writeUint8(Byte.UINT64);
        this.writer.writeUint64(BigInt(value));
      } else {
        return new Err("Integers bigger than uint64 max are not supported");
      }
    } else {
      if (value >= Byte.NEGATIVE_FIXINT_MIN) {
        this.writer.ensureCapacity(1);
        // add 0x20 (0b00100000) to convert from unsigned to signed
        this.writer.writeInt8(Byte.NEGATIVE_FIXINT_MASK | (Number(value) + 0x20));
      } else if (value >= Byte.INT8_MIN) {
        this.writer.ensureCapacity(2);
        this.writer.writeUint8(Byte.INT8);
        this.writer.writeInt8(Number(value));
      } else if (value >= Byte.INT16_MIN) {
        this.writer.ensureCapacity(3);
        this.writer.writeUint8(Byte.INT16);
        this.writer.writeInt16(Number(value));
      } else if (value >= Byte.INT32_MIN) {
        this.writer.ensureCapacity(5);
        this.writer.writeUint8(Byte.INT32);
        this.writer.writeInt32(Number(value));
      } else if (value >= Byte.INT64_MIN) {
        this.writer.ensureCapacity(9);
        this.writer.writeUint8(Byte.INT64);
        this.writer.writeInt64(BigInt(value));
      } else {
        return new Err("Integers smaller than int64 min are not supported");
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

  private encodeArray(value: any[]): Result<void, string> {
    const length = value.length;
    if (length <= Byte.FIXARRAY_MAX) {
      this.writer.ensureCapacity(1);
      this.writer.writeUint8(Byte.FIXARRAY_MASK | length);
    } else if (length <= Byte.ARRAY16_MAX) {
      this.writer.ensureCapacity(3);
      this.writer.writeUint8(Byte.ARRAY16);
      this.writer.writeUint16(length);
    } else if (length <= Byte.ARRAY32_MAX) {
      this.writer.ensureCapacity(5);
      this.writer.writeUint8(Byte.ARRAY32);
      this.writer.writeUint32(length);
    } else {
      return new Err(`Cannot encode array with more than ${length} items`);
    }

    for (const v of value) {
      this.encode(v);
    }

    return Ok.empty();
  }

  private encodeMap(value: Record<string, any>): Result<void, string> {
    const keys = Object.keys(value);
    const length = keys.length;
    if (length <= Byte.FIXMAP_MAX) {
      this.writer.ensureCapacity(2 * length + 1);
      this.writer.writeUint8(Byte.FIXMAP_MASK & length);
    } else if (length <= Byte.MAP16_MAX) {
      this.writer.ensureCapacity(2 * length + 3);
      this.writer.writeUint8(Byte.MAP16);
      this.writer.writeUint16(length);
    } else if (length <= Byte.MAP32_MAX) {
      this.writer.ensureCapacity(2 * length + 5);
      this.writer.writeUint8(Byte.MAP32);
      this.writer.writeUint32(length);
    } else {
      return new Err(`Map cannot have more than ${length} items`);
    }

    for (const k in value) {
      const v = value[k];
      // for now we do not encode undefined but may add a config to allow it
      if (v !== undefined) {
        this.encodeStr(k);
        this.encode(v);
      }
    }

    return Ok.empty();
  }
}
