"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = (regExp, message = "Provided value doesn't match pattern") => ({
  rule: value => regExp.test(value),
  message
});