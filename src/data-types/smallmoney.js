const WritableTrackingBuffer = require('../tracking-buffer/writable-tracking-buffer');
const MoneyN = require('./moneyn');

module.exports = {
  id: 0x7A,
  type: 'MONEY4',
  name: 'SmallMoney',

  declaration: function() {
    return 'smallmoney';
  },

  getTypeInfoBufferLength: function(parameter) {
    return WritableTrackingBuffer.getUInt8Length() + WritableTrackingBuffer.getUInt8Length();
  },

  getParameterDataLength: function(parameter, options) {
    if (parameter.value != null) {
      return WritableTrackingBuffer.getUInt8Length() + WritableTrackingBuffer.getInt32LELength();
    } else {
      return WritableTrackingBuffer.getUInt8Length();
    }
  },

  writeTypeInfo: function(buffer) {
    buffer.writeUInt8(MoneyN.id);
    buffer.writeUInt8(4);
  },

  writeParameterData: function(buffer, parameter, options, cb) {
    if (parameter.value != null) {
      buffer.writeUInt8(4);
      buffer.writeInt32LE(parameter.value * 10000);
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
    if (value < -214748.3648 || value > 214748.3647) {
      return new TypeError('Value must be between -214748.3648 and 214748.3647.');
    }
    return value;
  }
};
