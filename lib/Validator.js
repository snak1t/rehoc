'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.withValidation = exports.Validator = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; //#region Import statements


var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _parseConfig = require('./utils/parseConfig');

var ConfigUtility = _interopRequireWildcard(_parseConfig);

var _formHelpers = require('./utils/form-helpers');

var FormHelper = _interopRequireWildcard(_formHelpers);

var _mapObjIndexed = require('ramda/src/mapObjIndexed');

var _mapObjIndexed2 = _interopRequireDefault(_mapObjIndexed);

var _forEachObjIndexed = require('ramda/src/forEachObjIndexed');

var _forEachObjIndexed2 = _interopRequireDefault(_forEachObjIndexed);

var _pathOr = require('ramda/src/pathOr');

var _pathOr2 = _interopRequireDefault(_pathOr);

var _isEmpty = require('ramda/src/isEmpty');

var _isEmpty2 = _interopRequireDefault(_isEmpty);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//#endregion

class Validator extends _react2.default.Component {

  constructor(props) {
    super(props);
    this.prepareHandlers = (0, _mapObjIndexed2.default)((cfg, key) => _extends({}, cfg, { handler: this.valueHandler(key) }));

    this.validateAll = () => {
      (0, _forEachObjIndexed2.default)((cfg, key) => cfg.handler(cfg.value), this.state.config);
    };

    this.updateStateValue = ({ valueDescriptor, previousState }) => {
      const [errors, asyncErrors] = FormHelper.performValidation({
        state: previousState,
        valueDescriptor
      });
      const updatedState = this.updateStateSlice(previousState, valueDescriptor, errors);
      const dependencies = updatedState[valueDescriptor.key].dependency;
      return !dependencies ? [updatedState, asyncErrors] : dependencies.reduce(this.stateReducer, [updatedState, asyncErrors]);
    };

    this.stateReducer = ([state, asyncErrors], key) => {
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

    const config = ConfigUtility.parseConfig(this.props.config);
    const configWithHandlers = this.prepareHandlers(config);
    this.state = {
      config: this.prepareHandlers(configWithHandlers)
    };
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
        const newConfig = ConfigUtility.parseConfig(nextProps.config);
        const configWithHandlers = this.prepareHandlers(newConfig);
        return { config: ConfigUtility.mergeConfigs(configWithHandlers, prevState) };
      });
    }
  }

  validateNotEmptyValues() {
    (0, _forEachObjIndexed2.default)((handler, key) => {
      const value = this.state.config[key].value;
      if (!(0, _isEmpty2.default)(value)) {
        handler(value);
      }
    }, this.handlers);
  }

  setErrorsAndStatus({ stateSlice, valueDescriptor, errors }) {
    const dirty = FormHelper.isDirty(stateSlice, valueDescriptor.isTarget);
    const valid = FormHelper.isValid(stateSlice, valueDescriptor.value, errors, dirty);
    const status = { dirty, valid };
    return _extends({}, stateSlice, {
      errors,
      value: valueDescriptor.value,
      status
    });
  }

  updateStateSlice(previousState, valueDescriptor, errors) {
    const stateSlice = previousState[valueDescriptor.key];
    const updatedStateSlice = this.setErrorsAndStatus({ stateSlice, valueDescriptor, errors });
    return _extends({}, previousState, { [valueDescriptor.key]: updatedStateSlice });
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
    return (0, _pathOr2.default)(data, ['target', 'value'], data);
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
    const valid = FormHelper.isFormValid(this.state.config);
    return _extends({}, ConfigUtility.unflatten(this.state.config), {
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