export default (validators = []) => {
  if (validators.length === 0) {
    return { rule: () => true, message: '' };
  }

  if (process.env.NODE_ENV !== 'production') {
    if (validators.findIndex(v => v.async === true) !== -1) {
      throw new Error('Do not place async validator into all method');
    }
  }

  const validatorObject = {
    index: -1,
    multiple: true,
    rule(...inputs) {
      const errors = validators.reduce(
        (errors, { rule, message }) =>
          rule(...inputs) ? errors : [...errors, message],
        []
      );
      this.message = errors;
      return errors.length === 0;
    },
    message: []
  };

  return validatorObject;
};
