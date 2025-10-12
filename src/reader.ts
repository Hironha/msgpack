export class Reader {
  private src: Uint8Array;
  private view: DataView;
  private idx: number;

  constructor(src: Uint8Array) {
    this.src = src;
    this.view = new DataView(src.buffer);
    this.idx = 0;
  }

  getIndex(): number {
    return this.idx;
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
