import isEmpty from 'is-empty';
export const isDirty = (stateSlice, isTarget) => stateSlice.status.dirty || isTarget;
export const isValid = (stateSlice, value, errors, dirty) =>
    !(!stateSlice.required && isEmpty(value)) ? errors.length === 0 && dirty : true;

export const handleAsyncValidation = (v, otherValues) => value => {
    return new Promise((resolve, reject) =>
        v.rule(value, ...otherValues, test => (test ? resolve(value) : reject(v.multiple ? v.message : [v.message])))
    );
};

export const handleSyncValidation = (v, otherFields) => value =>
    v.rule(value, ...otherFields) ? Promise.resolve(value) : Promise.reject(v.multiple ? v.message : [v.message]);

const skipValidation = (field, isTarget, value, validators) =>
    (field.status.dirty === false && !isTarget) || (!field.required && isEmpty(value)) || validators === void 0;

export const performValidation = (state, key, value, validators, isTarget) => {
    const checkValidator = v => {
        const otherFields = v.withFields ? v.withFields.map(k => state[k].value) : [];
        return v.async ? handleAsyncValidation(v, otherFields) : handleSyncValidation(v, otherFields);
    };

    return skipValidation(state[key], isTarget, value, validators)
        ? Promise.resolve([])
        : Promise.all(validators.map(checkValidator).map(v => v(value)))
              .then(() => [])
              .catch(errors => errors);
    // validators
    //       .reduce((monad, v) => monad.then(checkValidator(v)), Promise.resolve(value))
    //       .then(() => [])
    //       .catch(errors => errors);
};

export const mergeWithoudField = (objWithValues, objWOValues) => {
    const resultedObject = {};
    for (const key of Object.keys(objWOValues)) {
        resultedObject[key] = {
            ...objWithValues[key],
            ...objWOValues[key],
            value: objWithValues[key].value
        };
    }
    return resultedObject;
};

export const mergeFieldsWithHandlers = (state, handlers) => {
    let valid = true;
    let values = {};
    for (let [key, value] of Object.entries(state)) {
        if (!value.status.valid) {
            valid = false;
        }
        values[key] = {
            ...value,
            handler: handlers[key]
        };
    }
    return [values, valid];
};
