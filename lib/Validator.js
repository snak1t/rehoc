'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _parseConfig = require('./utils/parseConfig');

var _parseConfig2 = _interopRequireDefault(_parseConfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

exports.default = function (config) {
  return function (Component) {
    return function (_React$Component) {
      _inherits(Validator, _React$Component);

      function Validator(props) {
        _classCallCheck(this, Validator);

        var _this = _possibleConstructorReturn(this, (Validator.__proto__ || Object.getPrototypeOf(Validator)).call(this, props));

        _this.state = (0, _parseConfig2.default)(config);
        return _this;
      }

      _createClass(Validator, [{
        key: 'performAsyncValidation',
        value: function performAsyncValidation(rule, message, key, value) {
          var _this2 = this;

          var cb = function cb(result) {
            if (result) return;
            _this2.setState(function (prevState) {
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
          // Plan to add config for eager validation
          return field.status.dirty === false && !isTarget;
        }
      }, {
        key: 'collectErrors',
        value: function collectErrors(_ref) {
          var _this3 = this;

          var key = _ref.key,
              value = _ref.value,
              isTarget = _ref.isTarget,
              state = _ref.state;

          if (this.isNeedValidation(state[key], isTarget)) {
            return [];
          }
          var validators = config[key].validators;

          if (validators === void 0) {
            return [];
          }
          var errors = validators.reduce(function (errors, validator // Never perform destructure of validator (getter oneOf)
          ) {
            if (validator.async) {
              if (isTarget) {
                _this3.performAsyncValidation(validator.rule, validator.message, key, value);
              } else {
                if (state[key].errors.indexOf(validator.message) !== -1) {
                  return [].concat(_toConsumableArray(errors), [validator.message]);
                }
              }
              return errors;
            }
            var valid = validator.withFields !== void 0 ? validator.rule.apply(validator, [value].concat(_toConsumableArray(validator.withFields.map(function (key) {
              return state[key].value;
            })))) : validator.rule(value);
            return valid ? errors : [].concat(_toConsumableArray(errors), [validator.message]);
          }, []);
          return errors;
        }
      }, {
        key: 'updateStateValue',
        value: function updateStateValue(key, value, isTarget, state) {
          var _this4 = this;

          var errors = this.collectErrors({
            key: key,
            value: value,
            isTarget: isTarget,
            state: state
          });
          var stateSlice = _extends({}, state[key], {
            value: value,
            errors: errors,
            status: {
              dirty: state[key].status.dirty || isTarget,
              valid: errors.length === 0
            }
          });
          var updatedState = _extends({}, state, _defineProperty({}, key, stateSlice));
          return !updatedState[key].dependency ? updatedState : updatedState[key].dependency.reduce(function (state, key) {
            return _this4.updateStateValue(key, state[key].value, false, state);
          }, updatedState);
        }
      }, {
        key: 'valueHandler',
        value: function valueHandler(key) {
          var _this5 = this;

          return function (data) {
            var value = data && data.target ? data.target.value : data;

            _this5.setState(function (pState) {
              return _this5.updateStateValue(key, value, true, pState);
            });
          };
        }
      }, {
        key: 'isInvalidField',
        value: function isInvalidField(field) {
          return !field.status.valid || !field.status.dirty;
        }
      }, {
        key: 'prepareProps',
        value: function prepareProps() {
          var props = {};
          var valid = true;
          for (var key in this.state) {
            if (this.isInvalidField(this.state[key])) {
              valid = false;
            }
            props[key] = _extends({}, this.state[key], {
              handler: this.valueHandler(key)
            });
          }
          props.valid = valid;
          return props;
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