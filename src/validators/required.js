const required = (message = 'Field is required') => ({
  rule: value => value !== '',
  message
})

module.exports = required
