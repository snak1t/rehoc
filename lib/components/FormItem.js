'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FormItem = undefined;

var _isEmpty = require('is-empty');

var _isEmpty2 = _interopRequireDefault(_isEmpty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class FormItem {
    constructor(config) {
        this.dependency = [];
    }

    static of(config) {
        if (config === void 0) {
            return new FormItem();
        }
        return new FormItem().setConfig(config);
    }

    setConfig(config) {
        this.required = config.required === void 0 ? true : config.required;
        this.value = config.initialValue !== void 0 ? config.initialValue : '';
        this.status = {
            dirty: false,
            valid: !this.required && (0, _isEmpty2.default)(this.initialValue)
        };
        this.errors = [];
        [this.validators, this.asyncValidators] = this.setValidators(config.validators);
        return this;
    }

    findObjectDependencies({ validators }) {
        return validators.reduce((dependencies, validator) => validator.withFields === void 0 ? dependencies : [...dependencies, ...validator.withFields], []);
    }

    addDependency(dependency) {
        this.dependency = [...this.dependency, dependency];
    }

    setValidators(validators) {
        const asyncValidators = [];
        const syncValidators = [];
        for (let index = 0; index < validators.length; index++) {
            const element = validators[index];
            (element.async === true ? asyncValidators : syncValidators).push(element);
        }
        return [syncValidators, asyncValidators];
    }
}
exports.FormItem = FormItem;