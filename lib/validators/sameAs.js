'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (fields) {
  var message = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Fields are not equal';
  return {
    rule: function rule(value) {
      for (var _len = arguments.length, otherFields = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        otherFields[_key - 1] = arguments[_key];
      }

      return otherFields.every(function (f) {
        return f === value;
      });
    },
    message: message,
    withFields: fields
  };
};