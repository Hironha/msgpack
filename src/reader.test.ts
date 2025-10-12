import { describe, test, expect } from "vitest";
import { Reader } from "./reader";

describe("Reader", () => {
  test.each([0, 2 ** 8 - 1])("read %d uint8 works", (value) => {
    const src = new Uint8Array(1);
    const view = new DataView(src.buffer);
    view.setUint8(0, value);

    const reader = new Reader(src);
    const idx = 1;
    expect(reader.readUint8()).toStrictEqual(value);
    expect(reader.getIndex()).toStrictEqual(idx);
    expect(reader.readUint8()).toBeUndefined();
    expect(reader.getIndex()).toStrictEqual(idx);
  });

  test.each([2 ** 8, 2 ** 16 - 1])("read %d uint16 works", (value) => {
    const src = new Uint8Array(2);
    const view = new DataView(src.buffer);
    view.setUint16(0, value);

    const reader = new Reader(src);
    const idx = 2;
    expect(reader.readUint16()).toStrictEqual(value);
    expect(reader.getIndex()).toStrictEqual(idx);
    expect(reader.readUint8()).toBeUndefined();
    expect(reader.getIndex()).toStrictEqual(idx);
  });

  test.each([2 ** 16, 2 ** 32 - 1])("read %d uint32 works", (value) => {
    const src = new Uint8Array(4);
    const view = new DataView(src.buffer);
    view.setUint32(0, value);

    const reader = new Reader(src);
    const idx = 4;
    expect(reader.readUint32()).toStrictEqual(value);
    expect(reader.getIndex()).toStrictEqual(idx);
    expect(reader.readUint8()).toBeUndefined();
    expect(reader.getIndex()).toStrictEqual(idx);
  });

  test.each([2n ** 32n, 2n ** 64n - 1n])("read %d uint64 works", (value) => {
    const src = new Uint8Array(8);
    const view = new DataView(src.buffer);
    view.setBigUint64(0, value);

    const reader = new Reader(src);
    const idx = 8;
    expect(reader.readUint64()).toStrictEqual(value);
    expect(reader.getIndex()).toStrictEqual(idx);
    expect(reader.readUint8()).toBeUndefined();
    expect(reader.getIndex()).toStrictEqual(idx);
  });

  test.each([-(2 ** 7), 2 ** 7 - 1])("read %d int8 works", (value) => {
    const src = new Uint8Array(1);
    const view = new DataView(src.buffer);
    view.setInt8(0, value);

    const reader = new Reader(src);
    const idx = 1;
    expect(reader.readInt8()).toStrictEqual(value);
    expect(reader.getIndex()).toStrictEqual(idx);
    expect(reader.readUint8()).toBeUndefined();
    expect(reader.getIndex()).toStrictEqual(idx);
  });

  test.each([-(2 ** 15), 2 ** 15 - 1])("read %d int16 works", (value) => {
    const src = new Uint8Array(2);
    const view = new DataView(src.buffer);
    view.setInt16(0, value);

    const reader = new Reader(src);
    const idx = 2;
    expect(reader.readInt16()).toStrictEqual(value);
    expect(reader.getIndex()).toStrictEqual(idx);
    expect(reader.readUint8()).toBeUndefined();
    expect(reader.getIndex()).toStrictEqual(idx);
  });

  test.each([-(2 ** 31), 2 ** 31 - 1])("read %d int32 works", (value) => {
    const src = new Uint8Array(4);
    const view = new DataView(src.buffer);
    view.setInt32(0, value);

    const reader = new Reader(src);
    const idx = 4;
    expect(reader.readInt32()).toStrictEqual(value);
    expect(reader.getIndex()).toStrictEqual(idx);
    expect(reader.readUint8()).toBeUndefined();
    expect(reader.getIndex()).toStrictEqual(idx);
  });

  test.each([-(2n ** 63n), 2n ** 63n - 1n])("read %d int64 works", (value) => {
    const src = new Uint8Array(8);
    const view = new DataView(src.buffer);
    view.setBigInt64(0, value);

    const reader = new Reader(src);
    const idx = 8;
    expect(reader.readInt64()).toStrictEqual(value);
    expect(reader.getIndex()).toStrictEqual(idx);
    expect(reader.readUint8()).toBeUndefined();
    expect(reader.getIndex()).toStrictEqual(idx);
  });
});
