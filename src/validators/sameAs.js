const sameAs = (fields, message = 'Fields are not equal') => ({
  rule: (value, ...otherFields) => otherFields.every(f => f === value),
  message,
  withFields: fields
})

module.exports = sameAs
