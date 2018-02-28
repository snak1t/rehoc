import path from 'ramda/src/path';
import split from 'ramda/src/split';

class KeyHelper {
  constructor(key) {
    this.key = key;
  }

  static of(key) {
    return new KeyHelper(key);
  }

  prepend(part) {
    const key = part + '.' + this.key;
    return KeyHelper.of(key);
  }

  append(part) {
    const key = this.key + '.' + part;
    return KeyHelper.of(key);
  }

  execute(object) {
    return path(split('.', this.key), object);
  }

  get value() {
    return split('.', this.key);
  }
}

export const Key = k => new KeyHelper(k);
