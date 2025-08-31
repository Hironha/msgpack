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

// head byte of fixext4
const FIXEXT4 = 0xd6;

// head byte of fixext8
const FIXEXT8 = 0xd7;

// head byte of ext8
const EX8 = 0xc7;

// head byte of timestamp32, since it's encoded as fixext4, it uses the same head
const TS32 = FIXEXT4;

function encodeInt(value: number | bigint): Uint8Array {
  if (typeof value === "number" && !Number.isInteger(value)) {
    throw new Error("Encode int expected an integer as argument");
  }

  let view: DataView;
  if (value >= 0) {
    if (value <= POSITIVE_FIXINT_MAX) {
      view = new DataView(new ArrayBuffer(1));
      view.setInt8(0, Number(value) & POSITIVE_FIXINT_MASK);
    } else if (value <= UINT8_MAX) {
      view = new DataView(new ArrayBuffer(2));
      view.setUint8(0, UINT8);
      view.setUint8(1, Number(value));
    } else if (value <= UINT16_MAX) {
      view = new DataView(new ArrayBuffer(3));
      view.setUint8(0, UINT16);
      view.setUint16(1, Number(value));
    } else if (value <= UINT32_MAX) {
      view = new DataView(new ArrayBuffer(5));
      view.setUint8(0, UINT32);
      view.setUint32(1, Number(value));
    } else if (value <= UINT64_MAX) {
      view = new DataView(new ArrayBuffer(9));
      view.setUint8(0, UINT64);
      view.setBigUint64(1, BigInt(value));
    } else {
      throw new Error("integers bigger than uint64 max are not supported");
    }
  } else {
    if (value >= NEGATIVE_FIXINT_MIN) {
      view = new DataView(new ArrayBuffer(1));
      // add 0x20 (0b00100000) to convert from unsigned to signed
      view.setInt8(0, NEGATIVE_FIXINT_MASK | (Number(value) + 0x20));
    } else if (value >= INT8_MIN) {
      view = new DataView(new ArrayBuffer(2));
      view.setUint8(0, INT8);
      view.setInt8(1, Number(value));
    } else if (value >= INT16_MIN) {
      view = new DataView(new ArrayBuffer(3));
      view.setUint8(0, INT16);
      view.setInt16(1, Number(value));
    } else if (value >= INT32_MIN) {
      view = new DataView(new ArrayBuffer(5));
      view.setUint8(0, INT32);
      view.setInt32(1, Number(value));
    } else if (value >= INT64_MIN) {
      view = new DataView(new ArrayBuffer(9));
      view.setUint8(0, INT64);
      view.setBigInt64(1, BigInt(value));
    } else {
      throw new Error("integers smaller than int64 min are not supported");
    }
  }

  return new Uint8Array(view.buffer);
}

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

function encodeBin(value: ArrayBufferView): Uint8Array {
  const size = value.byteLength;

  let offset = 0;
  let arr: Uint8Array;
  if (size <= BIN8_MAX) {
    offset = 2;
    arr = new Uint8Array(size + offset);
    arr[0] = BIN8;
    arr[1] = size;
  } else if (size <= BIN16_MAX) {
    offset = 3;
    arr = new Uint8Array(size + offset);
    arr[0] = BIN16;
    arr[1] = size;
  } else if (size <= BIN32_MAX) {
    offset = 5;
    arr = new Uint8Array(size + offset);
    arr[0] = BIN32;
    arr[1] = size;
  } else {
    throw new Error(`Binary of size ${size} not supported`);
  }

  arr.set(new Uint8Array(value.buffer), offset);
  return arr;
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
  arr.set(value.slice(offset));
  return arr;
}

function encodeStr(value: string): Uint8Array {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(value);
  const size = bytes.byteLength;

  let offset = 0;
  let arr: Uint8Array;
  if (size <= FIXSTR_MAX_BYTES) {
    offset = 1;
    arr = new Uint8Array(size + offset);
    arr[0] = size | FIXSTR;
  } else if (size <= STR8_MAX_BYTES) {
    offset = 2;
    arr = new Uint8Array(size + offset);
    arr[0] = STR8;
    arr[1] = size;
  } else if (size <= STR16_MAX_BYTES) {
    offset = 3;
    arr = new Uint8Array(size + offset);
    arr[0] = STR16;
    arr[1] = size;
  } else if (size <= STR32_MAX_BYTES) {
    offset = 5;
    arr = new Uint8Array(size + offset);
    arr[0] = STR32;
    arr[1] = size;
  } else {
    throw new Error(`Str with size of ${size} bytes is not supported`);
  }

  arr.set(bytes, offset);
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

  if (size < view.byteLength - offset) {
    throw new Error("Informed string size cannot fit encoded string");
  }

  const slice = view.buffer.slice(offset);
  const decoder = new TextDecoder("utf-8");
  return decoder.decode(new Uint8Array(slice));
}

