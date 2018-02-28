import isEmpty from 'ramda/src/isEmpty';

export class FormItem {
  constructor(config) {
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
      valid: !this.required && isEmpty(this.value)
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
    return [...this.validators, ...this.asyncValidators].reduce(
      (dependencies, validator) =>
        validator.withFields === void 0 ? dependencies : [...dependencies, ...validator.withFields],
      []
    );
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
}
