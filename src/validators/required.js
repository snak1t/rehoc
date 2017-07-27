const required = (message = 'Field is required') => ({
  rule: value => value.trim() !== '',
  message
})

module.exports = required
