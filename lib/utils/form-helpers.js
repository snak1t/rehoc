'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateValue = exports.filterPromises = exports.isFormValid = exports.mergeWithoutField = exports.performValidation = exports.handleAsyncValidation = exports.isValid = exports.isDirty = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; //#region  Import Statements


var _lensPath = require('ramda/src/lensPath');

var _lensPath2 = _interopRequireDefault(_lensPath);

var _set = require('ramda/src/set');

var _set2 = _interopRequireDefault(_set);

var _filter = require('ramda/src/filter');

var _filter2 = _interopRequireDefault(_filter);

var _isEmpty = require('ramda/src/isEmpty');

var _isEmpty2 = _interopRequireDefault(_isEmpty);

var _mapObjIndexed = require('ramda/src/mapObjIndexed');

var _mapObjIndexed2 = _interopRequireDefault(_mapObjIndexed);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//#endregion

const isDirty = exports.isDirty = (stateSlice, isTarget) => stateSlice.status.dirty || isTarget;
const isValid = exports.isValid = (stateSlice, value, errors, dirty) => !(!stateSlice.required && (0, _isEmpty2.default)(value)) ? errors.length === 0 && dirty : true;

const handleAsyncValidation = exports.handleAsyncValidation = (v, otherValues) => value => {
  return new Promise((resolve, reject) => v.rule(value, ...otherValues, test => test ? resolve(value) : reject(v.multiple ? v.message : [v.message])));
};

const handleSyncValidation = (v, otherFields) => ([value, errors]) => {
  const result = v.rule(value, ...otherFields);
  return [value, result ? errors : [...errors, v.message]];
};

const skipValidation = (field, isTarget, value) => field.status.dirty === false && !isTarget || !field.required && (0, _isEmpty2.default)(value) || [...field.validators, ...field.asyncValidators].length === 0;

const performValidation = exports.performValidation = ({ state, valueDescriptor }) => {
  const stateField = state[valueDescriptor.key];
  if (skipValidation(stateField, valueDescriptor.isTarget, valueDescriptor.value)) {
    return [[], []];
  }

  const getOtherFields = v => {
    return v.withFields ? v.withFields.map(k => state[k].value) : [];
  };

  const checkValidator = v => {
    return (v.async ? handleAsyncValidation : handleSyncValidation)(v, getOtherFields(v));
  };

  const [, errors] = stateField.validators.map(checkValidator).reduce((acc, validator) => validator(acc), [valueDescriptor.value, []]);

  const promise = stateField.asyncValidators.length !== 0 && errors.length === 0 ? stateField.asyncValidators.map(checkValidator).map(v => v(valueDescriptor.value)) : [];

  return [errors, promise];
};

const mergeWithoutField = exports.mergeWithoutField = (objWithValues, objWOValues) => (0, _mapObjIndexed2.default)((element, key) => _extends({}, objWithValues[key], element, {
  value: objWithValues[key].value
}), objWOValues);

const isFormValid = exports.isFormValid = formState => {
  for (const key in formState) {
    if (formState.hasOwnProperty(key)) {
      const element = formState[key];
      if (!element.status.valid) {
        return false;
      }
    }
  }
  return true;
};

const filterPromises = exports.filterPromises = (0, _filter2.default)(p => p instanceof Promise);

const updateValue = exports.updateValue = (path, value) => (0, _set2.default)((0, _lensPath2.default)(path), value);