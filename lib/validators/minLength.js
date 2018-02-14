"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = (value, message = `Field length must be more than ${value} characters`) => ({ rule: field => field.length > value, message });