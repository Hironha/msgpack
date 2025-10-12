export class Writer {
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

  getLength(): number {
    return this.bytes.byteLength;
  }

  getIndex(): number {
    return this.idx;
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

  ensureCapacity(size: number): void {
    const remaining = this.bytes.length - this.idx;
    if (remaining < size) {
      const min = this.bytes.length + size;
      let capacity = this.bytes.length || 1;
      while (capacity < min) {
        capacity *= 2;
      }

      this.reallocate(capacity);
    }
  }

  private reallocate(capacity: number): void {
    const buf = new Uint8Array(capacity);
    buf.set(this.bytes);

    this.bytes = buf;
    this.view = new DataView(this.bytes.buffer);
  }
}
