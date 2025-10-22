import { describe, test, expect } from "vitest";
import * as Byte from "./byte";
import { Encoder } from "./encoder";
import { Ok } from "./result";

describe("Encoder", () => {
  test("encode nil works", () => {
    const encoder = new Encoder(1);
    const result = encoder.encode(null);
    const expected = new Uint8Array(1);
    const view = new DataView(expected.buffer);
    view.setUint8(0, Byte.NIL);

    expect(Ok.is(result)).toBeTruthy();
    expect(Ok.unwrap(result)).toStrictEqual(expected);
  });

  test("encode true works", () => {
    const encoder = new Encoder(1);
    const result = encoder.encode(true);
    const expected = new Uint8Array(1);
    const view = new DataView(expected.buffer);
    view.setUint8(0, Byte.BOOL_TRUE);

    expect(Ok.is(result)).toBeTruthy();
    expect(Ok.unwrap(result)).toStrictEqual(expected);
  });

  test("encode false works", () => {
    const encoder = new Encoder(1);
    const result = encoder.encode(false);

    const expected = new Uint8Array(1);
    const view = new DataView(expected.buffer);
    view.setUint8(0, Byte.BOOL_FALSE);

    expect(Ok.is(result)).toBeTruthy();
    expect(Ok.unwrap(result)).toStrictEqual(expected);
  });

  test.each([1, Byte.BIN8_MAX])("encode bin8 with length %d works", (size) => {
    const value = new Uint8Array(size);
    for (let i = 0; i < size; i += 1) {
      value[i] = 1;
    }

    const encoder = new Encoder(size);
    const result = encoder.encode(value);

    const expected = new Uint8Array(size + 2);
    const view = new DataView(expected.buffer);
    view.setUint8(0, Byte.BIN8);
    view.setUint8(1, size);
    for (let i = 0; i < size; i += 1) {
      view.setUint8(i + 2, value[i]);
    }

    expect(Ok.is(result)).toBeTruthy();
    expect(Ok.unwrap(result)).toStrictEqual(expected);
  });

  test.each([Byte.BIN8_MAX + 1, Byte.BIN16_MAX])("encode bin16 with length %d works", (size) => {
    const value = new Uint8Array(size);
    for (let i = 0; i < size; i += 1) {
      value[i] = 1;
    }

    const encoder = new Encoder(size);
    const result = encoder.encode(value);

    const pad = 3;
    const expected = new Uint8Array(size + pad);
    const view = new DataView(expected.buffer);
    view.setUint8(0, Byte.BIN16);
    view.setUint16(1, size);
    for (let i = 0; i < size; i += 1) {
      view.setUint8(i + pad, value[i]);
    }

    expect(Ok.is(result)).toBeTruthy();
    expect(Ok.unwrap(result)).toStrictEqual(expected);
  });

  test.each([Byte.BIN16_MAX + 1])("encode bin32 with length %d works", (size) => {
    const value = new Uint8Array(size);
    for (let i = 0; i < size; i += 1) {
      value[i] = 1;
    }

    const encoder = new Encoder(size);
    const result = encoder.encode(value);

    const pad = 5;
    const expected = new Uint8Array(size + pad);
    const view = new DataView(expected.buffer);
    view.setUint8(0, Byte.BIN32);
    view.setUint32(1, size);
    for (let i = 0; i < size; i += 1) {
      view.setUint8(i + pad, value[i]);
    }

    expect(Ok.is(result)).toBeTruthy();
    expect(Ok.unwrap(result)).toStrictEqual(expected);
  });

  test("encode fixstr works", () => {
    const encoder = new Encoder(4);
    const result = encoder.encode("abc");

    const expected = new Uint8Array(4);
    const view = new DataView(expected.buffer);
    view.setUint8(0, 3 | Byte.FIXSTR);
    view.setUint8(1, 97);
    view.setUint8(2, 98);
    view.setUint8(3, 99);

    expect(Ok.is(result)).toBeTruthy();
    expect(Ok.unwrap(result)).toStrictEqual(expected);
  });

  test.each([Byte.FIXSTR_MAX_BYTES + 1, Byte.STR8_MAX_BYTES])(
    "encode str8 with length %d works",
    (length) => {
      const pad = 2;
      const encoder = new Encoder(length + pad);
      const str = new Array(length).fill("a").join("");
      const result = encoder.encode(str);

      const expected = new Uint8Array(str.length + pad);
      const view = new DataView(expected.buffer);
      view.setUint8(0, Byte.STR8);
      view.setUint8(1, str.length);

      for (let i = 0; i < str.length; i += 1) {
        view.setUint8(i + pad, 97);
      }

      expect(Ok.is(result)).toBeTruthy();
      expect(Ok.unwrap(result)).toStrictEqual(expected);
    },
  );

  test.each([Byte.STR8_MAX_BYTES + 1, Byte.STR16_MAX_BYTES])(
    "encode str16 with length %d works",
    (length) => {
      const pad = 3;
      const encoder = new Encoder(length + pad);
      const str = new Array(length).fill("a").join("");
      const result = encoder.encode(str);

      const expected = new Uint8Array(str.length + pad);
      const view = new DataView(expected.buffer);
      view.setUint8(0, Byte.STR16);
      view.setUint16(1, str.length);

      for (let i = 0; i < str.length; i += 1) {
        view.setUint8(i + pad, 97);
      }

      expect(Ok.is(result)).toBeTruthy();
      expect(Ok.unwrap(result)).toStrictEqual(expected);
    },
  );

  // str32 max is too big to test, node goes oom
  test.each([Byte.STR16_MAX_BYTES + 1])("encode str32 with length %d works", (length) => {
    const pad = 5;
    const encoder = new Encoder(length + pad);
    const str = new Array(length).fill("a").join("");
    const result = encoder.encode(str);

    const expected = new Uint8Array(str.length + pad);
    const view = new DataView(expected.buffer);
    view.setUint8(0, Byte.STR32);
    view.setUint32(1, str.length);

    for (let i = 0; i < str.length; i += 1) {
      view.setUint8(i + pad, 97);
    }

    expect(Ok.is(result)).toBeTruthy();
    expect(Ok.unwrap(result)).toStrictEqual(expected);
  });

  test.each([0, Byte.POSITIVE_FIXINT_MAX])("encode positive fixint %d works", (value) => {
    const encoder = new Encoder(1);
    const result = encoder.encode(value);

    const expected = new Uint8Array(1);
    const view = new DataView(expected.buffer);
    view.setUint8(0, value & Byte.POSITIVE_FIXINT_MASK);

    expect(Ok.is(result)).toBeTruthy();
    expect(Ok.unwrap(result)).toStrictEqual(expected);
  });

  test.each([Byte.POSITIVE_FIXINT_MAX + 1, Byte.UINT8_MAX])("encode uint8 %d works", (value) => {
    const encoder = new Encoder(2);
    const result = encoder.encode(value);

    const expected = new Uint8Array(2);
    const view = new DataView(expected.buffer);
    view.setUint8(0, Byte.UINT8);
    view.setUint8(1, value);

    expect(Ok.is(result)).toBeTruthy();
    expect(Ok.unwrap(result)).toStrictEqual(expected);
  });

  test.each([Byte.UINT8_MAX + 1, Byte.UINT16_MAX])("encode uint16 %d works", (value) => {
    const encoder = new Encoder(3);
    const result = encoder.encode(value);

    const expected = new Uint8Array(3);
    const view = new DataView(expected.buffer);
    view.setUint8(0, Byte.UINT16);
    view.setUint16(1, value);

    expect(Ok.is(result)).toBeTruthy();
    expect(Ok.unwrap(result)).toStrictEqual(expected);
  });

  test.each([Byte.UINT16_MAX + 1, Byte.UINT32_MAX])("encode uint32 %d works", (value) => {
    const encoder = new Encoder(5);
    const result = encoder.encode(value);

    const expected = new Uint8Array(5);
    const view = new DataView(expected.buffer);
    view.setUint8(0, Byte.UINT32);
    view.setUint32(1, value);

    expect(Ok.is(result)).toBeTruthy();
    expect(Ok.unwrap(result)).toStrictEqual(expected);
  });

  test.each([BigInt(Byte.UINT32_MAX + 1), Byte.UINT64_MAX])("encode uint64 %d works", (value) => {
    const encoder = new Encoder(9);
    const result = encoder.encode(value);

    const expected = new Uint8Array(9);
    const view = new DataView(expected.buffer);
    view.setUint8(0, Byte.UINT64);
    view.setBigUint64(1, value);

    expect(Ok.is(result)).toBeTruthy();
    expect(Ok.unwrap(result)).toStrictEqual(expected);
  });

  test.each([Byte.NEGATIVE_FIXINT_MIN, -1])("encode negative fixint %d works", (value) => {
    const encoder = new Encoder(1);
    const result = encoder.encode(value);

    const expected = new Uint8Array(1);
    const view = new DataView(expected.buffer);
    view.setUint8(0, Byte.NEGATIVE_FIXINT_MASK | (value + 0x20));

    expect(Ok.is(result)).toBeTruthy();
    expect(Ok.unwrap(result)).toStrictEqual(expected);
  });

  test.each([Byte.INT8_MIN])("encode int8 %d works", (value) => {
    const encoder = new Encoder(2);
    const result = encoder.encode(value);

    const expected = new Uint8Array(2);
    const view = new DataView(expected.buffer);
    view.setUint8(0, Byte.INT8);
    view.setInt8(1, value);

    expect(Ok.is(result)).toBeTruthy();
    expect(Ok.unwrap(result)).toStrictEqual(expected);
  });

  test.each([Byte.INT16_MIN])("encode int16 %d works", (value) => {
    const encoder = new Encoder(3);
    const result = encoder.encode(value);

    const expected = new Uint8Array(3);
    const view = new DataView(expected.buffer);
    view.setUint8(0, Byte.INT16);
    view.setInt16(1, value);

    expect(Ok.is(result)).toBeTruthy();
    expect(Ok.unwrap(result)).toStrictEqual(expected);
  });

  test.each([Byte.INT32_MIN])("encode int32 %d works", (value) => {
    const encoder = new Encoder(5);
    const result = encoder.encode(value);

    const expected = new Uint8Array(5);
    const view = new DataView(expected.buffer);
    view.setUint8(0, Byte.INT32);
    view.setInt32(1, value);

    expect(Ok.is(result)).toBeTruthy();
    expect(Ok.unwrap(result)).toStrictEqual(expected);
  });

  test.each([Byte.INT64_MIN])("encode int64 %d works", (value) => {
    const encoder = new Encoder(9);
    const result = encoder.encode(value);

    const expected = new Uint8Array(9);
    const view = new DataView(expected.buffer);
    view.setUint8(0, Byte.INT64);
    view.setBigInt64(1, value);

    expect(Ok.is(result)).toBeTruthy();
    expect(Ok.unwrap(result)).toStrictEqual(expected);
  });

  test.each([0.5])("encode float32 %f works", (value) => {
    const encoder = new Encoder(5);
    const result = encoder.encode(value);

    const expected = new Uint8Array(5);
    const view = new DataView(expected.buffer);
    view.setUint8(0, Byte.FLOAT32);
    view.setFloat32(1, value);

    expect(Ok.is(result)).toBeTruthy();
    expect(Ok.unwrap(result)).toStrictEqual(expected);
  });

  test.each([0.123456789123456789123456789])("encode float64 %f works", (value) => {
    const encoder = new Encoder(9);
    const result = encoder.encode(value);

    const expected = new Uint8Array(9);
    const view = new DataView(expected.buffer);
    view.setUint8(0, Byte.FLOAT64);
    view.setFloat64(1, value);

    expect(Ok.is(result)).toBeTruthy();
    expect(Ok.unwrap(result)).toStrictEqual(expected);
  });

  test.each([0, Byte.FIXARRAY_MAX])("encode fixarray with length %d works", (length) => {
    const value = new Array(length).fill(0);
    const size = value.length + 1;
    const encoder = new Encoder(size);
    const result = encoder.encode(value);

    const expected = new Uint8Array(size);
    const view = new DataView(expected.buffer);
    view.setUint8(0, Byte.FIXARRAY_MASK | value.length);

    for (let i = 0; i < value.length; i += 1) {
      view.setUint8(i + 1, Byte.POSITIVE_FIXINT_MASK & value[i]);
    }

    expect(Ok.is(result)).toBeTruthy();
    expect(Ok.unwrap(result)).toStrictEqual(expected);
  });

  test.each([Byte.FIXARRAY_MAX + 1, Byte.ARRAY16_MAX])(
    "encode array16 with length %d works",
    (length) => {
      const value = new Array(length).fill(0);
      const size = value.length + 3;
      const encoder = new Encoder(size);
      const result = encoder.encode(value);

      const expected = new Uint8Array(size);
      const view = new DataView(expected.buffer);
      view.setUint8(0, Byte.ARRAY16);
      view.setUint16(1, value.length);

      for (let i = 0; i < value.length; i += 1) {
        view.setUint8(i + 3, Byte.POSITIVE_FIXINT_MASK & value[i]);
      }

      expect(Ok.is(result)).toBeTruthy();
      expect(Ok.unwrap(result)).toStrictEqual(expected);
    },
  );

  // array32 with max length is too big to test
  test.each([Byte.ARRAY16_MAX + 1])("encode array16 with length %d works", (length) => {
    const value = new Array(length).fill(0);
    const size = value.length + 5;
    const encoder = new Encoder(size);
    const result = encoder.encode(value);

    const expected = new Uint8Array(size);
    const view = new DataView(expected.buffer);
    view.setUint8(0, Byte.ARRAY32);
    view.setUint32(1, value.length);

    for (let i = 0; i < value.length; i += 1) {
      view.setUint8(i + 5, Byte.POSITIVE_FIXINT_MASK & value[i]);
    }

    expect(Ok.is(result)).toBeTruthy();
    expect(Ok.unwrap(result)).toStrictEqual(expected);
  });

  test("encode fixmap works", () => {
    const value = { a: 1 };
    const size = 4;
    const encoder = new Encoder(size);
    const result = encoder.encode(value);

    const expected = new Uint8Array(size);
    const view = new DataView(expected.buffer);
    view.setUint8(0, Byte.FIXMAP_MASK | 1);
    view.setUint8(1, Byte.FIXSTR | 1);
    view.setUint8(2, 97);
    view.setUint8(3, Byte.POSITIVE_FIXINT_MASK & 1);

    expect(Ok.is(result)).toBeTruthy();
    expect(Ok.unwrap(result)).toStrictEqual(expected);
  });
});
