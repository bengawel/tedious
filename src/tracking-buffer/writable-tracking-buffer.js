// @flow

const bigint = require('./bigint');

const SHIFT_LEFT_32 = (1 << 16) * (1 << 16);
const SHIFT_RIGHT_32 = 1 / SHIFT_LEFT_32;
const UNKNOWN_PLP_LEN = Buffer.from([0xfe, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
const ZERO_LENGTH_BUFFER = Buffer.alloc(0);

export type Encoding = 'utf8' | 'ucs2' | 'ascii';

/*
  A Buffer-like class that tracks position.

  As values are written, the position advances by the size of the written data.
  When writing, automatically allocates new buffers if there's not enough space.
 */
module.exports = class WritableTrackingBuffer {
  initialSize: number;
  encoding: Encoding;
  doubleSizeGrowth: boolean;

  buffer: Buffer;
  compositeBuffer: Buffer;

  position: number;

  constructor(initialSize: number, encoding: ?Encoding, doubleSizeGrowth: ?boolean) {
    this.initialSize = initialSize;
    this.encoding = encoding || 'ucs2';
    this.doubleSizeGrowth = doubleSizeGrowth || false;
    this.buffer = Buffer.alloc(this.initialSize, 0);
    this.compositeBuffer = ZERO_LENGTH_BUFFER;
    this.position = 0;
  }

  // $FlowFixMe: Flow does not like getter/setters that have side-effects.
  get data() {
    this.newBuffer(0);
    return this.compositeBuffer;
  }

  copyFrom(buffer: Buffer) {
    const length = buffer.length;
    this.makeRoomFor(length);
    buffer.copy(this.buffer, this.position);
    this.position += length;
  }

  makeRoomFor(requiredLength: number) {
    if (this.buffer.length - this.position < requiredLength) {
      if (this.doubleSizeGrowth) {
        let size = Math.max(128, this.buffer.length * 2);
        while (size < requiredLength) {
          size *= 2;
        }
        this.newBuffer(size);
      } else {
        this.newBuffer(requiredLength);
      }
    }
  }

  newBuffer(size: number) {
    const buffer = this.buffer.slice(0, this.position);
    this.compositeBuffer = Buffer.concat([this.compositeBuffer, buffer]);
    this.buffer = (size === 0) ? ZERO_LENGTH_BUFFER : Buffer.alloc(size, 0);
    this.position = 0;
  }

  static getUInt8Length() {
    return 1;
  }

  static getUInt16LELength() {
    return 2;
  }

  static getUInt16BELength() {
    return 2;
  }

  static getUInt24LELength() {
    return 3;
  }

  static getUInt32LELength() {
    return 4;
  }

  static getUInt32BELength() {
    return 4;
  }

  static getInt8Length() {
    return 1;
  }

  static getInt16LELength() {
    return 2;
  }

  static getInt16BELength() {
    return 2;
  }

  static getInt32LELength() {
    return 4;
  }

  static getInt32BELength() {
    return 4;
  }

  static getFloatLELength() {
    return 4;
  }

  static getDoubleLELength() {
    return 8;
  }

  static getUShortLength() {
    return this.getUInt16LELength();
  }

  static getUInt40LELength() {
    return this.getInt32LELength() + this.getUInt8Length();
  }

  static getUInt64LELength() {
    return this.getInt32LELength() + this.getInt32LELength();
  }

  static getInt64LELength(value: number) {
    const buf = bigint.numberToInt64LE(value);
    return buf.length;
  }

  static getStringLength(value: string, encoding: ?Encoding) {
    if (encoding == null) {
      encoding = this.encoding;
    }
    return Buffer.byteLength(value, encoding);
  }

  static getBVarCharLength(value: string, encoding: ?Encoding) {
    if (encoding == null) {
      encoding = this.encoding;
    }
    return this.getStringLength(value, encoding) + this.getUInt8Length();
  }

  static getUsVarcharLength(value: string, encoding: ?Encoding) {
    return this.getUInt16LELength() + this.getStringLength(value, encoding);
  }

  static getUsVarbyteLength(value: string, encoding: ?Encoding) {
    if (encoding == null) {
      encoding = this.encoding;
    }

    if (value instanceof Buffer) {
      length = this.getUInt16LELength() + this.getBufferLength(value);
    } else {
      value = value.toString();
      const length = Buffer.byteLength(value, encoding);
      return length + this.getUInt16LELength();
    }
  }

  static getPLPBodyLength(value: any, encoding: ?Encoding) {
    if (encoding == null) {
      encoding = this.encoding;
    }

    if (value instanceof Buffer) {
      if (Buffer.byteLength(value, encoding) > 0) {
        return this.getBufferLength(UNKNOWN_PLP_LEN) + this.getBufferLength(value) + this.getUInt32LELength() + this.getUInt32LELength();
      } else {
        return this.getBufferLength(UNKNOWN_PLP_LEN) + this.getUInt32LELength();
      }
    } else {
      if (value.length > 0) {
        return this.getBufferLength(UNKNOWN_PLP_LEN) + this.getUInt32LELength() + this.getUInt32LELength();
      } else {
        return this.getBufferLength(UNKNOWN_PLP_LEN) + this.getUInt32LELength();
      }
    }


  }

  static getBufferLength(value: Buffer) {
    return value.length;
  }

  static getMoneyLength() {
    return this.getInt32LELength() + this.getInt32LELength();
  }

  writeUInt8(value: number) {
    const length = this.getUInt8Length();
    this.makeRoomFor(length);
    this.buffer.writeUInt8(value, this.position);
    this.position += length;
  }

  writeUInt16LE(value: number) {
    const length = this.getUInt16LELength();
    this.makeRoomFor(length);
    this.buffer.writeUInt16LE(value, this.position);
    this.position += length;
  }

  writeUShort(value: number) {
    this.writeUInt16LE(value);
  }

  writeUInt16BE(value: number) {
    const length = this.getUInt16BELength();
    this.makeRoomFor(length);
    this.buffer.writeUInt16BE(value, this.position);
    this.position += length;
  }

  writeUInt24LE(value: number) {
    const length = this.getUInt24LELength();
    this.makeRoomFor(length);
    this.buffer[this.position + 2] = (value >>> 16) & 0xff;
    this.buffer[this.position + 1] = (value >>> 8) & 0xff;
    this.buffer[this.position] = value & 0xff;
    this.position += length;
  }

  writeUInt32LE(value: number) {
    const length = this.getUInt32LELength();
    this.makeRoomFor(length);
    this.buffer.writeUInt32LE(value, this.position);
    this.position += length;
  }

  writeInt64LE(value: number) {
    const buf = bigint.numberToInt64LE(value);
    this.copyFrom(buf);
  }

  writeUInt32BE(value: number) {
    const length = this.getUInt32BELength();
    this.makeRoomFor(length);
    this.buffer.writeUInt32BE(value, this.position);
    this.position += length;
  }

  writeUInt40LE(value: number) {
    // inspired by https://github.com/dpw/node-buffer-more-ints
    this.writeInt32LE(value & -1);
    this.writeUInt8(Math.floor(value * SHIFT_RIGHT_32));
  }

  writeUInt64LE(value: number) {
    this.writeInt32LE(value & -1);
    this.writeUInt32LE(Math.floor(value * SHIFT_RIGHT_32));
  }

  writeInt8(value: number) {
    const length = this.getInt8Length();
    this.makeRoomFor(length);
    this.buffer.writeInt8(value, this.position);
    this.position += length;
  }

  writeInt16LE(value: number) {
    const length = this.getInt16LELength();
    this.makeRoomFor(length);
    this.buffer.writeInt16LE(value, this.position);
    this.position += length;
  }

  writeInt16BE(value: number) {
    const length = this.getInt16BELength();
    this.makeRoomFor(length);
    this.buffer.writeInt16BE(value, this.position);
    this.position += length;
  }

  writeInt32LE(value: number) {
    const length = this.getInt32LELength();
    this.makeRoomFor(length);
    this.buffer.writeInt32LE(value, this.position);
    this.position += length;
  }

  writeInt32BE(value: number) {
    const length = this.getInt32BELength();
    this.makeRoomFor(length);
    this.buffer.writeInt32BE(value, this.position);
    this.position += length;
  }

  writeFloatLE(value: number) {
    const length = this.getFloatLELength();
    this.makeRoomFor(length);
    this.buffer.writeFloatLE(value, this.position);
    this.position += length;
  }

  writeDoubleLE(value: number) {
    const length = this.getDoubleLELength();
    this.makeRoomFor(length);
    this.buffer.writeDoubleLE(value, this.position);
    this.position += length;
  }

  writeString(value: string, encoding: ?Encoding) {
    if (encoding == null) {
      encoding = this.encoding;
    }

    const length = this.getStringLength(value, encoding);
    this.makeRoomFor(length);

    // $FlowFixMe https://github.com/facebook/flow/pull/5398
    this.buffer.write(value, this.position, encoding);
    this.position += length;
  }

  writeBVarchar(value: string, encoding: ?Encoding) {
    this.writeUInt8(value.length);
    this.writeString(value, encoding);
  }

  writeUsVarchar(value: string, encoding: ?Encoding) {
    this.writeUInt16LE(value.length);
    this.writeString(value, encoding);
  }

  // TODO: Figure out what types are passed in other than `Buffer`
  writeUsVarbyte(value: any, encoding: ?Encoding) {
    if (encoding == null) {
      encoding = this.encoding;
    }

    let length;
    if (value instanceof Buffer) {
      length = value.length;
    } else {
      value = value.toString();
      length = Buffer.byteLength(value, encoding);
    }
    this.writeUInt16LE(length);

    if (value instanceof Buffer) {
      this.writeBuffer(value);
    } else {
      this.makeRoomFor(length);
      // $FlowFixMe https://github.com/facebook/flow/pull/5398
      this.buffer.write(value, this.position, encoding);
      this.position += length;
    }
  }

  writePLPBody(value: any, encoding: ?Encoding) {
    if (encoding == null) {
      encoding = this.encoding;
    }

    let length;
    if (value instanceof Buffer) {
      length = value.length;
    } else {
      value = value.toString();
      length = Buffer.byteLength(value, encoding);
    }

    // Length of all chunks.
    // this.writeUInt64LE(length);
    // unknown seems to work better here - might revisit later.
    this.writeBuffer(UNKNOWN_PLP_LEN);

    // In the UNKNOWN_PLP_LEN case, the data is represented as a series of zero or more chunks.
    if (length > 0) {
      // One chunk.
      this.writeUInt32LE(length);
      if (value instanceof Buffer) {
        this.writeBuffer(value);
      } else {
        this.makeRoomFor(length);
        // $FlowFixMe https://github.com/facebook/flow/pull/5398
        this.buffer.write(value, this.position, encoding);
        this.position += length;
      }
    }

    // PLP_TERMINATOR (no more chunks).
    this.writeUInt32LE(0);
  }

  writeBuffer(value: Buffer) {
    const length = value.length;
    this.makeRoomFor(length);
    value.copy(this.buffer, this.position);
    this.position += length;
  }

  writeMoney(value: number) {
    this.writeInt32LE(Math.floor(value * SHIFT_RIGHT_32));
    this.writeInt32LE(value & -1);
  }
};
