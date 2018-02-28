//#region  Import Statements
import { Key } from '../components/keys';
import lensPath from 'ramda/src/lensPath';
import set from 'ramda/src/set';
import filter from 'ramda/src/filter';
import isEmpty from 'ramda/src/isEmpty';
import has from 'ramda/src/has';
import path from 'ramda/src/path';
import mapObjIndexed from 'ramda/src/mapObjIndexed';
import { mapRecursively } from './mapRecursively';
import { forEachRecursively } from './forEachRecuresively';
//#endregion

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

const skipValidation = (field, isTarget, value) =>
  (field.status.dirty === false && !isTarget) ||
  (!field.required && isEmpty(value)) ||
  [...field.validators, ...field.asyncValidators].length === 0;

export const performValidation = ({ state, valueDescriptor }) => {
  const stateField = valueDescriptor.key.execute(state);
  if (skipValidation(stateField, valueDescriptor.isTarget, valueDescriptor.value)) {
    return [[], []];
  }

  const getOtherFields = v => {
    return v.withFields
      ? v.withFields.map(k =>
          Key(k)
            .append('value')
            .execute(state)
        )
      : [];
  };

  const checkValidator = v => {
    return (v.async ? handleAsyncValidation : handleSyncValidation)(v, getOtherFields(v));
  };

  const [, errors] = stateField.validators
    .map(checkValidator)
    .reduce((acc, validator) => validator(acc), [valueDescriptor.value, []]);

  const promise =
    stateField.asyncValidators.length !== 0 && errors.length === 0
      ? stateField.asyncValidators.map(checkValidator).map(v => v(valueDescriptor.value))
      : [];

  return [errors, promise];
};

export const mergeWithoutField = (objWithValues, objWOValues) =>
  mapRecursively(has('value'), (element, _, key) => {
    const keyHelper = Key(key);
    const valueItem = keyHelper.execute(objWithValues);
    if (element === valueItem) {
      return element;
    }
    return {
      ...valueItem,
      ...element,
      value: keyHelper.append('value').execute(objWithValues)
    };
  })(objWOValues);

export const isFormValid = formState => {
  let valid = true;
  forEachRecursively(isFormItem, value => {
    if (!value.status.valid) {
      valid = false;
    }
  })(formState);
  return valid;
};

export const isFormItem = has('value');

export const filterPromises = filter(p => p instanceof Promise);

export const updateValue = (path, value) => set(lensPath(path), value);
