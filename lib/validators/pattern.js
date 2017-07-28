"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (regExp) {
  var message = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "Provided value doesn't match pattern";
  return {
    rule: function rule(value) {
      return regExp.test(value);
    },
    message: message
  };
};