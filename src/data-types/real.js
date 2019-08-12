const WritableTrackingBuffer = require('../tracking-buffer/writable-tracking-buffer');
const FloatN = require('./floatn');

module.exports = {
  id: 0x3B,
  type: 'FLT4',
  name: 'Real',

  declaration: function() {
    return 'real';
  },

  getTypeInfoBufferLength: function(parameter) {
    return WritableTrackingBuffer.getUInt8Length() + WritableTrackingBuffer.getUInt8Length();
  },

  getParameterDataBufferLength: function(parameter, options) {
    if (parameter.value != null) {
      return WritableTrackingBuffer.getUInt8Length() + WritableTrackingBuffer.getFloatLELength();
    } else {
      return WritableTrackingBuffer.getUInt8LEngth();
    }
  },

  writeTypeInfo: function(buffer) {
    buffer.writeUInt8(FloatN.id);
    buffer.writeUInt8(4);
  },

  writeParameterData: function(buffer, parameter, options, cb) {
    if (parameter.value != null) {
      buffer.writeUInt8(4);
      buffer.writeFloatLE(parseFloat(parameter.value));
    } else {
      buffer.writeUInt8(0);
    }
    cb();
  },

  validate: function(value) {
    if (value == null) {
      return null;
    }
    value = parseFloat(value);
    if (isNaN(value)) {
      return new TypeError('Invalid number.');
    }
    return value;
  }
};
