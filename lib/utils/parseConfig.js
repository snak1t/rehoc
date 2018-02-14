'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _circullarErrors = require('./circullarErrors');

var _isEmpty = require('is-empty');

var _isEmpty2 = _interopRequireDefault(_isEmpty);

var _FormItem = require('../components/FormItem');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const updateDependenciesOfParsedConfig = (parsedConfig, baseField) => field => {
    if (parsedConfig[field] !== void 0) {
        return parsedConfig[field].addDependency(baseField);
    }
    parsedConfig[field] = _FormItem.FormItem.of().addDependency(baseField);
};

exports.default = config => {
    let parsedConfig = {};
    for (let key in config) {
        const form = _FormItem.FormItem.of(config[key]);
        const withFields = form.findObjectDependencies(config[key]);
        if (withFields.length !== 0) {
            withFields.forEach(updateDependenciesOfParsedConfig(parsedConfig, key));
        }
        parsedConfig[key] = form;
    }
    if (process.env.NODE_ENV !== 'production') {
        (0, _circullarErrors.findCircularDependency)(parsedConfig);
    }
    return parsedConfig;
};