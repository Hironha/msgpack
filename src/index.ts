const NIL = 0xc0;

const BOOL_TRUE = 0xc2;
const BOOL_FALSE = 0xc3;

// use with OR to set the three most significant bits as 101 respectively
const FIXSTR = 0b10100000;
const FIXSTR_MASK = 0b11100000;
const FIXSTR_SIZE_MASK = 0b00011111;
const FIXSTR_MAX_BYTES = 31;

// head byte of str8
const STR8 = 0xd9;
const STR8_MAX_BYTES = 2 ** 8 - 1;

// head byte of str16
const STR16 = 0xda;
const STR16_MAX_BYTES = 2 ** 16 - 1;

// head byte of str32
const STR32 = 0xdb;
const STR32_MAX_BYTES = 2 ** 32 - 1;

// head byte of bin8
const BIN8 = 0xc4;
const BIN8_MAX = 2 ** 8 - 1;

// head byte of bin16
const BIN16 = 0xc5;
const BIN16_MAX = 2 ** 16 - 1;

// head byte of bin32
const BIN32 = 0xc6;
const BIN32_MAX = 2 ** 32 - 1;

// use with AND to set most significant bit to 0
const POSITIVE_FIXINT_MASK = 0b01111111;
const POSITIVE_FIXINT_MAX = 2 ** 7 - 1;

const NEGATIVE_FIXINT_MIN = -1 * 2 ** 5;
// use with OR to set the three most significant bits to 1
const NEGATIVE_FIXINT_MASK = 0b11100000;

// head byte of int8
const INT8 = 0xd0;
const INT8_MIN = -1 * 2 ** 7;

// head byte of uint8
const UINT8 = 0xcc;
const UINT8_MAX = 2 ** 8 - 1;

// head byte of int16
const INT16 = 0xd1;
const INT16_MIN = -1 * 2 ** 15;

// head byte of uint16
const UINT16 = 0xcd;
const UINT16_MAX = 2 ** 16 - 1;

// head byte of int32
const INT32 = 0xd2;
const INT32_MIN = -1 * 2 ** 31;

// head byte of uint32
const UINT32 = 0xce;
const UINT32_MAX = 2 ** 32 - 1;

// head byte of int64
const INT64 = 0xd3;
const INT64_MIN = -1n * 2n ** 63n;

// head byte of uint64
const UINT64 = 0xcf;
const UINT64_MAX = 2n ** 64n - 1n;

// most significant byte of float32
const FLOAT32 = 0xca;

// most significant byte of float64
const FLOAT64 = 0xcb;

// use with AND to set most significant four bits as 1001
const FIXARRAY_MASK = 0x10010000;
const FIXARRAY_MAX = 15;

// most significant byte of array16
const ARRAY16 = 0xdc;
const ARRAY16_MAX = 2 ** 16 - 1;

// most significant byte of array32
const ARRAY32 = 0xdd;
const ARRAY32_MAX = 2 ** 32 - 1;

// use with AND to set most significant bytes as 1000
const FIXMAP_MASK = 0b10001111;
const FIXMAP_MAX = 15;

// most significant byte of map16
const MAP16 = 0xde;
const MAP16_MAX = 2 ** 16 - 1;

// most significant byte of map32
const MAP32 = 0xdf;
const MAP32_MAX = 2 ** 32 - 1;

// TODO: add support for timestamp and other extensions

function decodeInt(value: Uint8Array): number | bigint {
  if (value.byteLength === 0) {
    throw new Error("Expected encoded int to have at least one byte");
  }

  const head = value[0];

  let decoded: number | bigint;
  if ((head & ~POSITIVE_FIXINT_MASK) === 0) {
    decoded = head;
  } else if ((head & NEGATIVE_FIXINT_MASK) === NEGATIVE_FIXINT_MASK) {
    // subtract 0x100 to convert from unsigned to signed
    decoded = head - 0x100;
  } else if (head === UINT8) {
    const view = new DataView(value.buffer);
    decoded = view.getUint8(1);
  } else if (head === UINT16) {
    const view = new DataView(value.buffer);
    decoded = view.getUint16(1);
  } else if (head === UINT32) {
    const view = new DataView(value.buffer);
    decoded = view.getUint32(1);
  } else if (head === UINT64) {
    const view = new DataView(value.buffer);
    decoded = view.getBigUint64(1);
  } else if (head === INT8) {
    const view = new DataView(value.buffer);
    decoded = view.getInt8(1);
  } else if (head === INT16) {
    const view = new DataView(value.buffer);
    decoded = view.getInt16(1);
  } else if (head === INT32) {
    const view = new DataView(value.buffer);
    decoded = view.getInt32(1);
  } else if (head === INT64) {
    const view = new DataView(value.buffer);
    decoded = view.getBigInt64(1);
  } else {
    throw new Error("Invalid encoded integer");
  }

  return decoded;
}

