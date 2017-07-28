export default (validators = []) => {
  if (validators.length === 0) {
    return { rule: () => true, message: '' }
  }

  const validatorObject = {
    index: -1,
    rule(...values) {
      let success = true
      let i = 0
      while (
        (success = validators[i].rule(...values)) &&
        i < validators.length - 1
      ) {
        i += 1
      }
      this.index = success ? -1 : i
      return success
    },
    get message() {
      return this.index === -1 ? '' : validators[this.index].message
    }
  }

  return validatorObject
}
