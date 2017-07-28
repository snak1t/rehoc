'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var emailRegExp = /^(?:(?:[\w`~!#$%^&*\-=+;:{}'|,?\/]+(?:(?:\.(?:"(?:\\?[\w`~!#$%^&*\-=+;:{}'|,?\/\.()<>\[\] @]|\\"|\\\\)*"|[\w`~!#$%^&*\-=+;:{}'|,?\/]+))*\.[\w`~!#$%^&*\-=+;:{}'|,?\/]+)?)|(?:"(?:\\?[\w`~!#$%^&*\-=+;:{}'|,?\/\.()<>\[\] @]|\\"|\\\\)+"))@(?:[a-zA-Z\d\-]+(?:\.[a-zA-Z\d\-]+)*|\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\])\.{1}[a-zA-Z]{1,7}$/;

exports.default = function () {
  var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'Email is incorrect';
  return {
    rule: function rule(value) {
      return emailRegExp.test(value);
    },
    message: message
  };
};