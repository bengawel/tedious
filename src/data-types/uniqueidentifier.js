const guidParser = require('../guid-parser');

module.exports = {
  id: 0x24,
  type: 'GUIDN',
  name: 'UniqueIdentifier',
  dataLengthLength: 1,

  declaration: function() {
    return 'uniqueidentifier';
  },

  resolveLength: function() {
    return 16;
  },

  getTypeInfoBufferLength: function(buffer, parameter) {
    return buffer.getUInt8Length() + buffer.getUInt8Length();
  },

  getParameterDataBufferLength: function(buffer, parameter, options) {
    if (parameter.value != null) {
      return buffer.getUInt8Length() + buffer.getBufferLength(Buffer.from(guidParser.guidToArray(parameter.value)));
    } else {
      return buffer.getUInt8Length();
    }
  },

  writeTypeInfo: function(buffer) {
    buffer.writeUInt8(this.id);
    buffer.writeUInt8(0x10);
  },

  writeParameterData: function(buffer, parameter, options, cb) {
    if (parameter.value != null) {
      buffer.writeUInt8(0x10);
      buffer.writeBuffer(Buffer.from(guidParser.guidToArray(parameter.value)));
    } else {
      buffer.writeUInt8(0);
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
