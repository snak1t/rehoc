'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'Field is required';
  return {
    rule: function rule(value) {
      return value.trim() !== '';
    },
    message: message
  };
};