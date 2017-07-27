const mapObject = (cb, obj) => {
  let mappedObject = {}
  for (let i in obj) {
    mappedObject[i] = cb(obj[i], i, obj)
  }
  return mappedObject
}

const findObjectDependencies = obj =>
  obj.validators.reduce(
    (deps, item) =>
      item.withFields === void 0 ? deps : [...deps, ...item.withFields],
    []
  )

const concatDependencies = (item, { dependency }) => ({
  dependency: dependency === void 0 ? [item] : [...dependency, item]
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
  return parsedConfig
}

module.exports = parseValidationConfig
