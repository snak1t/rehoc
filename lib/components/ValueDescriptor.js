'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.key = exports.of = undefined;

var _pathOr = require('ramda/src/pathOr');

var _pathOr2 = _interopRequireDefault(_pathOr);

var _keys = require('./keys');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const getRawOrEventValue = value => (0, _pathOr2.default)(value, ['target', 'value'], value);

const of = exports.of = ({ value, isTarget, key }) => ({
  value: getRawOrEventValue(value),
  isTarget,
  key: (0, _keys.Key)(key)
});

const key = exports.key = vd => vd.key.value;