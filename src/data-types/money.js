const MoneyN = require('./moneyn');

module.exports = {
  id: 0x3C,
  type: 'MONEY',
  name: 'Money',

  declaration: function() {
    return 'money';
  },

  getTypeInfoBufferLength: function(buffer, parameter) {
    return buffer.getUInt8Length() + buffer.getUInt8Length();
  },

  getParameterDataBufferLength: function(buffer, parameter, options) {
    if (parameter.value != null) {
      return buffer.getUInt8Length() + buffer.getMoneyLength();
    } else {
      return buffer.getUInt8Length();
    }
  },

  writeTypeInfo: function(buffer) {
    buffer.writeUInt8(MoneyN.id);
    buffer.writeUInt8(8);
  },

  writeParameterData: function(buffer, parameter, options, cb) {
    if (parameter.value != null) {
      buffer.writeUInt8(8);
      buffer.writeMoney(parameter.value * 10000);
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
