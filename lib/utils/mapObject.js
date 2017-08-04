'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var mapObject = exports.mapObject = function mapObject(object, cb) {
  if ((typeof object === 'undefined' ? 'undefined' : _typeof(object)) !== 'object') {
    throw new Error('Must be object');
  }

  var returnObject = {};
  for (var _key in object) {
    returnObject[_key] = cb(object[_key], _key, object);
  }

  return returnObject;
};