function decodeBin(value: Uint8Array): Uint8Array {
  if (value.byteLength === 0) {
    throw new Error("Expected encoded bin to have at least one byte");
  }

  const head = value[0];

  let offset = 0;
  let size = 0;
  if (head === BIN8) {
    offset = 2;
    size = value[1];
  } else if (head === BIN16) {
    offset = 3;
    size = value[1];
  } else if (head === BIN32) {
    offset = 5;
    size = value[1];
  } else {
    throw new Error("Invalid encoded bin");
  }

  const arr = new Uint8Array(size);
  arr.set(value.slice(offset, offset + size));
  return arr;
}

function decodeStr(view: DataView): string {
  const head = view.getUint8(0);

  let offset = 0;
  let size = 0;
  if ((head & FIXSTR_MASK) === FIXSTR) {
    offset = 1;
    size = head & FIXSTR_SIZE_MASK;
  } else if (head === STR8) {
    offset = 2;
    size = view.getUint8(1);
  } else if (head === STR16) {
    offset = 3;
    size = view.getUint16(1);
  } else if (head === STR32) {
    offset = 5;
    size = view.getUint32(1);
  } else {
    throw new Error("Invalid encoded string");
  }

  const slice = view.buffer.slice(offset, offset + size);
  const decoder = new TextDecoder("utf-8");
  return decoder.decode(new Uint8Array(slice));
}

function decodeNil(buf: Uint8Array): null {
  if (buf.length !== 1) {
    throw new Error("Expected nil buffer to have one byte");
  }

  const value = buf[0];
  if (value !== NIL) {
    throw new Error("Invalid buffer byte for nil");
  }

  return null;
}

function decodeBool(buf: Uint8Array): boolean {
  if (buf.length !== 1) {
    throw new Error("Expected boolean buffer to have one byte");
  }

  const value = buf[0];
  if (value === BOOL_TRUE) return true;
  if (value === BOOL_FALSE) return false;

  throw new Error("Invalid buffer byte for boolean");
}

class Buffer {
  private view: DataView;
  private bytes: Uint8Array;
  private idx: number;

  constructor(capacity = 1024) {
    this.bytes = new Uint8Array(capacity);
    this.view = new DataView(this.bytes.buffer);
    this.idx = 0;
  }

  toBytes(): Uint8Array {
    return this.bytes.subarray(0, this.idx);
  }

  writeBytes(bytes: Uint8Array): void {
    this.bytes.set(bytes, this.idx);
    this.idx += bytes.length;
  }

  writeUint8(byte: number): void {
    this.bytes[this.idx] = byte;
    this.idx += 1;
  }

  writeUint16(value: number): void {
    this.view.setUint16(this.idx, value);
    this.idx += 2;
  }

  writeUint32(value: number): void {
    this.view.setUint32(this.idx, value);
    this.idx += 4;
  }

  writeUint64(value: bigint): void {
    this.view.setBigUint64(this.idx, value);
    this.idx += 8;
  }

  writeInt8(value: number): void {
    this.view.setInt8(this.idx, value);
    this.idx += 1;
  }

  writeInt16(value: number): void {
    this.view.setInt16(this.idx, value);
    this.idx += 2;
  }

  writeInt32(value: number): void {
    this.view.setInt32(this.idx, value);
    this.idx += 4;
  }

  writeInt64(value: bigint): void {
    this.view.setBigInt64(this.idx, value);
    this.idx += 8;
  }

  writeFloat32(value: number): void {
    this.view.setFloat32(this.idx, value);
    this.idx += 4;
  }

  writeFloat64(value: number): void {
    this.view.setFloat64(this.idx, value);
    this.idx += 8;
  }

  ensureCapacity(size: number) {
    const remaining = this.bytes.length - this.idx - 1;
    if (remaining < size) {
      let min = this.bytes.length + size;
      let capacity = this.bytes.length;
      while (capacity < min) {
        capacity * 2;
      }

      this.reallocate(capacity);
    }
  }

  private reallocate(capacity: number): void {
    const buf = new Uint8Array(this.bytes.buffer, 0, capacity);
    this.bytes = buf;
    this.view = new DataView(this.bytes.buffer);
  }
}

class Encoder {
  private buf: Buffer;

