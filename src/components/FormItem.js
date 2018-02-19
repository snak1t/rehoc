import isEmpty from 'is-empty';

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

    setConfig(config) {
        this.required = config.required === void 0 ? true : config.required;
        this.value = config.initialValue !== void 0 ? config.initialValue : '';
        this.status = {
            dirty: false,
            valid: !this.required && isEmpty(this.initialValue)
        };
        this.errors = [];
        [this.validators, this.asyncValidators] = this.setValidators(config.validators);
        return this;
    }

    findObjectDependencies({ validators }) {
        return validators.reduce(
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
        for (let index = 0; index < validators.length; index++) {
            const element = validators[index];
            (element.async === true ? asyncValidators : syncValidators).push(element);
        }
        return [syncValidators, asyncValidators];
    }
}
