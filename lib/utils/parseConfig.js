'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mergeConfigs = exports.parseConfig = exports.unflatten = undefined;

var _circullarErrors = require('./circullarErrors');

var _FormItem = require('../components/FormItem');

var _isEmpty = require('ramda/src/isEmpty');

var _isEmpty2 = _interopRequireDefault(_isEmpty);

var _mapObjIndexed = require('ramda/src/mapObjIndexed');

var _mapObjIndexed2 = _interopRequireDefault(_mapObjIndexed);

var _has = require('ramda/src/has');

var _has2 = _interopRequireDefault(_has);

var _path = require('ramda/src/path');

var _path2 = _interopRequireDefault(_path);

var _mapRecursively = require('./mapRecursively');

var _forEachRecuresively = require('./forEachRecuresively');

var _nested = require('./nested');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//#endregion

const updateDependenciesOfParsedConfig = (parsedConfig, baseField) => field => {
  const item = (0, _path2.default)(field.split('.'), parsedConfig);
  item.addDependency(baseField);
}; //#region Import statements
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

const _parseConfig = (0, _mapRecursively.mapRecursively)(item => {
  return !(item instanceof _nested.FormNestedGroup);
}, _FormItem.FormItem.of);

const parseConfig = exports.parseConfig = cfg => {
  const parsedConfig = _parseConfig(cfg);
  (0, _forEachRecuresively.forEachRecursively)(item => item instanceof _FormItem.FormItem, (item, key, compoundKey) => {
    const withFields = item.findObjectDependencies();
    if (withFields.length !== 0) {
      withFields.forEach(updateDependenciesOfParsedConfig(parsedConfig, compoundKey));
    }
  })(parsedConfig);
  return parsedConfig;
};

const mergeConfigs = exports.mergeConfigs = (targetConfig, previousConfig) => (0, _mapObjIndexed2.default)((configItem, key) => {
  return key in previousConfig ? configItem.concat(previousConfig) : configItem;
}, targetConfig);