const WritableTrackingBuffer = require('../tracking-buffer/writable-tracking-buffer');

module.exports = {
  id: 0xF3,
  type: 'TVPTYPE',
  name: 'TVP',

  declaration: function(parameter) {
    return parameter.value.name + ' readonly';
  },

  getParameterDataBufferLength: function(buffer, parameter, options) {
    if (parameter.value === null) {
      return buffer.getUInt16LELength() + buffer.getUInt8Length() + buffer.getUInt8Length();
    }
    let length = 0;
    length += buffer.getUInt16LELength();
    const ref = parameter.value.columns;
    for (let i = 0, len = ref.length; i < len; i++) {
      const column = ref[i];
      length += buffer.getUInt32LELength();
      length += buffer.getUInt16LELength();
      length += column.type.getTypeInfoBufferLength(buffer, column);
      length += buffer.getBVarcharLength('');
    }

    length += buffer.getUInt8Length();

    const ref1 = parameter.value.rows;
    for (let j = 0, len1 = ref1.length; j < len1; j++) {
      const row = ref1[j];

      length += buffer.getUInt8Length();

      for (let k = 0, len2 = row.length; k < len2; k++) {
        const value = row[k];
        const param = {
          value: value,
          length: parameter.value.columns[k].length,
          scale: parameter.value.columns[k].scale,
          precision: parameter.value.columns[k].precision
        };
        length += parameter.value.columns[k].type.getParameterDataBufferLength(param, options);
      }
    }

    length += buffer.getUInt8Length();

    return length;
  },

  getTypeInfoBufferLength: function(buffer, parameter) {
    let ref, ref1, ref2, ref3;
    return buffer.getUInt8Length() +
      buffer.getBVarCharLength('') +
      buffer.getBVarCharLength((ref = (ref1 = parameter.value) != null ? ref1.schema : undefined) != null ? ref : '') +
      buffer.getBVarCharLength((ref2 = (ref3 = parameter.value) != null ? ref3.name : undefined) != null ? ref2 : '');
  },

  writeTypeInfo: function(buffer, parameter) {
    let ref, ref1, ref2, ref3;
    buffer.writeUInt8(this.id);
    buffer.writeBVarchar('');
    buffer.writeBVarchar((ref = (ref1 = parameter.value) != null ? ref1.schema : undefined) != null ? ref : '');
    buffer.writeBVarchar((ref2 = (ref3 = parameter.value) != null ? ref3.name : undefined) != null ? ref2 : '');
  },

  writeParameterData: function(buffer, parameter, options, cb) {
    if (parameter.value == null) {
      buffer.writeUInt16LE(0xFFFF);
      buffer.writeUInt8(0x00);
      buffer.writeUInt8(0x00);
      return;
    }

    const requiredLength = this.getParameterDataBufferLength(buffer, parameter, options);

    const tempBuffer = new WritableTrackingBuffer(requiredLength);

    tempBuffer.writeUInt16LE(parameter.value.columns.length);

    const ref = parameter.value.columns;
    for (let i = 0, len = ref.length; i < len; i++) {
      const column = ref[i];
      tempBuffer.writeUInt32LE(0x00000000);
      tempBuffer.writeUInt16LE(0x0000);
      column.type.writeTypeInfo(tempBuffer, column);
      tempBuffer.writeBVarchar('');
    }

    tempBuffer.writeUInt8(0x00);

    const ref1 = parameter.value.rows;
    for (let j = 0, len1 = ref1.length; j < len1; j++) {
      const row = ref1[j];

      tempBuffer.writeUInt8(0x01);

      for (let k = 0, len2 = row.length; k < len2; k++) {
        const value = row[k];
        const param = {
          value: value,
          length: parameter.value.columns[k].length,
          scale: parameter.value.columns[k].scale,
          precision: parameter.value.columns[k].precision
        };
        parameter.value.columns[k].type.writeParameterData(tempBuffer, param, options);
      }
    }

    tempBuffer.writeUInt8(0x00);

    buffer.writeBuffer(tempBuffer);
  },
  validate: function(value) {
    if (value == null) {
      return null;
    }

    if (typeof value !== 'object') {
      return new TypeError('Invalid table.');
    }

    if (!Array.isArray(value.columns)) {
      return new TypeError('Invalid table.');
    }

    if (!Array.isArray(value.rows)) {
      return new TypeError('Invalid table.');
    }

    return value;
  }
};
