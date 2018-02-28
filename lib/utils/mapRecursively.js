'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mapRecursively = undefined;

var _mapObjIndexed = require('ramda/src/mapObjIndexed');

var _mapObjIndexed2 = _interopRequireDefault(_mapObjIndexed);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const mapRecursively = exports.mapRecursively = (condition, mapCb) => object => {
  function _mr(object, previousKey = '') {
    let isUpdated = false;
    const mappedObject = (0, _mapObjIndexed2.default)((item, key) => {
      const compoundKey = previousKey === '' ? key : `${previousKey}.${key}`;
      if (condition(item, key)) {
        const mappedItem = mapCb(item, key, compoundKey);
        if (!isUpdated && mappedItem !== item) {
          isUpdated = true;
        }
        return mappedItem;
      }
      const [mapped, _isUpdated] = _mr(item, compoundKey);
      return _isUpdated ? mapped : item;
    }, object);
    return [mappedObject, isUpdated];
  }

  const [m] = _mr(object);
  return m;
};