import forEachObjIndexed from 'ramda/src/forEachObjIndexed';

export const forEachRecursively = (condition, forEachCb) =>
  function forEachRecur(object, previousKey = '') {
    forEachObjIndexed((item, key) => {
      const compoundKey = previousKey === '' ? key : `${previousKey}.${key}`;
      return condition(item, key) ? forEachCb(item, key, compoundKey) : forEachRecur(item, compoundKey);
    }, object);
  };
