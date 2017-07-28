export default (message = 'Field is required') => ({
  rule: value => value.trim() !== '',
  message
})
