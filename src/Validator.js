// @flow
import React from 'react';
import isEmpty from 'is-empty';
import parseConfig from './utils/parseConfig';
import { mapObject } from './utils/mapObject';

type Options = {
  eager: boolean
};

type AcceptedValue = string | number | boolean | Array<any> | Object;

type InputType = {
  value: AcceptedValue,
  errors: Array<string>,
  dependency: Array<string>,
  required: boolean,
  status: {
    dirty: boolean,
    valid: boolean
  }
};

type OutputType = InputType & {
  handler: (x: AcceptedValue) => boolean
};

type Output = {
  [string]: InputType,
  valid: boolean,
  validateAll: Function
};

interface State {
  [key: string]: InputType
}

interface Handler {
  [key: string]: Function
}

type Handlers = { [string]: (x: AcceptedValue) => void };

type RuleFunction = (
  x: AcceptedValue,
  otherValue: ?AcceptedValue | ?(x: boolean) => void
) => boolean;

type ValidatorItem = {
  rule: RuleFunction,
  message: string,
  withFields: ?Array<string>,
  async: boolean
};

type Config = {
  [string]: {
    validators: Array<ValidatorItem>,
    initialValue: ?AcceptedValue,
    required: ?boolean
  }
};

export default (config: Config, options: Options = { eager: false }) => (
  Component: any
) => {
  return class Validator extends React.Component {
    state: State;
    props: any;
    handlers: Handlers;

    validateAll: () => void;

    constructor(props: Object) {
      super(props);
      this.state = parseConfig(config);
      this.handlers = this.prepareHandlers(this.state);
      this.validateAll = this.validateAll.bind(this);
    }

    componentDidMount() {
      if (options.eager) {
        this.validateAll();
      }
      this.validateNotEmptyValues();
    }

    prepareHandlers(state: State): Handlers {
      return mapObject(state, (_, key) => this.valueHandler(key));
    }

    validateAll(): void {
      mapObject(this.handlers, (handler, key) =>
        handler(this.state[key].value)
      );
    }

    validateNotEmptyValues(): void {
      mapObject(this.handlers, (handler, key) => {
        if (!isEmpty(this.state[key].value)) {
          handler(this.state[key].value);
        }
      });
    }

    performAsyncValidation(
      rule: RuleFunction,
      message: string,
      key: string,
      value: AcceptedValue
    ) {
      const cb = result => {
        if (result) return;
        this.setState(prevState => {
          const errors = [...prevState[key].errors, message];
          const stateSlice = { ...prevState[key], errors };
          return { ...prevState, [key]: stateSlice };
        });
      };
      return rule(value, cb);
    }

    isNeedValidation(field: InputType, isTarget: boolean) {
      return field.status.dirty === false && !isTarget;
    }

    handleAsyncValidation({
      validator,
      key,
      value,
      isTarget,
      errors,
      state
    }: {
      validator: ValidatorItem,
      key: string,
      value: AcceptedValue,
      isTarget: boolean,
      errors: Array<string>,
      state: State
    }) {
      if (!isTarget && state[key].errors.indexOf(validator.message) !== -1) {
        return [...errors, validator.message];
      }
      this.performAsyncValidation(
        validator.rule,
        validator.message,
        key,
        value
      );
      return errors;
    }

    handleSyncValidation({
      validator,
      key,
      value,
      errors,
      state
    }: {
      validator: ValidatorItem,
      key: string,
      value: AcceptedValue,
      errors: Array<string>,
      state: State
    }): Array<string> {
      const valid: boolean = validator.withFields
        ? validator.rule(
            value,
            ...validator.withFields.map(key => state[key].value)
          )
        : validator.rule(value);
      return valid ? errors : [...errors, validator.message];
    }

    collectErrors({
      key,
      value,
      isTarget,
      state
    }: {
      key: string,
      value: AcceptedValue,
      isTarget: boolean,
      state: State
    }): Array<string> {
      const { validators } = config[key];

      if (
        this.isNeedValidation(state[key], isTarget) ||
        (!state[key].required && isEmpty(value)) ||
        validators === void 0
      ) {
        return [];
      }

      const errors = validators.reduce(
        (
          errors,
          validator // Never perform destructure of validator (getter oneOf)
        ) =>
          validator.async
            ? this.handleAsyncValidation({
                validator,
                key,
                value,
                isTarget,
                errors,
                state
              })
            : this.handleSyncValidation({
                validator,
                key,
                value,
                errors,
                state
              }),
        []
      );
      return errors;
    }

    updateStateValue(
      key: string,
      value: AcceptedValue,
      isTarget: boolean,
      state: State
    ): State {
      const errors: Array<string> = this.collectErrors({
        key,
        value,
        isTarget,
        state: state
      });
      const dirty = state[key].status.dirty || isTarget;
      const valid = !(!state[key].required && isEmpty(value))
        ? errors.length === 0 && dirty
        : true;
      const stateSlice = {
        ...state[key],
        value,
        errors,
        status: {
          dirty,
          valid
        }
      };
      const updatedState: State = { ...state, [key]: stateSlice };
      return !updatedState[key].dependency
        ? updatedState
        : updatedState[key].dependency.reduce(
            (state, key) =>
              this.updateStateValue(key, state[key].value, false, state),
            updatedState
          );
    }

    /**
     * Creates functions bound to a specific parts of state keys
     * 
     * @param {string} key 
     * @returns {Function}
     */
    valueHandler(key: string) {
      return (data: AcceptedValue | Object) => {
        const value =
          data && data.target && data.target.value !== undefined
            ? ((data.target.value: any): AcceptedValue)
            : data;

        this.setState((previousState: State) =>
          this.updateStateValue(key, value, true, previousState)
        );
      };
    }

    /**
     * Check validity of the field
     * 
     * @param {InputType} field 
     * @returns {boolean} 
     */
    isValidField(field: InputType): boolean {
      return field.status.valid;
    }

    /**
     * Created props that will be passed to wrapped Component
     * 
     * @returns {Output} 
     */
    prepareProps(): Output {
      let valid = true;
      const values = mapObject(this.state, (value, key) => {
        if (!this.isValidField(value)) {
          valid = false;
        }
        return {
          ...value,
          handler: this.handlers[key]
        };
      });
      return {
        ...values,
        valid,
        validateAll: this.validateAll
      };
    }

    render() {
      return <Component {...this.props} {...this.prepareProps()} />;
    }
  };
};
