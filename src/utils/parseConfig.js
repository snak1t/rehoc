//#region Import statements
import { findCircularDependency } from './circullarErrors';
import { FormItem } from '../components/FormItem';
import isEmpty from 'ramda/src/isEmpty';
import mapObjIndexed from 'ramda/src/mapObjIndexed';
import has from 'ramda/src/has';
import path from 'ramda/src/path';
import curryN from 'ramda/src/curryN';
import { mapRecursively } from './mapRecursively';
import { forEachRecursively } from './forEachRecuresively';
import { FormNestedGroup } from './nested';
import { Key } from '../components/keys';
//#endregion

const updateDependenciesOfParsedConfig = (parsedConfig, baseField) => field => {
  const item = Key(field).execute(parsedConfig);
  item.addDependency(baseField);
};

const _parseConfig = mapRecursively(item => {
  return !(item instanceof FormNestedGroup);
}, FormItem.of);

export const parseConfig = cfg => {
  const parsedConfig = _parseConfig(cfg);
  forEachRecursively(
    item => item instanceof FormItem,
    (item, key, compoundKey) => {
      const withFields = item.findObjectDependencies();
      if (withFields.length !== 0) {
        withFields.forEach(updateDependenciesOfParsedConfig(parsedConfig, compoundKey));
      }
    }
  )(parsedConfig);
  return parsedConfig;
};

export const mergeConfigs = curryN(2, (targetConfig, previousConfig) =>
  mapObjIndexed((configItem, key) => {
    return key in previousConfig ? configItem.concat(previousConfig) : configItem;
  }, targetConfig)
);
