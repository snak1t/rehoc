// @flow
export const mapObject = <T>(
  object: T,
  cb: (value: any, key: string, obj: T) => any
) => {
  if (typeof object !== 'object') {
    throw new Error('Must be object');
  }

  let returnObject = {};
  for (let key in object) {
    returnObject[key] = cb(object[key], key, object);
  }

  return returnObject;
};
