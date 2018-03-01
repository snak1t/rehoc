'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FormItem = undefined;

var _isEmpty = require('ramda/src/isEmpty');

var _isEmpty2 = _interopRequireDefault(_isEmpty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class FormItem {
  constructor(config) {
    this.handleSyncValidation = (validator, otherFields) => ([value, errors]) => {
      const result = validator.rule(value, ...otherFields);
      return [value, result ? errors : [...errors, validator.message]];
    };

    this.handleAsyncValidation = (validator, otherValues) => value => {
      return new Promise((resolve, reject) => validator.rule(value, ...otherValues, test => test ? resolve(value) : reject(validator.multiple ? validator.message : [validator.message])));
    };

    this.dependency = [];
  }

  static of(config) {
    if (config === void 0) {
      return new FormItem();
    }
    return new FormItem().setConfig(config);
  }

  setHandler(handler) {
    this.handler = handler;
    return this;
  }

  setConfig(config) {
    this.required = config.required === void 0 ? true : config.required;
    this.value = config.initialValue !== void 0 ? config.initialValue : '';
    this.status = {
      dirty: false,
      valid: !this.required && (0, _isEmpty2.default)(this.value)
    };
    this.errors = [];
    [this.validators, this.asyncValidators] = this.setValidators(config.validators);
    return this;
  }

  concat(formItem) {
    const clone = this.clone();
    for (const key in formItem) {
      if (formItem.hasOwnProperty(key)) {
        clone[key] = formItem[key];
      }
    }
    return clone;
  }

  clone() {
    const nFI = new FormItem();
    nFI.required = this.required;
    nFI.value = this.value;
    nFI.status = this.status;
    nFI.errors = this.errors;
    nFI.validators = this.validators;
    nFI.asyncValidators = this.asyncValidators;
    nFI.handler = this.handler;
    nFI.dependency = this.dependency;
    return nFI;
  }

  findObjectDependencies() {
    return [...this.validators, ...this.asyncValidators].reduce((dependencies, validator) => validator.withFields === void 0 ? dependencies : [...dependencies, ...validator.withFields], []);
  }

  addDependency(dependency) {
    this.dependency = [...this.dependency, dependency];
  }

  setValidators(validators) {
    const asyncValidators = [];
    const syncValidators = [];
    if (validators !== void 0) {
      for (let index = 0; index < validators.length; index++) {
        const element = validators[index];
        (element.async === true ? asyncValidators : syncValidators).push(element);
      }
    }
    return [syncValidators, asyncValidators];
  }

  shouldSkipValidation(valueDescriptor) {
    const { isTarget, value } = valueDescriptor;
    return this.status.dirty === false && !isTarget || !this.required && (0, _isEmpty2.default)(value) || [...this.validators, ...this.asyncValidators].length === 0;
  }

  runSyncValidation(getOtherFields, value) {
    const [, errors] = this.validators.map(v => this.handleSyncValidation(v, getOtherFields(v))).reduce((acc, validator) => validator(acc), [value, []]);
    return errors;
  }

  runAsyncValidation(getOtherFields, value) {
    const promisesList = this.asyncValidators.length !== 0 ? this.asyncValidators.map(v => this.handleAsyncValidation(v, getOtherFields(v))).map(v => v(value)) : [];
    return promisesList;
  }

  isDirty(isTarget) {
    return this.status.dirty || isTarget;
  }

  isValid(value, errors, dirty) {
    return !(!this.required && (0, _isEmpty2.default)(value)) ? errors.length === 0 && dirty : true;
  }

  setErrorsAndStatus(valueDescriptor, errors) {
    const dirty = this.isDirty(valueDescriptor.isTarget);
    const valid = this.isValid(valueDescriptor.value, errors, dirty);
    const status = { dirty, valid };
    return this.concat({ errors, value: valueDescriptor.value, status });
  }
}
exports.FormItem = FormItem;