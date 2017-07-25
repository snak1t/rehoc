const minLength = (
  value,
  message = `Field length must be more than ${value} characters`
) => ({ rule: field => field.length > value, message })

module.exports = minLength
