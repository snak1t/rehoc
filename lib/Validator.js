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

var _parseConfig2 = _interopRequireDefault(_parseConfig);

var _mapObject = require('./utils/mapObject');

var _formHelpers = require('./utils/form-helpers');

var FormHelper = _interopRequireWildcard(_formHelpers);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const filterPromises = a => a.filter(p => p instanceof Promise);

class Validator extends _react2.default.Component {

    constructor(props) {
        super(props);

        this.updateStateValue = ({ key, value, isTarget, previousState }) => {
            const [errors, asyncErrors] = FormHelper.performValidation(previousState, key, value, this.props.config[key].validators, isTarget);
            const stateSlice = previousState[key];
            const updatedStateSlice = this.setErrorsAndStatus({ stateSlice, isTarget, value, errors });
            const updatedState = _extends({}, previousState, { [key]: updatedStateSlice });
            return !updatedState[key].dependency ? [updatedState, asyncErrors] : updatedState[key].dependency.reduce(([state, asyncErrors], key) => {
                const [updatedState, aE] = this.updateStateValue({
                    key,
                    value: state[key].value,
                    isTarget: false,
                    previousState: state
                });
                return [updatedState, [...asyncErrors, aE]];
            }, [updatedState, asyncErrors]);
        };

        this.state = (0, _parseConfig2.default)(this.props.config);
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
        return (0, _mapObject.mapObject)(state, (_, key) => this.valueHandler(key));
    }

    validateAll() {
        (0, _mapObject.mapObject)(this.handlers, (handler, key) => handler(this.state[key].value));
    }

    validateNotEmptyValues() {
        (0, _mapObject.mapObject)(this.handlers, (handler, key) => {
            if (!(0, _isEmpty2.default)(this.state[key].value)) {
                handler(this.state[key].value);
            }
        });
    }

    setErrorsAndStatus({ stateSlice, isTarget, value, errors }) {
        const dirty = FormHelper.isDirty(stateSlice, isTarget);
        const valid = FormHelper.isValid(stateSlice, value, errors, dirty);
        return _extends({}, stateSlice, {
            errors,
            value,
            status: {
                dirty,
                valid
            }
        });
    }

    /**
     * Creates functions bound to a specific parts of state keys
     *
     * @param {string} key
     * @returns {Function}
     */
    valueHandler(key) {
        let currentPromise = 0;
        const isTarget = true;
        return data => {
            const value = data && data.target && data.target.value !== undefined ? data.target.value : data;
            this.setState(previousState => {
                const updatedStateSlice = _extends({}, previousState[key], {
                    value
                });
                return _extends({}, previousState, {
                    [key]: updatedStateSlice
                });
            });
            const innerPromise = ++currentPromise;
            const [newState, asyncErrors] = this.updateStateValue({ key, value, isTarget, previousState: this.state });
            this.setState(prevState => FormHelper.mergeWithoudField(prevState, newState));
            const flattenAsyncErrors = filterPromises(asyncErrors);
            if (innerPromise === currentPromise && flattenAsyncErrors.length !== 0) {
                Promise.all(asyncErrors).catch(errors => {
                    this.setState(prevState => {
                        const stateSlice = prevState[key];
                        const updatedStateSlice = this.setErrorsAndStatus({ stateSlice, isTarget, value, errors });
                        const updatedState = _extends({}, prevState, { [key]: updatedStateSlice });
                        return FormHelper.mergeWithoudField(prevState, updatedState);
                    });
                });
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
        return _extends({}, values, {
            valid,
            validateAll: this.validateAll
        });
    }

    render() {
        return this.props.render(this.prepareProps());
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