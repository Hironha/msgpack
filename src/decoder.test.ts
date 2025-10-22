import { describe, test, expect } from "vitest";

import * as Byte from "./byte";
import { Ok } from "./result";
import { Encoder } from "./encoder";
import { Decoder } from "./decoder";

describe("Decoder", () => {
  test("decode nil works", () => {
    const src = Ok.unwrap(new Encoder().encode(null));
    const result = new Decoder(src).decode();

    expect(Ok.is(result)).toBeTruthy();
    expect(Ok.unwrap(result)).toStrictEqual(null);
  });

  test.each([false, true])("decode %s works", (value) => {
    const src = Ok.unwrap(new Encoder().encode(value));
    const result = new Decoder(src).decode();

    expect(Ok.is(result)).toBeTruthy();
    expect(Ok.unwrap(result)).toStrictEqual(value);
  });

  test.each([
    { kind: "bin8", size: 1 },
    { kind: "bin8", size: Byte.BIN8_MAX },
    { kind: "bin16", size: Byte.BIN8_MAX + 1 },
    { kind: "bin16", size: Byte.BIN16_MAX },
    { kind: "bin32", size: Byte.BIN16_MAX + 1 },
  ])("decode $kind with length $size works", (cfg) => {
    const value = new Uint8Array(cfg.size);
    const view = new DataView(value.buffer);
    for (let i = 0; i < cfg.size; i += 1) {
      view.setUint8(i, 1);
    }

    const src = Ok.unwrap(new Encoder().encode(value));
    const result = new Decoder(src).decode();

    expect(Ok.is(result)).toBeTruthy();
    expect(Ok.unwrap(result)).toStrictEqual(value);
  });

  test.each([
    { kind: "fixstr", size: 1 },
    { kind: "fixstr", size: Byte.FIXSTR_MAX_BYTES },
    { kind: "str8", size: Byte.FIXSTR_MAX_BYTES + 1 },
    { kind: "str8", size: Byte.STR8_MAX_BYTES },
    { kind: "str16", size: Byte.STR8_MAX_BYTES + 1 },
    { kind: "str16", size: Byte.STR16_MAX_BYTES },
    { kind: "str32", size: Byte.STR16_MAX_BYTES + 1 },
  ])("decode $kind with length $size works", (cfg) => {
    const str = new Array(cfg.size).fill("a").join("");
    const src = Ok.unwrap(new Encoder().encode(str));
    const result = new Decoder(src).decode();

    expect(Ok.is(result)).toBeTruthy();
    expect(Ok.unwrap(result)).toStrictEqual(str);
  });

  test.each([
    { kind: "positive_fixint", value: 1 },
    { kind: "positive_fixint", value: Byte.POSITIVE_FIXINT_MAX },
    { kind: "uint8", value: Byte.POSITIVE_FIXINT_MAX + 1 },
    { kind: "uint8", value: Byte.UINT8_MAX },
    { kind: "uint16", value: Byte.UINT8_MAX + 1 },
    { kind: "uint16", value: Byte.UINT16_MAX },
    { kind: "uint32", value: Byte.UINT16_MAX + 1 },
    { kind: "uint32", value: Byte.UINT32_MAX },
    { kind: "uint64", value: BigInt(Byte.UINT32_MAX) + 1n },
    { kind: "negative_fixint", value: -1 },
    { kind: "negative_fixint", value: Byte.NEGATIVE_FIXINT_MIN },
    { kind: "int8", value: Byte.NEGATIVE_FIXINT_MIN - 1 },
    { kind: "int8", value: Byte.INT8_MIN },
    { kind: "int16", value: Byte.INT8_MIN - 1 },
    { kind: "int16", value: Byte.INT16_MIN },
    { kind: "int32", value: Byte.INT16_MIN - 1 },
    { kind: "int32", value: Byte.INT32_MIN },
    { kind: "int64", value: BigInt(Byte.INT32_MIN) - 1n },
    { kind: "int64", value: Byte.INT64_MIN },
    { kind: "float32", value: 0.5 },
    { kind: "float64", value: 0.123456789123456789123456789 },
  ])("decode $kind with value $value works", (cfg) => {
    const src = Ok.unwrap(new Encoder().encode(cfg.value));
    const result = new Decoder(src).decode();

    expect(Ok.is(result)).toBeTruthy();
    expect(Ok.unwrap(result)).toStrictEqual(cfg.value);
  });

  test.each([
    { kind: "fixarray", size: 1 },
    { kind: "fixarray", size: Byte.FIXARRAY_MAX },
    { kind: "array16", size: Byte.FIXARRAY_MAX + 1 },
    { kind: "array16", size: Byte.ARRAY16_MAX },
    { kind: "array32", size: Byte.ARRAY16_MAX + 1 },
  ])("decode $kind with length $size works", (cfg) => {
    const value = new Array(cfg.size).fill(1).map(() => 1);
    const src = Ok.unwrap(new Encoder().encode(value));
    const result = new Decoder(src).decode();

    expect(Ok.is(result)).toBeTruthy();
    expect(Ok.unwrap(result)).toStrictEqual(value);
  });

  test.each([
    { kind: "fixmap", size: 1 },
    { kind: "fixmap", size: Byte.FIXMAP_MAX },
    { kind: "map16", size: Byte.FIXMAP_MAX + 1 },
    { kind: "map16", size: Byte.MAP16_MAX },
    { kind: "map32", size: Byte.MAP16_MAX + 1 },
  ])("decode $kind with length $size works", (cfg) => {
    const value = new Map();
    for (let i = 0; i < cfg.size; i += 1) {
      value.set(i.toString(), 1);
    }

    const obj = Object.fromEntries(value.entries());
    const src = Ok.unwrap(new Encoder().encode(obj));
    const result = new Decoder(src).decode();

    expect(Ok.is(result)).toBeTruthy();
    expect(Ok.unwrap(result)).toStrictEqual(obj);
  });
});
