const React = require('react')
const parseConfig = require('./utils/parseConfig')
const merge = require('./utils/merge')

const withValidation = config => Component => {
  return class Validator extends React.Component {
    constructor(props) {
      super(props)
      this.state = parseConfig(config)
    }

    performAsyncValidation(rule, message, key, value) {
      const cb = result => {
        if (result) return
        this.setState(prevState => {
          const errors = [...prevState[key].errors, message]
          const stateSlice = merge(prevState[key], { errors })
          return merge(prevState, { [key]: stateSlice })
        })
      }
      return rule(value, cb)
    }

    isNeedValidation(field, isTarget) {
      // Plan to add config for eager validation
      return field.status.dirty === false && !isTarget
    }

    collectErrors({ key, value, isTarget, state }) {
      if (this.isNeedValidation(state[key], isTarget)) {
        return []
      }
      const { validators } = config[key]
      if (validators === void 0) {
        return []
      }
      const errors = validators.reduce((
        errors,
        validator // Never perform destructure of validator (getter oneOf)
      ) => {
        if (validator.async) {
          if (isTarget) {
            this.performAsyncValidation(
              validator.rule,
              validator.message,
              key,
              value
            )
          } else {
            if (state[key].errors.indexOf(validator.message) !== -1) {
              return [...errors, validator.message]
            }
          }
          return errors
        }
        const valid =
          validator.withFields !== void 0
            ? validator.rule(
                value,
                ...validator.withFields.map(key => state[key].value)
              )
            : validator.rule(value)
        return valid ? errors : [...errors, validator.message]
      }, [])
      return errors
    }

    updateStateValue(key, value, isTarget, state) {
      const errors = this.collectErrors({
        key,
        value,
        isTarget,
        state: state
      })
      const stateSlice = merge(state[key], {
        value,
        errors,
        status: {
          dirty: state[key].status.dirty || isTarget,
          valid: errors.length === 0
        }
      })
      const updatedState = merge(state, { [key]: stateSlice })
      return !updatedState[key].dependency
        ? updatedState
        : updatedState[key].dependency.reduce(
            (state, key) =>
              this.updateStateValue(key, state[key].value, false, state),
            updatedState
          )
    }

    valueHandler(key) {
      return data => {
        const value = data && data.target ? data.target.value : data

        this.setState(pState => {
          return this.updateStateValue(key, value, true, pState)
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
        props[key] = merge(this.state[key], {
          handler: this.valueHandler(key)
        })
      }
      props.valid = valid
      return props
    }

    render() {
      return React.createElement(
        Component,
        merge(this.props, this.prepareProps())
      )
    }
  }
}

module.exports = withValidation
