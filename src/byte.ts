export const NIL = 0xc0;

export const BOOL_TRUE = 0xc2;
export const BOOL_FALSE = 0xc3;

// use with OR to set the three most significant bits as 101 respectively
export const FIXSTR = 0b10100000;
export const FIXSTR_MASK = 0b11100000;
export const FIXSTR_SIZE_MASK = 0b00011111;
export const FIXSTR_MAX_BYTES = 31;

// head byte of str8
export const STR8 = 0xd9;
export const STR8_MAX_BYTES = 2 ** 8 - 1;

// head byte of str16
export const STR16 = 0xda;
export const STR16_MAX_BYTES = 2 ** 16 - 1;

// head byte of str32
export const STR32 = 0xdb;
export const STR32_MAX_BYTES = 2 ** 32 - 1;

// head byte of bin8
export const BIN8 = 0xc4;
export const BIN8_MAX = 2 ** 8 - 1;

// head byte of bin16
export const BIN16 = 0xc5;
export const BIN16_MAX = 2 ** 16 - 1;

// head byte of bin32
export const BIN32 = 0xc6;
export const BIN32_MAX = 2 ** 32 - 1;

// use with AND to set most significant bit to 0
export const POSITIVE_FIXINT_MASK = 0b01111111;
export const POSITIVE_FIXINT_MAX = 2 ** 7 - 1;

export const NEGATIVE_FIXINT_MIN = -1 * 2 ** 5;
// use with OR to set the three most significant bits to 1
export const NEGATIVE_FIXINT_MASK = 0b11100000;

// head byte of int8
export const INT8 = 0xd0;
export const INT8_MIN = -1 * 2 ** 7;

// head byte of uint8
export const UINT8 = 0xcc;
export const UINT8_MAX = 2 ** 8 - 1;

// head byte of int16
export const INT16 = 0xd1;
export const INT16_MIN = -1 * 2 ** 15;

// head byte of uint16
export const UINT16 = 0xcd;
export const UINT16_MAX = 2 ** 16 - 1;

// head byte of int32
export const INT32 = 0xd2;
export const INT32_MIN = -1 * 2 ** 31;

// head byte of uint32
export const UINT32 = 0xce;
export const UINT32_MAX = 2 ** 32 - 1;

// head byte of int64
export const INT64 = 0xd3;
export const INT64_MIN = -1n * 2n ** 63n;

// head byte of uint64
export const UINT64 = 0xcf;
export const UINT64_MAX = 2n ** 64n - 1n;

// most significant byte of float32
export const FLOAT32 = 0xca;

// most significant byte of float64
export const FLOAT64 = 0xcb;

// use with OR to set most significant four bits as 1001
export const FIXARRAY_MASK = 0b10010000;
export const FIXARRAY_MAX = 15;

// most significant byte of array16
export const ARRAY16 = 0xdc;
export const ARRAY16_MAX = 2 ** 16 - 1;

// most significant byte of array32
export const ARRAY32 = 0xdd;
export const ARRAY32_MAX = 2 ** 32 - 1;

// use with OR to set most significant bytes as 1000
export const FIXMAP_MASK = 0b10000000;
export const FIXMAP_MAX = 15;

// most significant byte of map16
export const MAP16 = 0xde;
export const MAP16_MAX = 2 ** 16 - 1;

// most significant byte of map32
export const MAP32 = 0xdf;
export const MAP32_MAX = 2 ** 32 - 1;

// TODO: add support for timestamp and other extensions

export function isNil(byte: number): boolean {
  return byte === NIL;
}

export function isFalse(byte: number): boolean {
  return byte === BOOL_FALSE;
}

export function isTrue(byte: number): boolean {
  return byte === BOOL_TRUE;
}

export function isBin8(byte: number): boolean {
  return byte === BIN8;
}

export function isBin16(byte: number): boolean {
  return byte === BIN16;
}

export function isBin32(byte: number): boolean {
  return byte === BIN32;
}

export function isFixstr(byte: number): boolean {
  return (byte & FIXSTR_MASK) === FIXSTR;
}

export function isStr8(byte: number): boolean {
  return byte === STR8;
}

export function isStr16(byte: number): boolean {
  return byte === STR16;
}

export function isStr32(byte: number): boolean {
  return byte === STR32;
}

export function isPositiveFixint(byte: number): boolean {
  return (byte & ~POSITIVE_FIXINT_MASK) === 0;
}

export function isNegativeFixint(byte: number): boolean {
  return (byte & NEGATIVE_FIXINT_MASK) === NEGATIVE_FIXINT_MASK;
}

export function isInt8(byte: number): boolean {
  return byte === INT8;
}

export function isInt16(byte: number): boolean {
  return byte === INT16;
}

export function isInt32(byte: number): boolean {
  return byte === INT32;
}

export function isInt64(byte: number): boolean {
  return byte === INT64;
}

export function isUint8(byte: number): boolean {
  return byte === UINT8;
}

export function isUint16(byte: number): boolean {
  return byte === UINT16;
}

export function isUint32(byte: number): boolean {
  return byte === UINT32;
}

export function isUint64(byte: number): boolean {
  return byte === UINT64;
}

export function isFloat32(byte: number): boolean {
  return byte === FLOAT32;
}

export function isFloat64(byte: number): boolean {
  return byte === FLOAT64;
}

export function isFixarray(byte: number): boolean {
  return (byte & 0b11110000) === FIXARRAY_MASK;
}

export function isArray16(byte: number): boolean {
  return byte === ARRAY16;
}

export function isArray32(byte: number): boolean {
  return byte === ARRAY32;
}

export function isFixmap(byte: number): boolean {
  return (byte & 0b11110000) === FIXMAP_MASK;
}

export function isMap16(byte: number): boolean {
  return byte === MAP16;
}

export function isMap32(byte: number): boolean {
  return byte === MAP32;
}