  constructor(capacity?: number) {
    this.buf = new Buffer(capacity);
  }

  encode(value: unknown): Uint8Array {
    if (value === null) {
      this.encodeNil();
    } else if (value instanceof ArrayBuffer || value instanceof Uint8Array) {
      this.encodeBin(new Uint8Array(value));
    } else if (typeof value === "string") {
      this.encodeStr(value);
    } else if (typeof value === "boolean") {
      this.encodeBool(value);
    } else if (typeof value === "number") {
      if (Number.isInteger(value)) {
        this.encodeInt(value);
      } else {
        this.encodeFloat(value);
      }
    } else if (Array.isArray(value)) {
      this.encodeArray(value);
    } else if (typeof value === "object") {
      this.encodeMap(value);
    } else {
      throw new Error("Encoding not supported for given object");
    }

    return this.buf.toBytes();
  }

  private encodeNil(): void {
    this.buf.ensureCapacity(1);
    this.buf.writeUint8(NIL);
  }

  private encodeBool(value: boolean): void {
    this.buf.ensureCapacity(1);
    this.buf.writeUint8(value ? BOOL_TRUE : BOOL_FALSE);
  }

  private encodeBin(value: Uint8Array): void {
    const size = value.byteLength;
    if (size <= BIN8_MAX) {
      this.buf.ensureCapacity(size + 2);
      this.buf.writeUint8(BIN8);
      this.buf.writeUint8(size);
    } else if (size <= BIN16_MAX) {
      this.buf.ensureCapacity(size + 3);
      this.buf.writeUint8(BIN16);
      this.buf.writeUint16(size);
    } else if (size <= BIN32_MAX) {
      this.buf.ensureCapacity(size + 5);
      this.buf.writeUint8(BIN32);
      this.buf.writeUint32(size);
    } else {
      throw new Error(`Binary of size ${size} not supported`);
    }

    this.buf.writeBytes(new Uint8Array(value.buffer));
  }

  private encodeStr(value: string): void {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(value);
    const size = bytes.length;

    if (size <= FIXSTR_MAX_BYTES) {
      this.buf.ensureCapacity(size + 1);
      this.buf.writeUint8(size | FIXSTR);
    } else if (size <= STR8_MAX_BYTES) {
      this.buf.ensureCapacity(size + 2);
      this.buf.writeUint8(STR8);
      this.buf.writeUint8(size);
    } else if (size <= STR16_MAX_BYTES) {
      this.buf.ensureCapacity(size + 3);
      this.buf.writeUint8(STR16);
      this.buf.writeUint16(size);
    } else if (size <= STR32_MAX_BYTES) {
      this.buf.ensureCapacity(size + 5);
      this.buf.writeUint8(STR32);
      this.buf.writeUint32(size);
    } else {
      throw new Error(`Cannot encode str with more than ${size} bytes`);
    }

    this.buf.writeBytes(bytes);
  }

  private encodeInt(value: number | bigint): void {
    if (value >= 0) {
      if (value <= POSITIVE_FIXINT_MAX) {
        this.buf.ensureCapacity(1);
        this.buf.writeInt8(Number(value) & POSITIVE_FIXINT_MASK);
      } else if (value <= UINT8_MAX) {
        this.buf.ensureCapacity(2);
        this.buf.writeUint8(UINT8);
        this.buf.writeUint8(Number(value));
      } else if (value <= UINT16_MAX) {
        this.buf.ensureCapacity(3);
        this.buf.writeUint8(UINT16);
        this.buf.writeUint16(Number(value));
      } else if (value <= UINT32_MAX) {
        this.buf.ensureCapacity(5);
        this.buf.writeUint8(UINT32);
        this.buf.writeUint32(Number(value));
      } else if (value <= UINT64_MAX) {
        this.buf.ensureCapacity(9);
        this.buf.writeUint8(UINT64);
        this.buf.writeUint64(BigInt(value));
      } else {
        throw new Error("Integers bigger than uint64 max are not supported");
      }
    } else {
      if (value >= NEGATIVE_FIXINT_MIN) {
        this.buf.ensureCapacity(1);
        // add 0x20 (0b00100000) to convert from unsigned to signed
        this.buf.writeInt8(NEGATIVE_FIXINT_MASK | (Number(value) + 0x20));
      } else if (value >= INT8_MIN) {
        this.buf.ensureCapacity(2);
        this.buf.writeUint8(INT8);
        this.buf.writeInt8(Number(value));
      } else if (value >= INT16_MIN) {
        this.buf.ensureCapacity(3);
        this.buf.writeUint8(INT16);
        this.buf.writeInt16(Number(value));
      } else if (value >= INT32_MIN) {
        this.buf.ensureCapacity(5);
        this.buf.writeUint8(INT32);
        this.buf.writeInt32(Number(value));
      } else if (value >= INT64_MIN) {
        this.buf.ensureCapacity(9);
        this.buf.writeUint8(INT64);
        this.buf.writeInt64(BigInt(value));
      } else {
        throw new Error("Integers smaller than int64 min are not supported");
      }
    }
  }

