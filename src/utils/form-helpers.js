import isEmpty from 'is-empty';
export const isDirty = (stateSlice, isTarget) => stateSlice.status.dirty || isTarget;
export const isValid = (stateSlice, value, errors, dirty) =>
    !(!stateSlice.required && isEmpty(value)) ? errors.length === 0 && dirty : true;

export const handleAsyncValidation = (v, otherValues) => value => {
    return new Promise((resolve, reject) =>
        v.rule(value, ...otherValues, test => (test ? resolve(value) : reject(v.multiple ? v.message : [v.message])))
    );
};

const handleSyncValidation = (v, otherFields) => ([value, errors]) => {
    const result = v.rule(value, ...otherFields);
    return [value, result ? errors : [...errors, v.message]];
};

const skipValidation = (field, isTarget, value, validators) =>
    (field.status.dirty === false && !isTarget) || (!field.required && isEmpty(value)) || validators === void 0;

export const performValidation = (state, key, value, validators, isTarget) => {
    if (skipValidation(state[key], isTarget, value, validators)) {
        return [[], []];
    }

    const getOtherFields = v => {
        return v.withFields ? v.withFields.map(k => state[k].value) : [];
    };

    const checkValidator = v => {
        return (v.async ? handleAsyncValidation : handleSyncValidation)(v, getOtherFields(v));
    };

    const [, errors] = state[key].validators
        .map(checkValidator)
        .reduce((acc, validator) => validator(acc), [value, []]);

    const promise =
        state[key].asyncValidators.length !== 0 && errors.length === 0
            ? state[key].asyncValidators.map(checkValidator).map(v => v(value))
            : [];

    return [errors, promise];
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
