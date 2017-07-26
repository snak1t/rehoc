const withValidation = require('./Validator')
const email = require('./validators/email')
const minLength = require('./validators/minLength')
const pattern = require('./validators/pattern')
const required = require('./validators/required')
const sameAs = require('./validators/sameAs')
const oneOf = require('./utils/oneOf')

module.exports = {
  withValidation,
  email,
  minLength,
  pattern,
  required,
  sameAs,
  oneOf
}
