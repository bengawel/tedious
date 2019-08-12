const WritableTrackingBuffer = require('../tracking-buffer/writable-tracking-buffer');
const BitN = require('./bitn');

module.exports = {
  id: 0x32,
  type: 'BIT',
  name: 'Bit',

  declaration: function() {
    return 'bit';
  },

  getTypeInfoBufferLength: function(parameter) {
    return WritableTrackingBuffer.getUInt8Length() + WritableTrackingBuffer.getUInt8Length();
  },

  getParamterDataBufferLength: function(paramter, options) {
    if (typeof parameter.value === 'undefined' || parameter.value === null) {
      return WritableTrackingBuffer.getUInt8Length();
    } else {
      return WritableTrackingBuffer.getUInt8Length() + WritableTrackingBuffer.getUInt8Length();
    }
  },

  writeTypeInfo: function(buffer) {
    buffer.writeUInt8(BitN.id);
    buffer.writeUInt8(1);
  },

  writeParameterData: function(buffer, parameter, options, cb) {
    if (typeof parameter.value === 'undefined' || parameter.value === null) {
      buffer.writeUInt8(0);
    } else {
      buffer.writeUInt8(1);
      buffer.writeUInt8(parameter.value ? 1 : 0);
    }
    cb();
  },

  validate: function(value) {
    if (value == null) {
      return null;
    }
    if (value) {
      return true;
    } else {
      return false;
    }
  }
};
