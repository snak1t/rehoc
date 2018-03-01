import pathOr from 'ramda/src/pathOr';
import { Key } from './keys';
const getRawOrEventValue = value => pathOr(value, ['target', 'value'], value);

export const of = ({ value, isTarget, key }) => ({
  value: getRawOrEventValue(value),
  isTarget,
  key: Key(key)
});

export const key = vd => vd.key.value;
