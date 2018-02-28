"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
class FormNestedGroup {
  constructor(object) {
    for (const key in object) {
      if (object.hasOwnProperty(key)) {
        this[key] = object[key];
        const element = object[key];
      }
    }
  }
}
exports.FormNestedGroup = FormNestedGroup;
const nested = exports.nested = obj => new FormNestedGroup(obj);