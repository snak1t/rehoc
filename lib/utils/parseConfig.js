'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _circullarErrors = require('./circullarErrors');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var findObjectDependencies = function findObjectDependencies(obj) {
  return obj.validators.reduce(function (deps, item) {
    return item.withFields === void 0 ? deps : [].concat(_toConsumableArray(deps), _toConsumableArray(item.withFields));
  }, []);
};

var concatDependencies = function concatDependencies(item, field) {
  return {
    dependency: !field || typeof field.dependency === 'undefined' ? [item] : [].concat(_toConsumableArray(field.dependency), [item])
  };
};

exports.default = function (config) {
  var parsedConfig = {};

  var _loop = function _loop(i) {
    var withFields = findObjectDependencies(config[i]);
    if (withFields.length !== 0) {
      withFields.forEach(function (field) {
        return parsedConfig[field] = Object.assign({}, parsedConfig[field], concatDependencies(i, parsedConfig[field]));
      });
    }

    var baseRules = {
      value: config[i].initialValue || '',
      status: { dirty: false, valid: false },
      errors: []
    };

    parsedConfig[i] = Object.assign({}, parsedConfig[i], baseRules);
  };

  for (var i in config) {
    _loop(i);
  }
  if (process.env.NODE_ENV !== 'production') {
    (0, _circullarErrors.findCircularDependency)(parsedConfig);
  }
  return parsedConfig;
};