const WritableTrackingBuffer = require('../tracking-buffer/writable-tracking-buffer');
const IntN = require('./intn');

module.exports = {
  id: 0x34,
  type: 'INT2',
  name: 'SmallInt',

  declaration: function() {
    return 'smallint';
  },

  getTypeInfoBufferLength: function(parameter, options) {
    return WritableTrackingBuffer.getUInt8Length() + WritableTrackingBuffer.getUInt8Length();
  },

  getParameterDataBufferLength: function(parameter, options) {
    if (parameter.value != null) {
      return WritableTrackingBuffer.getUInt8Length() + WritableTrackingBuffer.getInt16LELength();
    } else {
      return WritableTrackingBuffer.getUInt8Length();
    }
  },

  writeTypeInfo: function(buffer) {
    buffer.writeUInt8(IntN.id);
    buffer.writeUInt8(2);
  },

  writeParameterData: function(buffer, parameter, options, cb) {
    if (parameter.value != null) {
      buffer.writeUInt8(2);
      buffer.writeInt16LE(parseInt(parameter.value));
    } else {
      buffer.writeUInt8(0);
    }
    cb();
  },

  validate: function(value) {
    if (value == null) {
      return null;
    }
    value = parseInt(value);
    if (isNaN(value)) {
      return new TypeError('Invalid number.');
    }
    if (value < -32768 || value > 32767) {
      return new TypeError('Value must be between -32768 and 32767.');
    }
    return value;
  }
};
