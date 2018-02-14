'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
const mapObject = exports.mapObject = (object, cb) => {
  if (typeof object !== 'object') {
    throw new Error('Must be object');
  }

  let returnObject = {};
  for (let key in object) {
    returnObject[key] = cb(object[key], key, object);
  }

  return returnObject;
};