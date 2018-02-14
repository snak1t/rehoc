'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.mergeFieldsWithHandlers = exports.mergeWithoudField = exports.performValidation = exports.handleSyncValidation = exports.handleAsyncValidation = exports.isValid = exports.isDirty = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _isEmpty = require('is-empty');

var _isEmpty2 = _interopRequireDefault(_isEmpty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const isDirty = exports.isDirty = (stateSlice, isTarget) => stateSlice.status.dirty || isTarget;
const isValid = exports.isValid = (stateSlice, value, errors, dirty) => !(!stateSlice.required && (0, _isEmpty2.default)(value)) ? errors.length === 0 && dirty : true;

const handleAsyncValidation = exports.handleAsyncValidation = (v, otherValues) => value => {
    return new Promise((resolve, reject) => v.rule(value, ...otherValues, test => test ? resolve(value) : reject(v.multiple ? v.message : [v.message])));
};

const handleSyncValidation = exports.handleSyncValidation = (v, otherFields) => value => v.rule(value, ...otherFields) ? Promise.resolve(value) : Promise.reject(v.multiple ? v.message : [v.message]);

const skipValidation = (field, isTarget, value, validators) => field.status.dirty === false && !isTarget || !field.required && (0, _isEmpty2.default)(value) || validators === void 0;

const performValidation = exports.performValidation = (state, key, value, validators, isTarget) => {
    const checkValidator = v => {
        const otherFields = v.withFields ? v.withFields.map(k => state[k].value) : [];
        return v.async ? handleAsyncValidation(v, otherFields) : handleSyncValidation(v, otherFields);
    };

    return skipValidation(state[key], isTarget, value, validators) ? Promise.resolve([]) : Promise.all(validators.map(checkValidator).map(v => v(value))).then(() => []).catch(errors => errors);
    // validators
    //       .reduce((monad, v) => monad.then(checkValidator(v)), Promise.resolve(value))
    //       .then(() => [])
    //       .catch(errors => errors);
};

const mergeWithoudField = exports.mergeWithoudField = (objWithValues, objWOValues) => {
    const resultedObject = {};
    for (const key of Object.keys(objWOValues)) {
        resultedObject[key] = _extends({}, objWithValues[key], objWOValues[key], {
            value: objWithValues[key].value
        });
    }
    return resultedObject;
};

const mergeFieldsWithHandlers = exports.mergeFieldsWithHandlers = (state, handlers) => {
    let valid = true;
    let values = {};
    for (let [key, value] of Object.entries(state)) {
        if (!value.status.valid) {
            valid = false;
        }
        values[key] = _extends({}, value, {
            handler: handlers[key]
        });
    }
    return [values, valid];
};