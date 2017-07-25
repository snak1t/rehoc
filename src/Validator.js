const React = require('react')

const withValidation = config => Component => {
  return class Validator extends React.Component {
    state = config.reduce((state, { field, initialValue }) => {
      return {
        ...state,
        [field]: {
          value: initialValue || '',
          errors: [],
          status: { dirty: !!initialValue, valid: false }
        }
      }
    }, {})

    performAsyncValidation(rule, message, key, value) {
      const cb = result => {
        if (result) return
        this.setState(prevState => {
          const errors = [...prevState[key].errors, message]
          const stateSlice = { ...prevState[key], errors }
          return { ...prevState, [key]: stateSlice }
        })
      }
      return rule(value, cb)
    }

    checkForErrors = ({ key, value, isTarget, state }) => {
      if (state[key].status.dirty === false && !isTarget) return []
      const [{ validators }] = config.filter(confItem => confItem.field === key)
      if (typeof validators === 'undefined') {
        return []
      }
      const errors = validators.reduce(
        (errors, { withFields, rule, message, async: asyncValidator }) => {
          if (asyncValidator) {
            if (isTarget) {
              this.performAsyncValidation(rule, message, key, value)
            } else {
              if (state[key].errors.includes(message)) {
                return [...errors, message]
              }
            }
            return errors
          }
          const valid =
            withFields !== void 0
              ? rule(value, ...withFields.map(key => state[key].value))
              : rule(value)
          return valid ? errors : [...errors, message]
        },
        []
      )
      return errors
    }

    valueHandler = key => data => {
      const value = data && data.target ? data.target.value : data

      config.forEach(({ field: stateKey }) => {
        this.setState(prevState => {
          const isTarget = stateKey === key
          const updatedValue = isTarget ? value : prevState[stateKey].value
          const errors = this.checkForErrors({
            key: stateKey,
            value: updatedValue,
            isTarget,
            state: prevState
          })
          const stateSlice = {
            ...prevState[stateKey],
            value: updatedValue,
            errors,
            status: {
              dirty: prevState[stateKey].status.dirty || isTarget,
              valid: errors.length === 0
            }
          }
          return { ...prevState, [stateKey]: stateSlice }
        })
      })
    }

    isInvalidField = field => !field.status.valid || !field.status.dirty

    prepareProps = () => {
      const props = {}
      let valid = true
      for (let key in this.state) {
        if (this.isInvalidField(this.state[key])) {
          valid = false
        }
        props[key] = { ...this.state[key], handler: this.valueHandler(key) }
      }
      props.valid = valid
      return props
    }

    render() {
      return <Component {...this.props} {...this.prepareProps()} />
    }
  }
}

module.exports = withValidation
