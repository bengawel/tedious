const WritableTrackingBuffer = require('../tracking-buffer/writable-tracking-buffer');
const NULL = (1 << 16) - 1;
const MAX = (1 << 16) - 1;

module.exports = {
  id: 0xA5,
  type: 'BIGVARBIN',
  name: 'VarBinary',
  dataLengthLength: 2,
  maximumLength: 8000,

  declaration: function(parameter) {
    let length;
    if (parameter.length) {
      length = parameter.length;
    } else if (parameter.value != null) {
      length = parameter.value.length || 1;
    } else if (parameter.value === null && !parameter.output) {
      length = 1;
    } else {
      length = this.maximumLength;
    }

    if (length <= this.maximumLength) {
      return 'varbinary(' + length + ')';
    } else {
      return 'varbinary(max)';
    }
  },

  resolveLength: function(parameter) {
    if (parameter.length != null) {
      return parameter.length;
    } else if (parameter.value != null) {
      return parameter.value.length;
    } else {
      return this.maximumLength;
    }
  },

  getTypeInfoBufferLength: function(parameter) {
    return WritableTrackingBuffer.getUInt8Length() + WritableTrackingBuffer.getUInt16LELength();
  },

  getParameterDataBufferLength: function(parameter, options) {
    if (parameter.value != null) {
      if (parameter.length <= this.maximumLength) {
        return WritableTrackingBuffer.getUSVarbyteLength(parameter.value);
      } else {
        return WritableTrackingBuffer.getPLPBodyLength(parameter.value);
      }
    } else if (parameter.length <= this.maximumLength) {
      return WritableTrackingBuffer.getUInt16LELength();
    } else {
      return WritableTrackingBuffer.getUInt32LELength() + WritableTrackingBuffer.getUInt32LELength();
    }
  },

  writeTypeInfo: function(buffer, parameter) {
    buffer.writeUInt8(this.id);
    if (parameter.length <= this.maximumLength) {
      buffer.writeUInt16LE(this.maximumLength);
    } else {
      buffer.writeUInt16LE(MAX);
    }
  },

  writeParameterData: function(buffer, parameter, options, cb) {
    if (parameter.value != null) {
      if (parameter.length <= this.maximumLength) {
        buffer.writeUsVarbyte(parameter.value);
      } else {
        buffer.writePLPBody(parameter.value);
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
    if (!Buffer.isBuffer(value)) {
      return new TypeError('Invalid buffer.');
    }
    return value;
  }
};
