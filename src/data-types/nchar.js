const WritableTrackingBuffer = require('../tracking-buffer/writable-tracking-buffer');
const NULL = (1 << 16) - 1;

module.exports = {
  id: 0xEF,
  type: 'NCHAR',
  name: 'NChar',
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

    if (length < this.maximumLength) {
      return 'nchar(' + length + ')';
    } else {
      return 'nchar(' + this.maximumLength + ')';
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
      return WritableTrackingBuffer.getUsVarbyteLength(parameter.value, 'ucs2');
    } else {
      return WritableTrackingBuffer.getUInt16LELength();
    }
  },

  writeTypeInfo: function(buffer, parameter) {
    buffer.writeUInt8(this.id);
    buffer.writeUInt16LE(parameter.length * 2);
    buffer.writeBuffer(Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00]));
  },

  writeParameterData: function(buffer, parameter, options, cb) {
    if (parameter.value != null) {
      buffer.writeUsVarbyte(parameter.value, 'ucs2');
    } else {
      buffer.writeUInt16LE(NULL);
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
