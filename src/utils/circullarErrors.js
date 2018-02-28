const id = x => x;

const _flatten = (cfg, key) => {
  let fcfg = {};
  let rKey = key === '' ? key : key + '.';

  for (let i in cfg) {
    if (cfg[i].__nested !== true) {
      if (i !== '__nested') {
        fcfg[rKey + i] = cfg[i];
      }
    } else {
      Object.assign(fcfg, _flatten(cfg[i], rKey + i));
    }
  }

  return fcfg;
};

export const flatten = cfg => {
  return _flatten(cfg, '');
};

export const createDependencyMatrix = state => {
  const keys = Object.keys(state).sort();

  return keys.map(key =>
    keys.map(innerKey => !!state[key].dependency && state[key].dependency.indexOf(innerKey) !== -1)
  );
};

const createError = (indexes, state) => {
  const fields = Object.keys(state)
    .sort()
    .filter((_, i) => indexes.indexOf(i) !== -1);
  fields.push(fields[0]);
  throw new Error('Found a circular dependency in validation config for ' + fields.join(' -> ') + ' -> ...');
};

export const findCircularDependency = _state => {
  const state = flatten(_state);
  const matrix = createDependencyMatrix(state);
  const helper = (index, matrix, stack) =>
    matrix[index].reduce((acc, item, index) => (item ? [...acc, index] : acc), []).forEach((item, index) => {
      if (stack.indexOf(item) !== -1) {
        createError(stack, state);
      }
      helper(item, matrix, [...stack, item]);
    });

  matrix.forEach((row, index, initialMatrix) => {
    helper(index, initialMatrix, [index]);
  });
};
