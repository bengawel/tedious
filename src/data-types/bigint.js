const IntN = require('./intn');
const WritableTrackingBuffer = require('../tracking-buffer/writable-tracking-buffer');

module.exports = {
  id: 0x7F,
  type: 'INT8',
  name: 'BigInt',

  declaration: function() {
    return 'bigint';
  },

  getTypeInfoBufferLength: function(parameter) {
    return WritableTrackingBuffer.getUInt8Length() + WritableTrackingBuffer.getUInt8Length();
  },

  getParameterDataBufferLength: function(parameter, options) {
    if (parameter.value != null) {
      const val = typeof parameter.value !== 'number' ? parameter.value : parseInt(parameter.value);
      return WritableTrackingBuffer.getUInt8Length() + WritableTrackingBuffer.getInt64LELength(val);
    } else {
      return WritableTrackingBuffer.getUInt8Length();
    }
  },

  writeTypeInfo: function(buffer) {
    buffer.writeUInt8(IntN.id);
    buffer.writeUInt8(8);
  },

  writeParameterData: function(buffer, parameter, options, cb) {
    if (parameter.value != null) {
      const val = typeof parameter.value !== 'number' ? parameter.value : parseInt(parameter.value);
      buffer.writeUInt8(8);
      buffer.writeInt64LE(val);
    } else {
      buffer.writeUInt8(0);
    }
    cb();
  },

  validate: function(value) {
    if (value == null) {
      return null;
    }
    if (isNaN(value)) {
      return new TypeError('Invalid number.');
    }
    if (value < -9007199254740991 || value > 9007199254740991) {
      // Number.MIN_SAFE_INTEGER = -9007199254740991
      // Number.MAX_SAFE_INTEGER = 9007199254740991
      // 9007199254740991 = (2**53) - 1
      // Can't use Number.MIN_SAFE_INTEGER and Number.MAX_SAFE_INTEGER directly though
      // as these constants are not available in node 0.10.
      return new TypeError('Value must be between -9007199254740991 and 9007199254740991, inclusive.' +
        ' For bigger numbers, use VarChar type.');
    }
    return value;
  }
};
