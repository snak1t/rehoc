'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _circullarErrors = require('./circullarErrors');

var _isEmpty = require('is-empty');

var _isEmpty2 = _interopRequireDefault(_isEmpty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

    var isRequiredField = config[i].required === void 0 ? true : config[i].required;

    var value = config[i].initialValue;

    var baseRules = {
      value: value !== void 0 ? value : '',
      status: {
        dirty: false,
        valid: !isRequiredField && (0, _isEmpty2.default)(value)
      },
      required: isRequiredField,
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