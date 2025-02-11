const IntN = require('./intn');

module.exports = {
  id: 0x30,
  type: 'INT1',
  name: 'TinyInt',

  declaration: function() {
    return 'tinyint';
  },

  getTypeInfoBufferLength: function(buffer, parameter) {
    return buffer.getUInt8Length() + buffer.getUInt8Length();
  },

  getParameterDataBufferLength: function(buffer, parameter, options) {
    if (parameter.value != null) {
      return buffer.getUInt8Length() + buffer.getUInt8Length();
    } else {
      return buffer.getUInt8Length();
    }
  },

  writeTypeInfo: function(buffer) {
    buffer.writeUInt8(IntN.id);
    buffer.writeUInt8(1);
  },

  writeParameterData: function(buffer, parameter, options, cb) {
    if (parameter.value != null) {
      buffer.writeUInt8(1);
      buffer.writeUInt8(parseInt(parameter.value));
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
    if (value < 0 || value > 255) {
      return new TypeError('Value must be between 0 and 255.');
    }
    return value;
  }
};