function encodeNil(): DataView {
  const buf = new ArrayBuffer(1);
  const view = new DataView(buf);
  view.setUint8(0, NIL);
  return view;
}

function decodeNil(view: DataView): null {
  if (view.byteLength !== 1) {
    throw new Error("Expected nil buffer to have one byte");
  }

  const value = view.getUint8(0);
  if (value !== NIL) {
    throw new Error("Invalid buffer byte for nil");
  }

  return null;
}

function encodeBool(value: boolean): DataView {
  const buf = new ArrayBuffer(1);
  const view = new DataView(buf);
  view.setUint8(0, value ? BOOL_TRUE : BOOL_FALSE);
  return view;
}

function decodeBool(view: DataView): boolean {
  if (view.byteLength !== 1) {
    throw new Error("Expected boolean buffer to have one byte");
  }

  const value = view.getUint8(0);
  if (value === BOOL_TRUE) return true;
  if (value === BOOL_FALSE) return false;

  throw new Error("Invalid buffer byte for boolean");
}

class Buffer {
  private bytes: Uint8Array;
  private idx: number;

  constructor(capacity = 1024) {
    this.bytes = new Uint8Array(capacity);
    this.idx = 0;
  }

  toBytes(): Uint8Array {
    return this.bytes.subarray(0, this.idx);
  }

  writeU8(byte: number): void {
    this.ensureCapacity(1);
    this.bytes[this.idx] = byte;
    this.idx += 1;
  }

  private ensureCapacity(size: number) {
    const remaining = this.bytes.length - this.idx - 1;
    if (remaining < size) {
      let min = this.bytes.length + size;
      let capacity = this.bytes.length;
      while (capacity < min) {
        capacity * 2;
      }

      this.bytes = this.reallocate(capacity);
    }
  }

  private reallocate(capacity: number): Uint8Array {
    const buf = new Uint8Array(capacity);
    buf.set(this.bytes);
    return buf;
  }
}

class Encoder {
  private buf: Buffer;
  private idx: number;

  constructor(capacity?: number) {
    this.buf = new Buffer(capacity);
    this.idx = 0;
  }

  encode(value: unknown): Uint8Array {
    // TODO: implement the encoding
    return this.buf.toBytes();
  }
}

function main() {
  let raw = true;
  let encoded = encodeBool(raw);
  let decoded = decodeBool(encoded);
  if (raw != decoded) {
    throw new Error("expected raw to equal decoded");
  }

  raw = false;
  encoded = encodeBool(raw);
  decoded = decodeBool(encoded);
  if (raw != decoded) {
    throw new Error("expected raw to equal decoded");
  }

  encoded = encodeNil();
  if (decodeNil(encoded) !== null) {
    throw new Error("expected null to equal decoded");
  }

  let str = "test";
  const encstr = encodeStr("test");
  let outstr = decodeStr(new DataView(encstr.buffer));
  if (outstr !== str) {
    console.error(outstr);
    throw new Error("expected decoded str to equal raw str");
  }

  let bin = new TextEncoder().encode("test");
  const encbin = encodeBin(bin);
  let outbin = decodeBin(encbin);
  if (outbin.toString() !== bin.toString()) {
    console.error(outbin, bin);
    throw new Error("expected decode bin to equal raw bin");
  }

  let int: number | bigint = 2;
  let encint = encodeInt(int);
  let outint = decodeInt(encint);
  if (outint !== int) {
    throw new Error("expected decoded int to equal raw int");
  }

  int = -2;
  encint = encodeInt(int);
  outint = decodeInt(encint);
  if (outint !== int) {
    console.error(encint, outint);
    throw new Error("expected decoded int to equal raw int");
  }

  int = -46700;
  encint = encodeInt(int);
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
