"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (value) {
  var message = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "Field length must be more than " + value + " characters";
  return { rule: function rule(field) {
      return field.length > value;
    }, message: message };
};