'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _circullarErrors = require('./circullarErrors');

var _isEmpty = require('is-empty');

var _isEmpty2 = _interopRequireDefault(_isEmpty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const findObjectDependencies = obj => obj.validators.reduce((deps, item) => item.withFields === void 0 ? deps : [...deps, ...item.withFields], []);

const concatDependencies = (item, field) => ({
  dependency: !field || typeof field.dependency === 'undefined' ? [item] : [...field.dependency, item]
});

exports.default = config => {
  let parsedConfig = {};
  for (let i in config) {
    let withFields = findObjectDependencies(config[i]);
    if (withFields.length !== 0) {
      withFields.forEach(field => parsedConfig[field] = Object.assign({}, parsedConfig[field], concatDependencies(i, parsedConfig[field])));
    }

    const isRequiredField = config[i].required === void 0 ? true : config[i].required;

    const value = config[i].initialValue;

    const baseRules = {
      value: value !== void 0 ? value : '',
      status: {
        dirty: false,
        valid: !isRequiredField && (0, _isEmpty2.default)(value)
      },
      required: isRequiredField,
      errors: []
    };

    parsedConfig[i] = Object.assign({}, parsedConfig[i], baseRules);
  }
  if (process.env.NODE_ENV !== 'production') {
    (0, _circullarErrors.findCircularDependency)(parsedConfig);
  }
  return parsedConfig;
};