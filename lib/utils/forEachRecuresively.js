'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.forEachRecursively = undefined;

var _forEachObjIndexed = require('ramda/src/forEachObjIndexed');

var _forEachObjIndexed2 = _interopRequireDefault(_forEachObjIndexed);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const forEachRecursively = exports.forEachRecursively = (condition, forEachCb) => function forEachRecur(object, previousKey = '') {
  (0, _forEachObjIndexed2.default)((item, key) => {
    const compoundKey = previousKey === '' ? key : `${previousKey}.${key}`;
    return condition(item, key) ? forEachCb(item, key, compoundKey) : forEachRecur(item, compoundKey);
  }, object);
};