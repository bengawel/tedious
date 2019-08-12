const WritableTrackingBuffer = require('../tracking-buffer/writable-tracking-buffer');
const NULL = (1 << 16) - 1;
const MAX = (1 << 16) - 1;

module.exports = {
  id: 0xE7,
  type: 'NVARCHAR',
  name: 'NVarChar',
  hasCollation: true,
  dataLengthLength: 2,
  maximumLength: 4000,

  declaration: function(parameter) {
    let length;
    if (parameter.length) {
      length = parameter.length;
    } else if (parameter.value != null) {
      length = parameter.value.toString().length || 1;
    } else if (parameter.value === null && !parameter.output) {
      length = 1;
    } else {
      length = this.maximumLength;
    }

    if (length <= this.maximumLength) {
      return 'nvarchar(' + length + ')';
    } else {
      return 'nvarchar(max)';
    }
  },

  resolveLength: function(parameter) {
    if (parameter.length != null) {
      return parameter.length;
    } else if (parameter.value != null) {
      if (Buffer.isBuffer(parameter.value)) {
        return (parameter.value.length / 2) || 1;
      } else {
        return parameter.value.toString().length || 1;
      }
    } else {
      return this.maximumLength;
    }
  },

  getTypeInfoBufferLength: function(parameter) {
    return WritableTrackingBuffer.getUInt8Length() + WritableTrackingBuffer.getUInt16LELength() + WritableTrackingBuffer.getBufferLength(Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00]));
  },

  getParameterDataBufferLength: function(parameter, options) {
    if (parameter.value != null) {
      if (parameter.length <= this.maximumLength) {
        return WritableTrackingBuffer.getUsVarbyteLength(parameter.value, 'ucs2');
      } else {
        return WritableTrackingBuffer.getPLPBodyLength(parameter.value, 'ucs2');
      }
    } else if (parameter.length <= this.maximumLength) {
      return WritableTrackingBuffer.getUInt16LELength();
    } else {
      return WritableTrackingBuffer.getUInt32LELength() + WritableTrackingBuffer.getUInt32LELength();
    }
  },

  writeTypeInfo: function(buffer, parameter) {
    buffer.writeUInt8(this.id);
    if (parameter.length <= this.maximumLength) {
      buffer.writeUInt16LE(parameter.length * 2);
    } else {
      buffer.writeUInt16LE(MAX);
    }
    buffer.writeBuffer(Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00]));
  },

  writeParameterData: function(buffer, parameter, options, cb) {
    if (parameter.value != null) {
      if (parameter.length <= this.maximumLength) {
        buffer.writeUsVarbyte(parameter.value, 'ucs2');
      } else {
        buffer.writePLPBody(parameter.value, 'ucs2');
      }
    } else if (parameter.length <= this.maximumLength) {
      buffer.writeUInt16LE(NULL);
    } else {
      buffer.writeUInt32LE(0xFFFFFFFF);
      buffer.writeUInt32LE(0xFFFFFFFF);
    }
    cb();
  },

  validate: function(value) {
    if (value == null) {
      return null;
    }
    if (typeof value !== 'string') {
      if (typeof value.toString !== 'function') {
        return TypeError('Invalid string.');
      }
      value = value.toString();
    }
    return value;
  }
};
