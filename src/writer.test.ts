import { describe, test, expect } from "vitest";
import { Writer } from "./writer";

describe("Writer", () => {
  test("ensure capacity works", () => {
    const values: number[] = [];
    const writer = new Writer(0);

    for (let i = 0; i < 10; i += 1) {
      const value = i + 1;
      writer.ensureCapacity(1);
      writer.writeUint8(value);
      values.push(value);
    }

    const bytes = new Uint8Array(values.length);
    const view = new DataView(bytes.buffer);
    values.forEach((v, i) => view.setUint8(i, v));

    expect(writer.toBytes()).toStrictEqual(bytes);
    expect(writer.getLength()).toStrictEqual(16);
  });

  test("write bytes works", () => {
    const bytes = new Uint8Array(2);
    const view = new DataView(bytes.buffer);
    view.setUint8(0, 1);
    view.setUint8(0, 2);

    const writer = new Writer(2);
    writer.writeBytes(bytes);

    expect(writer.toBytes()).toStrictEqual(bytes);
    expect(writer.getLength()).toStrictEqual(2);
    expect(writer.getIndex()).toStrictEqual(2);
  });

  test.each([0, 2 ** 8 - 1])("write %d uint8 works", (value) => {
    const writer = new Writer(1);
    writer.writeUint8(value);

    const bytes = new Uint8Array(1);
    const view = new DataView(bytes.buffer);
    view.setUint8(0, value);

    expect(writer.getLength()).toStrictEqual(1);
    expect(writer.getIndex()).toStrictEqual(1);
    expect(writer.toBytes()).toStrictEqual(bytes);
  });

  test.each([2 ** 8, 2 ** 16 - 1])("write %d uint16 works", (value) => {
    const writer = new Writer(2);
    writer.writeUint16(value);

    const bytes = new Uint8Array(2);
    const view = new DataView(bytes.buffer);
    view.setUint16(0, value);

    expect(writer.getLength()).toStrictEqual(2);
    expect(writer.getIndex()).toStrictEqual(2);
    expect(writer.toBytes()).toStrictEqual(bytes);
  });

  test.each([2 ** 16, 2 ** 32 - 1])("write %d uint32 works", (value) => {
    const writer = new Writer(4);
    writer.writeUint32(value);

    const bytes = new Uint8Array(4);
    const view = new DataView(bytes.buffer);
    view.setUint32(0, value);

    expect(writer.getLength()).toStrictEqual(4);
    expect(writer.getIndex()).toStrictEqual(4);
    expect(writer.toBytes()).toStrictEqual(bytes);
  });

  test.each([2n ** 32n, 2n ** 64n - 1n])("write %d uint64 works", (value) => {
    const writer = new Writer(8);
    writer.writeUint64(value);

    const bytes = new Uint8Array(8);
    const view = new DataView(bytes.buffer);
    view.setBigUint64(0, value);

    expect(writer.getLength()).toStrictEqual(8);
    expect(writer.getIndex()).toStrictEqual(8);
    expect(writer.toBytes()).toStrictEqual(bytes);
  });

  test.each([-(2 ** 7), 2 ** 7 - 1])("write %d int8 works", (value) => {
    const writer = new Writer(1);
    writer.writeInt8(value);

    const bytes = new Uint8Array(1);
    const view = new DataView(bytes.buffer);
    view.setInt8(0, value);

    expect(writer.getLength()).toStrictEqual(1);
    expect(writer.getIndex()).toStrictEqual(1);
    expect(writer.toBytes()).toStrictEqual(bytes);
  });

  test.each([-(2 ** 15), 2 ** 15 - 1])("write %d int16 works", (value) => {
    const writer = new Writer(2);
    writer.writeInt16(value);

    const bytes = new Uint8Array(2);
    const view = new DataView(bytes.buffer);
    view.setInt16(0, value);

    expect(writer.getLength()).toStrictEqual(2);
    expect(writer.getIndex()).toStrictEqual(2);
    expect(writer.toBytes()).toStrictEqual(bytes);
  });

  test.each([-(2 ** 31), 2 ** 31 - 1])("write %d int32 works", (value) => {
    const writer = new Writer(4);
    writer.writeInt32(value);

    const bytes = new Uint8Array(4);
    const view = new DataView(bytes.buffer);
    view.setInt32(0, value);

    expect(writer.getLength()).toStrictEqual(4);
    expect(writer.getIndex()).toStrictEqual(4);
    expect(writer.toBytes()).toStrictEqual(bytes);
  });

  test.each([-(2n ** 63n), 2n ** 63n - 1n])("write %d int64 works", (value) => {
    const writer = new Writer(8);
    writer.writeInt64(value);

    const bytes = new Uint8Array(8);
    const view = new DataView(bytes.buffer);
    view.setBigInt64(0, value);

    expect(writer.getLength()).toStrictEqual(8);
    expect(writer.getIndex()).toStrictEqual(8);
    expect(writer.toBytes()).toStrictEqual(bytes);
  });
});
