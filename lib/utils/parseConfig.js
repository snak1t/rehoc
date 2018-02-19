'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.mergeConfigs = exports.parseConfig = exports.unflatten = exports.flatten = undefined;

var _circullarErrors = require('./circullarErrors');

var _FormItem = require('../components/FormItem');

var _isEmpty = require('ramda/src/isEmpty');

var _isEmpty2 = _interopRequireDefault(_isEmpty);

var _mapObjIndexed = require('ramda/src/mapObjIndexed');

var _mapObjIndexed2 = _interopRequireDefault(_mapObjIndexed);

var _forEachObjIndexed = require('ramda/src/forEachObjIndexed');

var _forEachObjIndexed2 = _interopRequireDefault(_forEachObjIndexed);

var _compose = require('ramda/src/compose');

var _compose2 = _interopRequireDefault(_compose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//#endregion

//#region Import statements
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

const _parseConfig = (0, _compose2.default)((0, _mapObjIndexed2.default)(value => _FormItem.FormItem.of(value)), flatten);

const parseConfig = exports.parseConfig = cfg => {
    const parsedConfig = _parseConfig(cfg);
    (0, _forEachObjIndexed2.default)((value, key, object) => {
        const withFields = value.findObjectDependencies();
        if (withFields.length !== 0) {
            withFields.forEach(updateDependenciesOfParsedConfig(object, key));
        }
    }, parsedConfig);
    if (process.env.NODE_ENV !== 'production') {
        (0, _circullarErrors.findCircularDependency)(parsedConfig);
    }
    return parsedConfig;
};

const mergeConfigs = exports.mergeConfigs = (targetConfig, previousConfig) => (0, _mapObjIndexed2.default)((configItem, key) => {
    return key in previousConfig ? configItem.concat(previousConfig) : configItem;
}, targetConfig);