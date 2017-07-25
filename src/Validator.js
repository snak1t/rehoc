const React = require('react')

const withValidation = config => Component => {
  return class Validator extends React.Component {
    constructor(props) {
      super(props)
      this.state = config.reduce((state, { field, initialValue }) => {
        return Object.assign({}, state, {
          [field]: {
            value: initialValue || '',
            errors: [],
            status: { dirty: !!initialValue, valid: false }
          }
        })
      }, {})
    }

    performAsyncValidation(rule, message, key, value) {
      const cb = result => {
        if (result) return
        this.setState(prevState => {
          const errors = [...prevState[key].errors, message]
          const stateSlice = Object.assign({}, prevState[key], { errors })
          return Object.assign({}, prevState, { [key]: stateSlice })
        })
      }
      return rule(value, cb)
    }

    checkForErrors({ key, value, isTarget, state }) {
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

    valueHandler(key) {
      return data => {
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
            const stateSlice = Object.assign({}, prevState[stateKey], {
              value: updatedValue,
              errors,
              status: {
                dirty: prevState[stateKey].status.dirty || isTarget,
                valid: errors.length === 0
              }
            })
            return Object.assign({}, prevState, { [stateKey]: stateSlice })
          })
        })
      }
    }

    isInvalidField(field) {
      return !field.status.valid || !field.status.dirty
    }

    prepareProps() {
      const props = {}
      let valid = true
      for (let key in this.state) {
        if (this.isInvalidField(this.state[key])) {
          valid = false
        }
        props[key] = Object.assign({}, this.state[key], {
          handler: this.valueHandler(key)
        })
      }
      props.valid = valid
      return props
    }

    render() {
      return React.createElement(
        Component,
        Object.assign({}, this.props, this.prepareProps())
      )
    }
  }
}

module.exports = withValidation
