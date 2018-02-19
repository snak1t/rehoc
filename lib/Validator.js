'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.withValidation = exports.Validator = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _isEmpty = require('is-empty');

var _isEmpty2 = _interopRequireDefault(_isEmpty);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _parseConfig = require('./utils/parseConfig');

var ConfigUtility = _interopRequireWildcard(_parseConfig);

var _mapObject = require('./utils/mapObject');

var _formHelpers = require('./utils/form-helpers');

var FormHelper = _interopRequireWildcard(_formHelpers);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const filterPromises = a => a.filter(p => p instanceof Promise);

class Validator extends _react2.default.Component {

    constructor(props) {
        super(props);

        this.validateAll = () => {
            (0, _mapObject.mapObject)(this.handlers, (handler, key) => handler(this.state[key].value));
        };

        this.updateStateValue = ({ valueDescriptor, previousState }) => {
            const [errors, asyncErrors] = FormHelper.performValidation({
                state: previousState,
                valueDescriptor
            });
            const updatedState = this.updateStateSlice(previousState, valueDescriptor, errors);
            return !updatedState[valueDescriptor.key].dependency ? [updatedState, asyncErrors] : updatedState[valueDescriptor.key].dependency.reduce(([state, asyncErrors], key) => {
                const [updatedState, _asyncErrors] = this.updateStateValue({
                    valueDescriptor: {
                        key,
                        value: state[key].value,
                        isTarget: false
                    },
                    previousState: state
                });
                return [updatedState, [...asyncErrors, _asyncErrors]];
            }, [updatedState, asyncErrors]);
        };

        this.state = ConfigUtility.parseConfig(this.props.config);
        this.handlers = this.prepareHandlers(this.state);
    }

    componentDidMount() {
        if (this.props.options.eager) {
            this.validateAll();
        }
        this.validateNotEmptyValues();
    }

    prepareHandlers(state) {
        return (0, _mapObject.mapObject)(state, (_, key) => this.valueHandler(key));
    }

    validateNotEmptyValues() {
        (0, _mapObject.mapObject)(this.handlers, (handler, key) => {
            const value = this.state[key].value;
            if (!(0, _isEmpty2.default)(value)) {
                handler(value);
            }
        });
    }

    setErrorsAndStatus({ stateSlice, valueDescriptor, errors }) {
        const dirty = FormHelper.isDirty(stateSlice, valueDescriptor.isTarget);
        const valid = FormHelper.isValid(stateSlice, valueDescriptor.value, errors, dirty);
        return _extends({}, stateSlice, {
            errors,
            value: valueDescriptor.value,
            status: {
                dirty,
                valid
            }
        });
    }

    updateStateSlice(previousState, valueDescriptor, errors) {
        const stateSlice = previousState[valueDescriptor.key];
        const updatedStateSlice = this.setErrorsAndStatus({ stateSlice, valueDescriptor, errors });
        const updatedState = _extends({}, previousState, { [valueDescriptor.key]: updatedStateSlice });
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
                const updatedStateSlice = _extends({}, previousState[key], {
                    value
                });
                return _extends({}, previousState, {
                    [key]: updatedStateSlice
                });
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
        return _extends({}, ConfigUtility.unflatten(values), {
            valid,
            validateAll: this.validateAll
        });
    }

    render() {
        return this.props.render(this.collectFormValues());
    }
}

exports.Validator = Validator;
Validator.defaultProps = {
    options: {
        eager: false
    }
};
const withValidation = exports.withValidation = (config, options = { eager: false }) => Component => {
    const HelperComponent = props => _react2.default.createElement(Validator, { config: config, options: options, render: args => _react2.default.createElement(Component, _extends({}, props, args)) });
    HelperComponent.displayName = `withValidation(${Component.displayName || Component.name})`;
    return HelperComponent;
};