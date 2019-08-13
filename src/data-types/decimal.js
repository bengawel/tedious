const DecimalN = require('./decimaln');

module.exports = {
  id: 0x37,
  type: 'DECIMAL',
  name: 'Decimal',
  hasPrecision: true,
  hasScale: true,

  declaration: function(parameter) {
    return 'decimal(' + (this.resolvePrecision(parameter)) + ', ' + (this.resolveScale(parameter)) + ')';
  },

  resolvePrecision: function(parameter) {
    if (parameter.precision != null) {
      return parameter.precision;
    } else if (parameter.value === null) {
      return 1;
    } else {
      return 18;
    }
  },

  resolveScale: function(parameter) {
    if (parameter.scale != null) {
      return parameter.scale;
    } else {
      return 0;
    }
  },

  getTypeInfoBufferLength: function(buffer, parameter) {
    return buffer.getUInt8Length() + buffer.getUInt8Length() + buffer.getUInt8Length() + buffer.getUInt8Length();
  },

  getParameterDataBufferLength: function(buffer, parameter, options) {
    if (parameter.value != null) {
      let length;
      if (parameter.precision <= 9) {
        length = buffer.getUInt8Length() + buffer.getUInt8Length() + buffer.getUInt32LELength();
      } else if (parameter.precision <= 19) {
        length = buffer.getUInt8Length() + buffer.getUInt8Length() + buffer.getUInt64LELength();
      } else if (parameter.precision <= 28) {
        length = buffer.getUInt8Length() + buffer.getUInt8Length() + buffer.getUInt32LELength() + buffer.getUInt64LELength();
      } else {
        length = buffer.getUInt8Length() + buffer.getUInt8Length() + buffer.getUInt32LELength() + buffer.getUInt32LELength() + buffer.getUInt64LELength();
      }
      return length;
    } else {
      return buffer.getUInt8Length();
    }
  },

  writeTypeInfo: function(buffer, parameter) {
    buffer.writeUInt8(DecimalN.id);
    if (parameter.precision <= 9) {
      buffer.writeUInt8(5);
    } else if (parameter.precision <= 19) {
      buffer.writeUInt8(9);
    } else if (parameter.precision <= 28) {
      buffer.writeUInt8(13);
    } else {
      buffer.writeUInt8(17);
    }
    buffer.writeUInt8(parameter.precision);
    buffer.writeUInt8(parameter.scale);
  },

  writeParameterData: function(buffer, parameter, options, cb) {
    if (parameter.value != null) {
      const sign = parameter.value < 0 ? 0 : 1;
      const value = Math.round(Math.abs(parameter.value * Math.pow(10, parameter.scale)));
      if (parameter.precision <= 9) {
        buffer.writeUInt8(5);
        buffer.writeUInt8(sign);
        buffer.writeUInt32LE(value);
      } else if (parameter.precision <= 19) {
        buffer.writeUInt8(9);
        buffer.writeUInt8(sign);
        buffer.writeUInt64LE(value);
      } else if (parameter.precision <= 28) {
        buffer.writeUInt8(13);
        buffer.writeUInt8(sign);
        buffer.writeUInt64LE(value);
        buffer.writeUInt32LE(0x00000000);
      } else {
        buffer.writeUInt8(17);
        buffer.writeUInt8(sign);
        buffer.writeUInt64LE(value);
        buffer.writeUInt32LE(0x00000000);
        buffer.writeUInt32LE(0x00000000);
      }
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
