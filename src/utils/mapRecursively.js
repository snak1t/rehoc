import mapObjIndexed from 'ramda/src/mapObjIndexed';

export const mapRecursively = (condition, mapCb) => object => {
  function _mr(object, previousKey = '') {
    let isUpdated = false;
    const mappedObject = mapObjIndexed((item, key) => {
      const compoundKey = previousKey === '' ? key : `${previousKey}.${key}`;
      if (condition(item, key)) {
        const mappedItem = mapCb(item, key, compoundKey);
        if (!isUpdated && mappedItem !== item) {
          isUpdated = true;
        }
        return mappedItem;
      }
      const [mapped, _isUpdated] = _mr(item, compoundKey);
      return _isUpdated ? mapped : item;
    }, object);
    return [mappedObject, isUpdated];
  }

  const [m] = _mr(object);
  return m;
};
