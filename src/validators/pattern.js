export default (regExp, message = "Provided value doesn't match pattern") => ({
  rule: value => regExp.test(value),
  message
})
