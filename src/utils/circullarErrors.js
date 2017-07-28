const id = x => x
const createDependencyMatrix = state => {
  const keys = Object.keys(state).sort()

  return keys.map(key =>
    keys.map(
      innerKey =>
        !!state[key].dependency &&
        state[key].dependency.indexOf(innerKey) !== -1
    )
  )
}

const createError = (indexes, state) => {
  const fields = Object.keys(state)
    .sort()
    .filter((_, i) => indexes.indexOf(i) !== -1)
  fields.push(fields[0])
  throw new Error(
    'Found a circular dependency in validation config for ' +
      fields.join(' -> ') +
      ' -> ...'
  )
}

const findCircularDependency = state => {
  const matrix = createDependencyMatrix(state)
  const helper = (index, matrix, stack) =>
    matrix[index]
      .reduce((acc, item, index) => (item ? [...acc, index] : acc), [])
      .forEach((item, index) => {
        if (stack.indexOf(item) !== -1) {
          createError(stack, state)
        }
        helper(item, matrix, [...stack, item])
      })

  matrix.forEach((row, index, initialMatrix) => {
    helper(index, initialMatrix, [index])
  })
}

module.exports = {
  createDependencyMatrix: createDependencyMatrix,
  findCircularDependency: findCircularDependency
}
