const withValidation = require('./Validator')
const email = require('./validators/email')
const minLength = require('./validators/minLength')
const pattern = require('./validators/pattern')
const required = require('./validators/required')
const sameAs = require('./validators/sameAs')

module.exports = {
  withValidation,
  email,
  minLength,
  pattern,
  required,
  sameAs
}
