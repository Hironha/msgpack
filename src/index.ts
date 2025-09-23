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

// use with OR to set most significant four bits as 1001
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

class Writer {
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
  private writer: Writer;

  constructor(capacity?: number) {
    this.writer = new Writer(capacity);
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
      // TODO: maybe add a custom error
      throw new Error("Encoding not supported for given object");
    }

    return this.writer.toBytes();
  }

  private encodeNil(): void {
    this.writer.ensureCapacity(1);
    this.writer.writeUint8(NIL);
  }

  private encodeBool(value: boolean): void {
    this.writer.ensureCapacity(1);
    this.writer.writeUint8(value ? BOOL_TRUE : BOOL_FALSE);
  }

  private encodeBin(value: Uint8Array): void {
    const size = value.byteLength;
    if (size <= BIN8_MAX) {
      this.writer.ensureCapacity(size + 2);
      this.writer.writeUint8(BIN8);
      this.writer.writeUint8(size);
    } else if (size <= BIN16_MAX) {
      this.writer.ensureCapacity(size + 3);
      this.writer.writeUint8(BIN16);
      this.writer.writeUint16(size);
    } else if (size <= BIN32_MAX) {
      this.writer.ensureCapacity(size + 5);
      this.writer.writeUint8(BIN32);
      this.writer.writeUint32(size);
    } else {
      // TODO: maybe add a custom error
      throw new Error(`Binary of size ${size} not supported`);
    }

    this.writer.writeBytes(new Uint8Array(value.buffer));
  }

  private encodeStr(value: string): void {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(value);
    const size = bytes.length;

    if (size <= FIXSTR_MAX_BYTES) {
      this.writer.ensureCapacity(size + 1);
      this.writer.writeUint8(size | FIXSTR);
    } else if (size <= STR8_MAX_BYTES) {
      this.writer.ensureCapacity(size + 2);
      this.writer.writeUint8(STR8);
      this.writer.writeUint8(size);
    } else if (size <= STR16_MAX_BYTES) {
      this.writer.ensureCapacity(size + 3);
      this.writer.writeUint8(STR16);
      this.writer.writeUint16(size);
    } else if (size <= STR32_MAX_BYTES) {
      this.writer.ensureCapacity(size + 5);
      this.writer.writeUint8(STR32);
      this.writer.writeUint32(size);
    } else {
      // TODO: maybe add a custom error
      throw new Error(`Cannot encode str with more than ${size} bytes`);
    }

    this.writer.writeBytes(bytes);
  }

  private encodeInt(value: number | bigint): void {
    if (value >= 0) {
      if (value <= POSITIVE_FIXINT_MAX) {
        this.writer.ensureCapacity(1);
        this.writer.writeInt8(Number(value) & POSITIVE_FIXINT_MASK);
      } else if (value <= UINT8_MAX) {
        this.writer.ensureCapacity(2);
        this.writer.writeUint8(UINT8);
        this.writer.writeUint8(Number(value));
      } else if (value <= UINT16_MAX) {
        this.writer.ensureCapacity(3);
        this.writer.writeUint8(UINT16);
        this.writer.writeUint16(Number(value));
      } else if (value <= UINT32_MAX) {
        this.writer.ensureCapacity(5);
        this.writer.writeUint8(UINT32);
        this.writer.writeUint32(Number(value));
      } else if (value <= UINT64_MAX) {
        this.writer.ensureCapacity(9);
        this.writer.writeUint8(UINT64);
        this.writer.writeUint64(BigInt(value));
      } else {
        // TODO: maybe add a custom error
        throw new Error("Integers bigger than uint64 max are not supported");
      }
    } else {
      if (value >= NEGATIVE_FIXINT_MIN) {
        this.writer.ensureCapacity(1);
        // add 0x20 (0b00100000) to convert from unsigned to signed
        this.writer.writeInt8(NEGATIVE_FIXINT_MASK | (Number(value) + 0x20));
      } else if (value >= INT8_MIN) {
        this.writer.ensureCapacity(2);
        this.writer.writeUint8(INT8);
        this.writer.writeInt8(Number(value));
      } else if (value >= INT16_MIN) {
        this.writer.ensureCapacity(3);
        this.writer.writeUint8(INT16);
        this.writer.writeInt16(Number(value));
      } else if (value >= INT32_MIN) {
        this.writer.ensureCapacity(5);
        this.writer.writeUint8(INT32);
        this.writer.writeInt32(Number(value));
      } else if (value >= INT64_MIN) {
        this.writer.ensureCapacity(9);
        this.writer.writeUint8(INT64);
        this.writer.writeInt64(BigInt(value));
      } else {
        // TODO: maybe add a custom error
        throw new Error("Integers smaller than int64 min are not supported");
      }
    }
  }

  private encodeFloat(value: number): void {
    const isFloat32 = Math.fround(value) === value;
    if (isFloat32) {
      this.writer.ensureCapacity(5);
      this.writer.writeUint8(FLOAT32);
      this.writer.writeFloat32(value);
    } else {
      this.writer.ensureCapacity(9);
      this.writer.writeUint8(FLOAT64);
      this.writer.writeFloat64(value);
    }
  }

  private encodeArray(value: any[]): void {
    const length = value.length;
    if (length <= FIXARRAY_MAX) {
      this.writer.ensureCapacity(1);
      this.writer.writeUint8(FIXARRAY_MASK | length);
    } else if (length <= ARRAY16_MAX) {
      this.writer.ensureCapacity(3);
      this.writer.writeUint8(ARRAY16);
      this.writer.writeUint16(length);
    } else if (length <= ARRAY32_MAX) {
      this.writer.ensureCapacity(5);
      this.writer.writeUint8(ARRAY32);
      this.writer.writeUint32(length);
    } else {
      // TODO: maybe add a custom error
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
      this.writer.ensureCapacity(2 * length + 1);
      this.writer.writeUint8(FIXMAP_MASK & length);
    } else if (length <= MAP16_MAX) {
      this.writer.ensureCapacity(2 * length + 3);
      this.writer.writeUint8(MAP16);
      this.writer.writeUint16(length);
    } else if (length <= MAP32_MAX) {
      this.writer.ensureCapacity(2 * length + 5);
      this.writer.writeUint8(MAP32);
      this.writer.writeUint32(length);
    } else {
      // TODO: maybe add a custom error
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

class HeadByte {
  private constructor() {}

  static isNil(byte: number): boolean {
    return byte === NIL;
  }

  static isFalse(byte: number): boolean {
    return byte === BOOL_FALSE;
  }

  static isTrue(byte: number): boolean {
    return byte === BOOL_TRUE;
  }

  static isBin8(byte: number): boolean {
    return byte === BIN8;
  }

  static isBin16(byte: number): boolean {
    return byte === BIN16;
  }

  static isBin32(byte: number): boolean {
    return byte === BIN32;
  }

  static isFixstr(byte: number): boolean {
    return (byte & FIXSTR_MASK) === FIXSTR;
  }

  static isStr8(byte: number): boolean {
    return byte === STR8;
  }

  static isStr16(byte: number): boolean {
    return byte === STR16;
  }

  static isStr32(byte: number): boolean {
    return byte === STR32;
  }

  static isPositiveFixint(byte: number): boolean {
    return (byte & ~POSITIVE_FIXINT_MASK) === 0;
  }

  static isNegativeFixint(byte: number): boolean {
    return (byte & NEGATIVE_FIXINT_MASK) === NEGATIVE_FIXINT_MASK;
  }

  static isInt8(byte: number): boolean {
    return byte === INT8;
  }

  static isInt16(byte: number): boolean {
    return byte === INT16;
  }

  static isInt32(byte: number): boolean {
    return byte === INT32;
  }

  static isInt64(byte: number): boolean {
    return byte === INT64;
  }

  static isUint8(byte: number): boolean {
    return byte === UINT8;
  }

  static isUint16(byte: number): boolean {
    return byte === UINT16;
  }

  static isUint32(byte: number): boolean {
    return byte === UINT32;
  }

  static isUint64(byte: number): boolean {
    return byte === UINT64;
  }

  static isFloat32(byte: number): boolean {
    return byte === FLOAT32;
  }

  static isFloat64(byte: number): boolean {
    return byte === FLOAT64;
  }

  static isFixarray(byte: number): boolean {
    return (byte & 0b11110000) === FIXARRAY_MASK;
  }

  static isArray16(byte: number): boolean {
    return byte === ARRAY16;
  }

  static isArray32(byte: number): boolean {
    return byte === ARRAY32;
  }

  static isFixmap(byte: number): boolean {
    return (byte & 0xb11110000) === FIXMAP_MASK;
  }

  static isMap16(byte: number): boolean {
    return byte === MAP16;
  }

  static isMap32(byte: number): boolean {
    return byte === MAP32;
  }
}

class Reader {
  private src: Uint8Array;
  private view: DataView;
  private idx: number;

  constructor(src: Uint8Array) {
    this.src = src;
    this.view = new DataView(src.buffer);
    this.idx = 0;
  }

  debug() {
    console.debug("Reader: ", { idx: this.idx });
  }

  readInt8(): number | undefined {
    if (this.idx >= this.src.length) {
      return undefined;
    }
    const value = this.view.getInt8(this.idx);
    this.idx += 1;
    return value;
  }

  readInt16(): number | undefined {
    if (this.idx >= this.src.length) {
      return undefined;
    }
    const value = this.view.getInt16(this.idx);
    this.idx += 2;
    return value;
  }

  readInt32(): number | undefined {
    if (this.idx >= this.src.length) {
      return undefined;
    }
    const value = this.view.getInt32(this.idx);
    this.idx += 4;
    return value;
  }

  readInt64(): bigint | undefined {
    if (this.idx >= this.src.length) {
      return undefined;
    }
    const value = this.view.getBigInt64(this.idx);
    this.idx += 8;
    return value;
  }

  readUint8(): number | undefined {
    if (this.idx >= this.src.length) {
      return undefined;
    }
    const byte = this.src[this.idx];
    this.idx += 1;
    return byte;
  }

  readUint16(): number | undefined {
    if (this.idx >= this.src.length) {
      return undefined;
    }
    const value = this.view.getUint16(this.idx);
    this.idx += 2;
    return value;
  }

  readUint32(): number | undefined {
    if (this.idx >= this.src.length) {
      return undefined;
    }
    const value = this.view.getUint32(this.idx);
    this.idx += 4;
    return value;
  }

  readUint64(): bigint | undefined {
    if (this.idx >= this.src.length) {
      return undefined;
    }
    const value = this.view.getBigUint64(this.idx);
    this.idx += 8;
    return value;
  }

  readFloat32(): number | undefined {
    if (this.idx >= this.src.length) {
      return undefined;
    }
    const value = this.view.getFloat32(this.idx);
    this.idx += 4;
    return value;
  }

  readFloat64(): number | undefined {
    if (this.idx >= this.src.length) {
      return undefined;
    }
    const value = this.view.getFloat64(this.idx);
    this.idx += 8;
    return value;
  }

  /**
   * @returns {Uint8Array | undefined} Returns `undefined` when `size` goes out of bound.
   */
  read(size: number): Uint8Array | undefined {
    const end = this.idx + size;
    if (end > this.src.length) {
      return undefined;
    }

    const slice = this.src.slice(this.idx, end);
    this.idx = end;

    return slice;
  }
}

class Decoder {
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

    if (HeadByte.isNil(head)) {
      return null;
    } else if (HeadByte.isFalse(head)) {
      return false;
    } else if (HeadByte.isTrue(head)) {
      return true;
    } else if (HeadByte.isBin8(head)) {
      return this.decodeBin8(this.src);
    } else if (HeadByte.isBin16(head)) {
      return this.decodeBin16(this.src);
    } else if (HeadByte.isBin32(head)) {
      return this.decodeBin32(this.src);
    } else if (HeadByte.isFixstr(head)) {
      return this.decodeFixstr(this.src, head);
    } else if (HeadByte.isStr8(head)) {
      return this.decodeStr8(this.src);
    } else if (HeadByte.isStr16(head)) {
      return this.decodeStr16(this.src);
    } else if (HeadByte.isStr32(head)) {
      return this.decodeStr32(this.src);
    } else if (HeadByte.isPositiveFixint(head)) {
      return this.decodePositiveFixint(head);
    } else if (HeadByte.isNegativeFixint(head)) {
      return this.decodeNegativeFixint(head);
    } else if (HeadByte.isInt8(head)) {
      return this.decodeInt8(this.src);
    } else if (HeadByte.isInt16(head)) {
      return this.decodeInt16(this.src);
    } else if (HeadByte.isInt32(head)) {
      return this.decodeInt32(this.src);
    } else if (HeadByte.isInt64(head)) {
      return this.decodeInt64(this.src);
    } else if (HeadByte.isUint8(head)) {
      return this.decodeUint8(this.src);
    } else if (HeadByte.isUint16(head)) {
      return this.decodeUint16(this.src);
    } else if (HeadByte.isUint32(head)) {
      return this.decodeUint32(this.src);
    } else if (HeadByte.isUint64(head)) {
      return this.decodeUint64(this.src);
    } else if (HeadByte.isFloat32(head)) {
      return this.decodeFloat32(this.src);
    } else if (HeadByte.isFloat64(head)) {
      return this.decodeFloat64(this.src);
    } else if (HeadByte.isFixarray(head)) {
      return this.decodeFixarray(head);
    } else if (HeadByte.isArray16(head)) {
      return this.decodeArray16(this.src);
    } else if (HeadByte.isArray32(head)) {
      return this.decodeArray32(this.src);
    } else if (HeadByte.isFixmap(head)) {
      return this.decodeFixmap(head);
    } else if (HeadByte.isMap16(head)) {
      return this.decodeMap16(this.src);
    } else if (HeadByte.isMap32(head)) {
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
    } else if (size > BIN8_MAX) {
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
    } else if (size > BIN16_MAX) {
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
    } else if (size > BIN32_MAX) {
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
    let size = head & FIXSTR_SIZE_MASK;
    if (size > FIXSTR_MAX_BYTES) {
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
    } else if (size > STR8_MAX_BYTES) {
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
    } else if (size > STR16_MAX_BYTES) {
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
    } else if (size > STR32_MAX_BYTES) {
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

function main() {
  let raw = true;
  let encoded = new Encoder().encode(raw);
  let decoded = new Decoder(encoded).decode();
  if (raw != decoded) {
    throw new Error("expected raw to equal decoded");
  }

  raw = false;
  encoded = new Encoder().encode(raw);
  decoded = new Decoder(encoded).decode();
  if (raw != decoded) {
    throw new Error("expected raw to equal decoded");
  }

  encoded = new Encoder().encode(null);
  if (new Decoder(encoded).decode() !== null) {
    throw new Error("expected null to equal decoded");
  }

  let str = "test";
  const encstr = new Encoder().encode(str);
  let outstr = new Decoder(encstr).decode();
  if (outstr !== str || typeof outstr !== "string") {
    const enc = new TextEncoder();
    console.error(enc.encode(outstr as string), enc.encode(str));
    throw new Error("expected decoded str to equal raw str");
  }

  let bin = new TextEncoder().encode("test");
  const encbin = new Encoder().encode(bin);
  let outbin = new Decoder(encbin).decode();
  if (!(outbin instanceof Uint8Array) || outbin.toString() !== bin.toString()) {
    console.error(outbin, bin);
    throw new Error("expected decode bin to equal raw bin");
  }

  let int: number | bigint = 2;
  let encint = new Encoder().encode(int);
  let outint = new Decoder(encint).decode();
  if (outint !== int) {
    throw new Error("expected decoded int to equal raw int");
  }

  int = -2;
  encint = new Encoder().encode(int);
  outint = new Decoder(encint).decode();
  if (outint !== int) {
    console.error(encint, outint);
    throw new Error("expected decoded int to equal raw int");
  }

  int = -46700;
  encint = new Encoder().encode(int);
  outint = new Decoder(encint).decode();
  if (outint !== int) {
    console.error(encint, outint);
    throw new Error("expected decoded int to equal raw int");
  }

  // TODO: i think the decodeInt is still broken due to how i deal with
  // negative fixint

  console.info("Everything ok");
}

main();
