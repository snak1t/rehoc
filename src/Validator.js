import isEmpty from 'is-empty';
import React from 'react';
import parseConfig from './utils/parseConfig';
import { mapObject } from './utils/mapObject';
import * as FormHelper from './utils/form-helpers';

const filterPromises = a => a.filter(p => p instanceof Promise);

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

    validateAll = () => {
        mapObject(this.handlers, (handler, key) => handler(this.state[key].value));
    };

    validateNotEmptyValues() {
        mapObject(this.handlers, (handler, key) => {
            const value = this.state[key].value;
            if (!isEmpty(value)) {
                handler(value);
            }
        });
    }

    setErrorsAndStatus({ stateSlice, valueDescriptor, errors }) {
        const dirty = FormHelper.isDirty(stateSlice, valueDescriptor.isTarget);
        const valid = FormHelper.isValid(stateSlice, valueDescriptor.value, errors, dirty);
        return {
            ...stateSlice,
            errors,
            value: valueDescriptor.value,
            status: {
                dirty,
                valid
            }
        };
    }

    updateStateValue = ({ valueDescriptor, previousState }) => {
        const [errors, asyncErrors] = FormHelper.performValidation({
            state: previousState,
            valueDescriptor
        });
        const updatedState = this.updateStateSlice(previousState, valueDescriptor, errors);
        return !updatedState[valueDescriptor.key].dependency
            ? [updatedState, asyncErrors]
            : updatedState[valueDescriptor.key].dependency.reduce(
                  ([state, asyncErrors], key) => {
                      const [updatedState, _asyncErrors] = this.updateStateValue({
                          valueDescriptor: {
                              key,
                              value: state[key].value,
                              isTarget: false
                          },
                          previousState: state
                      });
                      return [updatedState, [...asyncErrors, _asyncErrors]];
                  },
                  [updatedState, asyncErrors]
              );
    };

    updateStateSlice(previousState, valueDescriptor, errors) {
        const stateSlice = previousState[valueDescriptor.key];
        const updatedStateSlice = this.setErrorsAndStatus({ stateSlice, valueDescriptor, errors });
        const updatedState = { ...previousState, [valueDescriptor.key]: updatedStateSlice };
        return updatedState;
    }

    /**
     * Creates functions bound to a specific parts of state keys
     *
     * @param {string} key
     * @returns {Function}
     */
    valueHandler(key) {
        let currentPromise = 0;
        return data => {
            const value = this.getRawOrEventValue(data);
            const valueDescriptor = { value, isTarget: true, key };
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
            const [newState, asyncErrors] = this.updateStateValue({ valueDescriptor, previousState: this.state });
            this.setState(prevState => FormHelper.mergeWithoutField(prevState, newState));
            const filteredAsyncErrors = filterPromises(asyncErrors);
            if (innerPromise === currentPromise && filteredAsyncErrors.length !== 0) {
                this.runAsync(asyncErrors, valueDescriptor);
            }
        };
    }

    getRawOrEventValue(data) {
        return data && data.target && data.target.value !== undefined ? data.target.value : data;
    }

    runAsync(asyncErrors, valueDescriptor) {
        Promise.all(asyncErrors).catch(errors => {
            this.setState(prevState => {
                const updatedState = this.updateStateSlice(prevState, valueDescriptor, errors);
                return FormHelper.mergeWithoutField(prevState, updatedState);
            });
        });
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
    collectFormValues() {
        const [values, valid] = FormHelper.mergeFieldsWithHandlers(this.state, this.handlers);
        return {
            ...values,
            valid,
            validateAll: this.validateAll
        };
    }

    render() {
        return this.props.render(this.collectFormValues());
    }
}

export const withValidation = (config, options = { eager: false }) => Component => {
    const HelperComponent = props => (
        <Validator config={config} options={options} render={args => <Component {...props} {...args} />} />
    );
    HelperComponent.displayName = `withValidation(${Component.displayName || Component.name})`;
    return HelperComponent;
};
