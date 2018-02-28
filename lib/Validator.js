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

var _mapRecursively = require('./utils/mapRecursively');

var _forEachRecuresively = require('./utils/forEachRecuresively');

var _pathOr = require('ramda/src/pathOr');

var _pathOr2 = _interopRequireDefault(_pathOr);

var _has = require('ramda/src/has');

var _has2 = _interopRequireDefault(_has);

var _isEmpty = require('ramda/src/isEmpty');

var _isEmpty2 = _interopRequireDefault(_isEmpty);

var _lensPath = require('ramda/src/lensPath');

var _lensPath2 = _interopRequireDefault(_lensPath);

var _over = require('ramda/src/over');

var _over2 = _interopRequireDefault(_over);

var _view = require('ramda/src/view');

var _view2 = _interopRequireDefault(_view);

var _path = require('ramda/src/path');

var _path2 = _interopRequireDefault(_path);

var _FormItem = require('./components/FormItem');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//#endregion

class Validator extends _react2.default.Component {

  constructor(props) {
    super(props);
    this.attachHandlertsToConfig = (0, _mapRecursively.mapRecursively)(FormHelper.isFormItem, (cfg, _, compoundKey) => _extends({}, cfg, {
      handler: this.valueHandler(compoundKey)
    }));

    this.validateAll = () => (0, _forEachRecuresively.forEachRecursively)(FormHelper.isFormItem, cfg => cfg.handler(cfg.value))(this.state.config);

    this.setErrorsAndStatus = ({ valueDescriptor, errors }) => stateSlice => {
      const dirty = FormHelper.isDirty(stateSlice, valueDescriptor.isTarget);
      const valid = FormHelper.isValid(stateSlice, valueDescriptor.value, errors, dirty);
      const status = { dirty, valid };
      return _extends({}, stateSlice, {
        errors,
        value: valueDescriptor.value,
        status
      });
    };

    this.updateStateValue = ({ valueDescriptor, previousState }) => {
      const [errors, asyncErrors] = FormHelper.performValidation({
        state: previousState,
        valueDescriptor
      });
      const lens = (0, _lensPath2.default)(valueDescriptor.key);
      const updatedState = (0, _over2.default)(lens, this.setErrorsAndStatus({ valueDescriptor, errors }), previousState);
      const dependencies = (0, _view2.default)(lens, updatedState).dependency;
      return dependencies.length === 0 ? [updatedState, asyncErrors] : dependencies.reduce(this.stateReducer, [updatedState, asyncErrors]);
    };

    this.stateReducer = ([state, asyncErrors], key) => {
      const keyArray = key.split('.');
      const [updatedState, _asyncErrors] = this.updateStateValue({
        valueDescriptor: {
          key: keyArray,
          value: (0, _path2.default)([...keyArray, 'value'], state),
          isTarget: false
        },
        previousState: state
      });
      return [updatedState, [...asyncErrors, _asyncErrors]];
    };

    const config = ConfigUtility.parseConfig(this.props.config);
    this.state = {
      config: this.attachHandlertsToConfig(config)
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
        const configWithHandlers = this.attachHandlertsToConfig(newConfig);
        return { config: ConfigUtility.mergeConfigs(configWithHandlers, prevState) };
      });
    }
  }

  validateNotEmptyValues() {
    (0, _forEachRecuresively.forEachRecursively)(FormHelper.isFormItem, cfgItem => {
      if (!_isEmpty2.default) {
        cfgItem.handler(cfgItem.value);
      }
    });
  }

  updateStateSlice(previousState, valueDescriptor, errors) {
    const lens = (0, _lensPath2.default)(valueDescriptor.key);
    return (0, _over2.default)(lens, this.setErrorsAndStatus({ valueDescriptor, errors }), previousState);
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
      const valueDescriptor = { value: this.getRawOrEventValue(data), isTarget: true, key: key.split('.') };
      this.setState(FormHelper.updateValue(['config', ...valueDescriptor.key, 'value'], valueDescriptor.value));
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
    return _extends({}, this.state.config, {
      valid: FormHelper.isFormValid(this.state.config),
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