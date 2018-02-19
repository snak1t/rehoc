'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.parseConfig = exports.unflatten = exports.flatten = undefined;

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

const _flatten = (cfg, key) => {
    let fcfg = {};
    let rKey = key === '' ? key : key + '.';

    for (let i in cfg) {
        if (cfg[i].__nested !== true) {
            if (i !== '__nested') {
                fcfg[rKey + i] = cfg[i];
            }
        } else {
            Object.assign(fcfg, _flatten(cfg[i], rKey + i));
        }
    }

    return fcfg;
};

const flatten = exports.flatten = cfg => {
    return _flatten(cfg, '');
};

const unflatten = exports.unflatten = cfg => {
    const pcfg = {};
    Object.entries(cfg).forEach(([key, value]) => {
        const parsedKey = key.split('.');
        let currentF = pcfg;
        while (parsedKey.length !== 1) {
            const k = parsedKey.shift();
            if (pcfg[k] === void 0) {
                pcfg[k] = {};
            }
            currentF = pcfg[k];
        }
        currentF[parsedKey[0]] = value;
    });
    return pcfg;
};

const parseConfig = exports.parseConfig = cfg => {
    const config = flatten(cfg);
    let parsedConfig = {};
    for (let key in config) {
        const form = _FormItem.FormItem.of(config[key]);
        parsedConfig[key] = form;
    }
    Object.entries(parsedConfig).map(([key, value]) => {
        const withFields = value.findObjectDependencies();
        if (withFields.length !== 0) {
            withFields.forEach(updateDependenciesOfParsedConfig(parsedConfig, key));
        }
    });
    if (process.env.NODE_ENV !== 'production') {
        (0, _circullarErrors.findCircularDependency)(parsedConfig);
    }
    return parsedConfig;
};