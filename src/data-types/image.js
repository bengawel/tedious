const WritableTrackingBuffer = require('../tracking-buffer/writable-tracking-buffer');

module.exports = {
  id: 0x22,
  type: 'IMAGE',
  name: 'Image',
  hasTableName: true,
  hasTextPointerAndTimestamp: true,
  dataLengthLength: 4,

  declaration: function() {
    return 'image';
  },

  resolveLength: function(parameter) {
    if (parameter.value != null) {
      return parameter.value.length;
    } else {
      return -1;
    }
  },

  getTypeInfoBufferLength: function(parameter) {
    return WritableTrackingBuffer.getUInt8Length() + WritableTrackingBuffer.getInt32LELength();
  },

  getParameterDataLength: function(parameter, options) {
    if (parameter.value != null) {
      return WritableTrackingBuffer.getInt32LELength() + WritableTrackingBuffer.getBufferLength(parameter.value);
    } else {
      return WritableTrackingBuffer.getInt32LELength();
    }
  },

  writeTypeInfo: function(buffer, parameter) {
    buffer.writeUInt8(this.id);
    buffer.writeInt32LE(parameter.length);
  },

  writeParameterData: function(buffer, parameter, options, cb) {
    if (parameter.value != null) {
      buffer.writeInt32LE(parameter.length);
      buffer.writeBuffer(parameter.value);
    } else {
      buffer.writeInt32LE(parameter.length);
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
