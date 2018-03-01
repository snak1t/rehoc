'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateConfig = exports.filterPromises = exports.isFormItem = exports.isFormValid = exports.mergeWithoutField = exports.performValidation = undefined;

var _keys = require('../components/keys');

var _lensPath = require('ramda/src/lensPath');

var _lensPath2 = _interopRequireDefault(_lensPath);

var _over = require('ramda/src/over');

var _over2 = _interopRequireDefault(_over);

var _filter = require('ramda/src/filter');

var _filter2 = _interopRequireDefault(_filter);

var _isEmpty = require('ramda/src/isEmpty');

var _isEmpty2 = _interopRequireDefault(_isEmpty);

var _is = require('ramda/src/is');

var _is2 = _interopRequireDefault(_is);

var _path = require('ramda/src/path');

var _path2 = _interopRequireDefault(_path);

var _compose = require('ramda/src/compose');

var _compose2 = _interopRequireDefault(_compose);

var _mapObjIndexed = require('ramda/src/mapObjIndexed');

var _mapObjIndexed2 = _interopRequireDefault(_mapObjIndexed);

var _mapRecursively = require('./mapRecursively');

var _forEachRecuresively = require('./forEachRecuresively');

var _FormItem = require('../components/FormItem');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//#endregion

//#region  Import Statements
const performValidation = exports.performValidation = ({ state, valueDescriptor }) => {
  const stateField = valueDescriptor.key.execute(state);
  if (stateField.shouldSkipValidation(valueDescriptor)) {
    return [[], []];
  }

  const getOtherFields = v => {
    return v.withFields ? v.withFields.map(k => (0, _keys.Key)(k).append('value').execute(state)) : [];
  };

  const syncErrors = stateField.runSyncValidation(getOtherFields, valueDescriptor.value);

  const asyncErrors = syncErrors.length === 0 ? stateField.runAsyncValidation(getOtherFields, valueDescriptor.value) : [];

  return [syncErrors, asyncErrors];
};

const mergeWithoutField = exports.mergeWithoutField = objWOValues => objWithValues => (0, _mapRecursively.mapRecursively)(isFormItem, (element, _, key) => {
  const keyHelper = (0, _keys.Key)(key);
  const valueItem = keyHelper.execute(objWithValues);
  if (element === valueItem) {
    return element;
  }
  return valueItem.concat(element).concat({ value: keyHelper.append('value').execute(objWithValues) });
})(objWOValues);

const isFormValid = exports.isFormValid = formState => {
  let valid = true;
  (0, _forEachRecuresively.forEachRecursively)(isFormItem, value => {
    if (!value.status.valid) {
      valid = false;
    }
  })(formState);
  return valid;
};

const isFormItem = exports.isFormItem = (0, _is2.default)(_FormItem.FormItem);

const filterPromises = exports.filterPromises = (0, _filter2.default)((0, _is2.default)(Promise));

const updateValue = (path, value) => (0, _over2.default)((0, _lensPath2.default)(path.value), x => x.concat({ value }));

const updateConfig = exports.updateConfig = (state, valueDescriptor) => (0, _compose2.default)(mergeWithoutField(state), updateValue(valueDescriptor.key, valueDescriptor.value));