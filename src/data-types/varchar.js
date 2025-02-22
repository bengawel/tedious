const NULL = (1 << 16) - 1;
const MAX = (1 << 16) - 1;

module.exports = {
  id: 0xA7,
  type: 'BIGVARCHR',
  name: 'VarChar',
  hasCollation: true,
  dataLengthLength: 2,
  maximumLength: 8000,

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

    if (length <= this.maximumLength) {
      return 'varchar(' + length + ')';
    } else {
      return 'varchar(max)';
    }
  },

  resolveLength: function(parameter) {
    if (parameter.length != null) {
      return parameter.length;
    } else if (parameter.value != null) {
      if (Buffer.isBuffer(parameter.value)) {
        return parameter.value.length || 1;
      } else {
        return parameter.value.toString().length || 1;
      }
    } else {
      return this.maximumLength;
    }
  },

  getTypeInfoBufferLength: function(buffer, parameter) {
    return buffer.getUInt8Length() + buffer.getUInt16LELength() + buffer.getBufferLength(Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00]));
  },

  getParameterDataBufferLength: function(buffer, parameter, options) {
    if (parameter.value != null) {
      if (parameter.length <= this.maximumLength) {
        return buffer.getUsVarbyteLength(parameter.value, 'ascii');
      } else {
        return buffer.getPLPBodyLength(parameter.value, 'ascii');
      }
    } else if (parameter.length <= this.maximumLength) {
      return buffer.getUInt16LELength();
    } else {
      return buffer.getUInt32LELength() + buffer.getUInt32LELength();
    }
  },

  writeTypeInfo: function(buffer, parameter) {
    buffer.writeUInt8(this.id);
    if (parameter.length <= this.maximumLength) {
      buffer.writeUInt16LE(this.maximumLength);
    } else {
      buffer.writeUInt16LE(MAX);
    }
    buffer.writeBuffer(Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00]));
  },

  writeParameterData: function(buffer, parameter, options, cb) {
    if (parameter.value != null) {
      if (parameter.length <= this.maximumLength) {
        buffer.writeUsVarbyte(parameter.value, 'ascii');
      } else {
        buffer.writePLPBody(parameter.value, 'ascii');
      }
    } else if (parameter.length <= this.maximumLength) {
      buffer.writeUInt16LE(NULL);
    } else {
      buffer.writeUInt32LE(0xFFFFFFFF);
      buffer.writeUInt32LE(0xFFFFFFFF);
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
