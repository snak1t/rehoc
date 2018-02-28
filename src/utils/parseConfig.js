//#region Import statements
import { findCircularDependency } from './circullarErrors';
import { FormItem } from '../components/FormItem';
import isEmpty from 'ramda/src/isEmpty';
import mapObjIndexed from 'ramda/src/mapObjIndexed';
import has from 'ramda/src/has';
import path from 'ramda/src/path';
import { mapRecursively } from './mapRecursively';
import { forEachRecursively } from './forEachRecuresively';
import { FormNestedGroup } from './nested';
//#endregion

const updateDependenciesOfParsedConfig = (parsedConfig, baseField) => field => {
  const item = path(field.split('.'), parsedConfig);
  item.addDependency(baseField);
};

export const unflatten = cfg => {
  const pcfg = {};
  Object.entries(cfg).forEach(([key, value]) => {
    const parsedKey = key.split('.');
    let currentF = pcfg;
    while (parsedKey.length !== 1) {
      const k = parsedKey.shift();
      if (pcfg[k] === void 0) {
        pcfg[k] = {};
      }
      currentF = pcfg[k];
    }
    currentF[parsedKey[0]] = value;
  });
  return pcfg;
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

export const mergeConfigs = (targetConfig, previousConfig) =>
  mapObjIndexed((configItem, key) => {
    return key in previousConfig ? configItem.concat(previousConfig) : configItem;
  }, targetConfig);
