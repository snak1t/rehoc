//#region  Import Statements
import { Key } from '../components/keys';
import lensPath from 'ramda/src/lensPath';
import over from 'ramda/src/over';
import filter from 'ramda/src/filter';
import isEmpty from 'ramda/src/isEmpty';
import is from 'ramda/src/is';
import path from 'ramda/src/path';
import compose from 'ramda/src/compose';
import mapObjIndexed from 'ramda/src/mapObjIndexed';
import { mapRecursively } from './mapRecursively';
import { forEachRecursively } from './forEachRecuresively';
import { FormItem } from '../components/FormItem';
//#endregion

export const performValidation = ({ state, valueDescriptor }) => {
  const stateField = valueDescriptor.key.execute(state);
  if (stateField.shouldSkipValidation(valueDescriptor)) {
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

  const syncErrors = stateField.runSyncValidation(getOtherFields, valueDescriptor.value);

  const asyncErrors =
    syncErrors.length === 0 ? stateField.runAsyncValidation(getOtherFields, valueDescriptor.value) : [];

  return [syncErrors, asyncErrors];
};

export const mergeWithoutField = objWOValues => objWithValues =>
  mapRecursively(isFormItem, (element, _, key) => {
    const keyHelper = Key(key);
    const valueItem = keyHelper.execute(objWithValues);
    if (element === valueItem) {
      return element;
    }
    return valueItem.concat(element).concat({ value: keyHelper.append('value').execute(objWithValues) });
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

export const isFormItem = is(FormItem);

export const filterPromises = filter(is(Promise));

const updateValue = (path, value) => over(lensPath(path.value), x => x.concat({ value }));

export const updateConfig = (state, valueDescriptor) =>
  compose(mergeWithoutField(state), updateValue(valueDescriptor.key, valueDescriptor.value));
