'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Key = undefined;

var _path = require('ramda/src/path');

var _path2 = _interopRequireDefault(_path);

var _split = require('ramda/src/split');

var _split2 = _interopRequireDefault(_split);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class KeyHelper {
  constructor(key) {
    this.key = key;
  }

  static of(key) {
    return new KeyHelper(key);
  }

  prepend(part) {
    const key = part + '.' + this.key;
    return KeyHelper.of(key);
  }

  append(part) {
    const key = this.key + '.' + part;
    return KeyHelper.of(key);
  }

  execute(object) {
    return (0, _path2.default)((0, _split2.default)('.', this.key), object);
  }

  get value() {
    return (0, _split2.default)('.', this.key);
  }
}

const Key = exports.Key = k => new KeyHelper(k);