import React from 'react';
import isEmpty from 'is-empty';
import parseConfig from './utils/parseConfig';
import { mapObject } from './utils/mapObject';
import * as FormHelper from './utils/form-helpers';

export class Validator extends React.Component {
    static defaultProps = {
        options: {
            eager: false
        }
    };

    constructor(props) {
        super(props);
        this.state = parseConfig(this.props.config);
        this.handlers = this.prepareHandlers(this.state);
        this.validateAll = this.validateAll.bind(this);
    }

    componentDidMount() {
        if (this.props.options.eager) {
            this.validateAll();
        }
        this.validateNotEmptyValues();
    }

    prepareHandlers(state) {
        return mapObject(state, (_, key) => this.valueHandler(key));
    }

    validateAll() {
        mapObject(this.handlers, (handler, key) => handler(this.state[key].value));
    }

    validateNotEmptyValues() {
        mapObject(this.handlers, (handler, key) => {
            if (!isEmpty(this.state[key].value)) {
                handler(this.state[key].value);
            }
        });
    }

    updateStateValue = async ({ key, value, isTarget, previousState }) => {
        const errors = await FormHelper.performValidation(
            previousState,
            key,
            value,
            this.props.config[key].validators,
            isTarget
        );
        const stateSlice = previousState[key];
        const dirty = FormHelper.isDirty(stateSlice, isTarget);
        const valid = FormHelper.isValid(stateSlice, value, errors, dirty);
        const updatedStateSlice = {
            ...stateSlice,
            errors,
            value,
            status: {
                dirty,
                valid
            }
        };
        const updatedState = { ...previousState, [key]: updatedStateSlice };
        return !updatedState[key].dependency
            ? updatedState
            : updatedState[key].dependency.reduce(
                  (state, key) =>
                      this.updateStateValue({
                          key,
                          value: state[key].value,
                          isTarget: false,
                          previousState: state
                      }),
                  updatedState
              );
    };

    /**
     * Creates functions bound to a specific parts of state keys
     *
     * @param {string} key
     * @returns {Function}
     */
    valueHandler(key) {
        let currentPromise = 0;
        return async data => {
            const value = data && data.target && data.target.value !== undefined ? data.target.value : data;
            this.setState(previousState => {
                const updatedStateSlice = {
                    ...previousState[key],
                    value
                };
                return {
                    ...previousState,
                    [key]: updatedStateSlice
                };
            });
            const innerPromise = ++currentPromise;
            const newState = await this.updateStateValue({ key, value, isTarget: true, previousState: this.state });
            if (innerPromise === currentPromise) {
                return this.setState(prevState => FormHelper.mergeWithoudField(prevState, newState));
            }
        };
    }

    /**
     * Check validity of the field
     *
     * @param {InputType} field
     * @returns {boolean}
     */
    isValidField(field) {
        return field.status.valid;
    }

    /**
     * Created props that will be passed to wrapped Component
     *
     * @returns {Output}
     */
    prepareProps() {
        const [values, valid] = FormHelper.mergeFieldsWithHandlers(this.state, this.handlers);
        return {
            ...values,
            valid,
            validateAll: this.validateAll
        };
    }

    render() {
        return this.props.render(this.prepareProps());
    }
}
export const withValidation = (config, options = { eager: false }) => Component => {
    const HelperComponent = props => (
        <Validator config={config} options={options} render={args => <Component {...props} {...args} />} />
    );
    HelperComponent.displayName = `withValidation(${Component.displayName || Component.name})`;
    return HelperComponent;
};
