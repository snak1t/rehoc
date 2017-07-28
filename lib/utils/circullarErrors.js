'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var id = function id(x) {
  return x;
};
var createDependencyMatrix = exports.createDependencyMatrix = function createDependencyMatrix(state) {
  var keys = Object.keys(state).sort();

  return keys.map(function (key) {
    return keys.map(function (innerKey) {
      return !!state[key].dependency && state[key].dependency.indexOf(innerKey) !== -1;
    });
  });
};

var createError = function createError(indexes, state) {
  var fields = Object.keys(state).sort().filter(function (_, i) {
    return indexes.indexOf(i) !== -1;
  });
  fields.push(fields[0]);
  throw new Error('Found a circular dependency in validation config for ' + fields.join(' -> ') + ' -> ...');
};

var findCircularDependency = exports.findCircularDependency = function findCircularDependency(state) {
  var matrix = createDependencyMatrix(state);
  var helper = function helper(index, matrix, stack) {
    return matrix[index].reduce(function (acc, item, index) {
      return item ? [].concat(_toConsumableArray(acc), [index]) : acc;
    }, []).forEach(function (item, index) {
      if (stack.indexOf(item) !== -1) {
        createError(stack, state);
      }
      helper(item, matrix, [].concat(_toConsumableArray(stack), [item]));
    });
  };

  matrix.forEach(function (row, index, initialMatrix) {
    helper(index, initialMatrix, [index]);
  });
};