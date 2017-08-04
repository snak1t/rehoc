'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

exports.default = function () {
  var validators = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

  if (validators.length === 0) {
    return { rule: function rule() {
        return true;
      }, message: '' };
  }

  if (process.env.NODE_ENV !== 'production') {
    if (validators.findIndex(function (v) {
      return v.async === true;
    }) !== -1) {
      throw new Error('Do not place async validator into all method');
    }
  }

  var validatorObject = {
    index: -1,
    multiple: true,
    rule: function rule() {
      for (var _len = arguments.length, inputs = Array(_len), _key = 0; _key < _len; _key++) {
        inputs[_key] = arguments[_key];
      }

      var errors = validators.reduce(function (errors, _ref) {
        var rule = _ref.rule,
            message = _ref.message;
        return rule.apply(undefined, _toConsumableArray(inputs)) ? errors : [].concat(_toConsumableArray(errors), [message]);
      }, []);
      this.message = errors;
      return errors.length === 0;
    },

    message: []
  };

  return validatorObject;
};