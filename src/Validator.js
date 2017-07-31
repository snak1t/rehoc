import React from 'react'
import parseConfig from './utils/parseConfig'

export default config => Component => {
  return class Validator extends React.Component {
    constructor(props) {
      super(props)
      this.state = parseConfig(config)
      this.handlers = this.prepareHandlers(this.state)
    }

    prepareHandlers(state) {
      let handlers = {}
      for (let i in state) {
        handlers[i] = this.valueHandler(i)
      }
      return handlers
    }

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
      const stateSlice = {
        ...state[key],
        value,
        errors,
        status: {
          dirty: state[key].status.dirty || isTarget,
          valid: errors.length === 0
        }
      }
      const updatedState = { ...state, [key]: stateSlice }
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
        props[key] = {
          ...this.state[key],
          handler: this.handlers[key]
        }
      }
      props.valid = valid
      return props
    }

    render() {
      return <Component {...this.props} {...this.prepareProps()} />
    }
  }
}
