'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var validators = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

  if (validators.length === 0) {
    return { rule: function rule() {
        return true;
      }, message: '' };
  }

  var validatorObject = {
    index: -1,
    rule: function rule() {
      var success = true;
      var i = 0;
      while ((success = (_validators$i = validators[i]).rule.apply(_validators$i, arguments)) && i < validators.length - 1) {
        var _validators$i;

        i += 1;
      }
      this.index = success ? -1 : i;
      return success;
    },

    get message() {
      return this.index === -1 ? '' : validators[this.index].message;
    }
  };

  return validatorObject;
};