  private encodeFloat(value: number): void {
    const isFloat32 = Math.fround(value) === value;
    if (isFloat32) {
      this.buf.ensureCapacity(5);
      this.buf.writeUint8(FLOAT32);
      this.buf.writeFloat32(value);
    } else {
      this.buf.ensureCapacity(9);
      this.buf.writeUint8(FLOAT64);
      this.buf.writeFloat64(value);
    }
  }

  private encodeArray(value: any[]): void {
    const length = value.length;
    if (length <= FIXARRAY_MAX) {
      this.buf.ensureCapacity(1);
      this.buf.writeUint8(FIXARRAY_MASK | length);
    } else if (length <= ARRAY16_MAX) {
      this.buf.ensureCapacity(3);
      this.buf.writeUint8(ARRAY16);
      this.buf.writeUint16(length);
    } else if (length <= ARRAY32_MAX) {
      this.buf.ensureCapacity(5);
      this.buf.writeUint8(ARRAY32);
      this.buf.writeUint32(length);
    } else {
      throw new Error(`Cannot encode array with more than ${length} items`);
    }

    for (const v of value) {
      this.encode(v);
    }
  }

  private encodeMap(value: Record<string, any>): void {
    const keys = Object.keys(value);
    const length = keys.length;
    if (length <= FIXMAP_MAX) {
      this.buf.ensureCapacity(2 * length + 1);
      this.buf.writeUint8(FIXMAP_MASK & length);
    } else if (length <= MAP16_MAX) {
      this.buf.ensureCapacity(2 * length + 3);
      this.buf.writeUint8(MAP16);
      this.buf.writeUint16(length);
    } else if (length <= MAP32_MAX) {
      this.buf.ensureCapacity(2 * length + 5);
      this.buf.writeUint8(MAP32);
      this.buf.writeUint32(length);
    } else {
      throw new Error(`Map cannot have more than ${length} items`);
    }

    for (const k in value) {
      const v = value[k];
      // for now we do not encode undefined but may add a config to allow it
      if (v !== undefined) {
        this.encodeStr(k);
        this.encode(v);
      }
    }
  }
}

function main() {
  let raw = true;
  let encoded = new Encoder().encode(raw);
  let decoded = decodeBool(encoded);
  if (raw != decoded) {
    throw new Error("expected raw to equal decoded");
  }

  raw = false;
  encoded = new Encoder().encode(raw);
  decoded = decodeBool(encoded);
  if (raw != decoded) {
    throw new Error("expected raw to equal decoded");
  }

  encoded = new Encoder().encode(null);
  if (decodeNil(encoded) !== null) {
    throw new Error("expected null to equal decoded");
  }

  let str = "test";
  const encstr = new Encoder().encode(str);
  let outstr = decodeStr(new DataView(encstr.buffer));
  if (outstr !== str) {
    const enc = new TextEncoder();
    console.error(enc.encode(outstr), enc.encode(str));
    throw new Error("expected decoded str to equal raw str");
  }

  let bin = new TextEncoder().encode("test");
  const encbin = new Encoder().encode(bin);
  console.warn({ encbin, bin });
  let outbin = decodeBin(encbin);
  if (outbin.toString() !== bin.toString()) {
    console.error(outbin, bin);
    throw new Error("expected decode bin to equal raw bin");
  }

  let int: number | bigint = 2;
  let encint = new Encoder().encode(int);
  let outint = decodeInt(encint);
  if (outint !== int) {
    throw new Error("expected decoded int to equal raw int");
  }

  int = -2;
  encint = new Encoder().encode(int);
  outint = decodeInt(encint);
  if (outint !== int) {
    console.error(encint, outint);
    throw new Error("expected decoded int to equal raw int");
  }

  int = -46700;
  encint = new Encoder().encode(int);
  outint = decodeInt(encint);
  if (outint !== int) {
    console.error(encint, outint);
    throw new Error("expected decoded int to equal raw int");
  }

  // TODO: i think the decodeInt is still broken due to how i deal with
  // negative fixint

  console.info("Everything ok");
}

main();
