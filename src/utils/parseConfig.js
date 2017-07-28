const { findCircularDependency } = require('./circullarErrors')
const findObjectDependencies = obj =>
  obj.validators.reduce(
    (deps, item) =>
      item.withFields === void 0 ? deps : [...deps, ...item.withFields],
    []
  )

const concatDependencies = (item, field) => ({
  dependency:
    !field || typeof field.dependency === 'undefined'
      ? [item]
      : [...field.dependency, item]
})

const parseValidationConfig = config => {
  let parsedConfig = {}
  for (let i in config) {
    let withFields = findObjectDependencies(config[i])
    if (withFields.length !== 0) {
      withFields.forEach(
        field =>
          (parsedConfig[field] = Object.assign(
            {},
            parsedConfig[field],
            concatDependencies(i, parsedConfig[field])
          ))
      )
    }

    let baseRules = {
      value: config[i].initialValue || '',
      status: { dirty: false, valid: false },
      errors: []
    }

    parsedConfig[i] = Object.assign({}, parsedConfig[i], baseRules)
  }
  if (process.env.NODE_ENV !== 'production') {
    findCircularDependency(parsedConfig)
  }
  return parsedConfig
}

module.exports = parseValidationConfig
