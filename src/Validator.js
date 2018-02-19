//#region Import statements
import React from 'react';
import * as ConfigUtility from './utils/parseConfig';
import * as FormHelper from './utils/form-helpers';
import mapObjIndexed from 'ramda/src/mapObjIndexed';
import forEachObjIndexed from 'ramda/src/forEachObjIndexed';
import pathOr from 'ramda/src/pathOr';
import isEmpty from 'ramda/src/isEmpty';
//#endregion

export class Validator extends React.Component {
    static defaultProps = {
        options: {
            eager: false
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            config: ConfigUtility.parseConfig(this.props.config)
        };
        this.handlers = this.prepareHandlers(this.state.config);
    }

    componentDidMount() {
        if (this.props.options.eager) {
            this.validateAll();
        }
        this.validateNotEmptyValues();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.config !== this.props.config) {
            this.setState(prevState => {
                const newState = ConfigUtility.parseConfig(nextProps.config);
                this.handlers = this.prepareHandlers(newState);
                return { config: ConfigUtility.mergeConfigs(newState, prevState) };
            });
        }
    }

    prepareHandlers = mapObjIndexed((_, key) => this.valueHandler(key));

    validateAll = () => {
        forEachObjIndexed((handler, key) => handler(this.state.config[key].value), this.handlers);
    };

    validateNotEmptyValues() {
        forEachObjIndexed((handler, key) => {
            const value = this.state.config[key].value;
            if (!isEmpty(value)) {
                handler(value);
            }
        }, this.handlers);
    }

    setErrorsAndStatus({ stateSlice, valueDescriptor, errors }) {
        const dirty = FormHelper.isDirty(stateSlice, valueDescriptor.isTarget);
        const valid = FormHelper.isValid(stateSlice, valueDescriptor.value, errors, dirty);
        const status = { dirty, valid };
        return {
            ...stateSlice,
            errors,
            value: valueDescriptor.value,
            status
        };
    }

    updateStateValue = ({ valueDescriptor, previousState }) => {
        const [errors, asyncErrors] = FormHelper.performValidation({
            state: previousState,
            valueDescriptor
        });
        const updatedState = this.updateStateSlice(previousState, valueDescriptor, errors);
        const dependencies = updatedState[valueDescriptor.key].dependency;
        return !dependencies
            ? [updatedState, asyncErrors]
            : dependencies.reduce(this.stateReducer, [updatedState, asyncErrors]);
    };

    stateReducer = ([state, asyncErrors], key) => {
        const [updatedState, _asyncErrors] = this.updateStateValue({
            valueDescriptor: {
                key,
                value: state[key].value,
                isTarget: false
            },
            previousState: state
        });
        return [updatedState, [...asyncErrors, _asyncErrors]];
    };

    updateStateSlice(previousState, valueDescriptor, errors) {
        const stateSlice = previousState[valueDescriptor.key];
        const updatedStateSlice = this.setErrorsAndStatus({ stateSlice, valueDescriptor, errors });
        return { ...previousState, [valueDescriptor.key]: updatedStateSlice };
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
            const valueDescriptor = { value: this.getRawOrEventValue(data), isTarget: true, key };
            this.setState(FormHelper.updateValue(['config', key, 'value'], valueDescriptor.value));
            const innerPromise = ++currentPromise;
            const [newState, asyncErrors] = this.updateStateValue({
                valueDescriptor,
                previousState: this.state.config
            });
            this.setState(prevState => ({ config: FormHelper.mergeWithoutField(prevState.config, newState) }));
            const filteredAsyncErrors = FormHelper.filterPromises(asyncErrors);
            if (innerPromise === currentPromise && filteredAsyncErrors.length !== 0) {
                this.runAsync(filteredAsyncErrors, valueDescriptor);
            }
        };
    }

    getRawOrEventValue(data) {
        return pathOr(data, ['target', 'value'], data);
    }

    runAsync(asyncErrors, valueDescriptor) {
        Promise.all(asyncErrors).catch(errors => {
            this.setState(prevState => {
                const updatedState = this.updateStateSlice(prevState.config, valueDescriptor, errors);
                return { config: FormHelper.mergeWithoutField(prevState.config, updatedState) };
            });
        });
    }

    /**
     * Created props that will be passed to wrapped Component
     *
     * @returns {Output}
     */
    collectFormValues() {
        const [values, valid] = FormHelper.mergeFieldsWithHandlers(this.state.config, this.handlers);
        return {
            ...ConfigUtility.unflatten(values),
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
