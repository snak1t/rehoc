'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _isEmpty = require('is-empty');

var _isEmpty2 = _interopRequireDefault(_isEmpty);

var _parseConfig = require('./utils/parseConfig');

var _parseConfig2 = _interopRequireDefault(_parseConfig);

var _mapObject = require('./utils/mapObject');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

exports.default = function (config) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { eager: false };
  return function (Component) {
    return function (_React$Component) {
      _inherits(Validator, _React$Component);

      function Validator(props) {
        _classCallCheck(this, Validator);

        var _this = _possibleConstructorReturn(this, (Validator.__proto__ || Object.getPrototypeOf(Validator)).call(this, props));

        _this.state = (0, _parseConfig2.default)(config);
        _this.handlers = _this.prepareHandlers(_this.state);
        _this.validateAll = _this.validateAll.bind(_this);
        return _this;
      }

      _createClass(Validator, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
          if (options.eager) {
            this.validateAll();
          }
          this.validateNotEmptyValues();
        }
      }, {
        key: 'prepareHandlers',
        value: function prepareHandlers(state) {
          var _this2 = this;

          return (0, _mapObject.mapObject)(state, function (_, key) {
            return _this2.valueHandler(key);
          });
        }
      }, {
        key: 'validateAll',
        value: function validateAll() {
          var _this3 = this;

          (0, _mapObject.mapObject)(this.handlers, function (handler, key) {
            return handler(_this3.state[key].value);
          });
        }
      }, {
        key: 'validateNotEmptyValues',
        value: function validateNotEmptyValues() {
          var _this4 = this;

          (0, _mapObject.mapObject)(this.handlers, function (handler, key) {
            if (!(0, _isEmpty2.default)(_this4.state[key].value)) {
              handler(_this4.state[key].value);
            }
          });
        }
      }, {
        key: 'performAsyncValidation',
        value: function performAsyncValidation(rule, message, key, value) {
          var _this5 = this;

          var cb = function cb(result) {
            if (result) return;
            _this5.setState(function (prevState) {
              var errors = [].concat(_toConsumableArray(prevState[key].errors), [message]);
              var stateSlice = _extends({}, prevState[key], { errors: errors });
              return _extends({}, prevState, _defineProperty({}, key, stateSlice));
            });
          };
          return rule(value, cb);
        }
      }, {
        key: 'isNeedValidation',
        value: function isNeedValidation(field, isTarget) {
          return field.status.dirty === false && !isTarget;
        }
      }, {
        key: 'handleAsyncValidation',
        value: function handleAsyncValidation(_ref) {
          var validator = _ref.validator,
              key = _ref.key,
              value = _ref.value,
              isTarget = _ref.isTarget,
              errors = _ref.errors,
              state = _ref.state;

          if (!isTarget && state[key].errors.indexOf(validator.message) !== -1) {
            return [].concat(_toConsumableArray(errors), [validator.message]);
          }
          this.performAsyncValidation(validator.rule, validator.message, key, value);
          return errors;
        }
      }, {
        key: 'handleSyncValidation',
        value: function handleSyncValidation(_ref2) {
          var validator = _ref2.validator,
              key = _ref2.key,
              value = _ref2.value,
              errors = _ref2.errors,
              state = _ref2.state;

          var valid = validator.withFields ? validator.rule.apply(validator, [value].concat(_toConsumableArray(validator.withFields.map(function (key) {
            return state[key].value;
          })))) : validator.rule(value);
          return valid ? errors : [].concat(_toConsumableArray(errors), [validator.message]);
        }
      }, {
        key: 'collectErrors',
        value: function collectErrors(_ref3) {
          var _this6 = this;

          var key = _ref3.key,
              value = _ref3.value,
              isTarget = _ref3.isTarget,
              state = _ref3.state;
          var validators = config[key].validators;


          if (this.isNeedValidation(state[key], isTarget) || !state[key].required && (0, _isEmpty2.default)(value) || validators === void 0) {
            return [];
          }

          var errors = validators.reduce(function (errors, validator // Never perform destructure of validator (getter oneOf)
          ) {
            return validator.async ? _this6.handleAsyncValidation({
              validator: validator,
              key: key,
              value: value,
              isTarget: isTarget,
              errors: errors,
              state: state
            }) : _this6.handleSyncValidation({
              validator: validator,
              key: key,
              value: value,
              errors: errors,
              state: state
            });
          }, []);
          return errors;
        }
      }, {
        key: 'updateStateValue',
        value: function updateStateValue(key, value, isTarget, state) {
          var _this7 = this;

          var errors = this.collectErrors({
            key: key,
            value: value,
            isTarget: isTarget,
            state: state
          });
          var dirty = state[key].status.dirty || isTarget;
          var valid = !(!state[key].required && (0, _isEmpty2.default)(value)) ? errors.length === 0 && dirty : true;
          var stateSlice = _extends({}, state[key], {
            value: value,
            errors: errors,
            status: {
              dirty: dirty,
              valid: valid
            }
          });
          var updatedState = _extends({}, state, _defineProperty({}, key, stateSlice));
          return !updatedState[key].dependency ? updatedState : updatedState[key].dependency.reduce(function (state, key) {
            return _this7.updateStateValue(key, state[key].value, false, state);
          }, updatedState);
        }

        /**
         * Creates functions bound to a specific parts of state keys
         * 
         * @param {string} key 
         * @returns {Function}
         */

      }, {
        key: 'valueHandler',
        value: function valueHandler(key) {
          var _this8 = this;

          return function (data) {
            var value = data && data.target && data.target.value !== undefined ? data.target.value : data;

            _this8.setState(function (previousState) {
              return _this8.updateStateValue(key, value, true, previousState);
            });
          };
        }

        /**
         * Check validity of the field
         * 
         * @param {InputType} field 
         * @returns {boolean} 
         */

      }, {
        key: 'isValidField',
        value: function isValidField(field) {
          return field.status.valid;
        }

        /**
         * Created props that will be passed to wrapped Component
         * 
         * @returns {Output} 
         */

      }, {
        key: 'prepareProps',
        value: function prepareProps() {
          var _this9 = this;

          var valid = true;
          var values = (0, _mapObject.mapObject)(this.state, function (value, key) {
            if (!_this9.isValidField(value)) {
              valid = false;
            }
            return _extends({}, value, {
              handler: _this9.handlers[key]
            });
          });
          return _extends({}, values, {
            valid: valid,
            validateAll: this.validateAll
          });
        }
      }, {
        key: 'render',
        value: function render() {
          return _react2.default.createElement(Component, _extends({}, this.props, this.prepareProps()));
        }
      }]);

      return Validator;
    }(_react2.default.Component);
  };
};