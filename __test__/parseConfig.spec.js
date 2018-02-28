import { parseConfig as parseValidationConfig } from '../src/utils/parseConfig';
import { FormItem } from '../src/components/FormItem';
import { nested } from '../src/utils/nested';

const rule = () => true;

const login = {
  validators: [{ rule, message: '1' }, { rule, message: '2' }],
  initialValue: 'John'
};
const email = {
  validators: [{ rule, message: 'email', withFields: ['dumb'] }],
  required: false
};
const password = {
  validators: [
    { rule, message: '3', withFields: ['userInfo.login'] },
    { rule, message: '4', withFields: ['userInfo.email'] }
  ]
};

const passwordConfirm = {
  validators: [{ rule, message: '5' }, { rule, message: '6', withFields: ['password'] }]
};

const dumb = {
  validators: [{ rule, message: '7', withFields: ['userInfo.login'] }]
};

const validationConfig = {
  userInfo: nested({
    login,
    email
  }),
  password,
  passwordConfirm,
  dumb
};

const expectedOutput = {
  userInfo: {
    login: FormItem.of(login),
    email: FormItem.of(email)
  },
  passwordConfirm: FormItem.of(passwordConfirm),
  password: FormItem.of(password),
  dumb: FormItem.of(dumb)
};

describe('Parsing validation config', () => {
  it('function should exist', () => {
    expect(parseValidationConfig).toBeDefined();
  });

  it('should accept a config as a parameter and return an object', () => {
    expect(parseValidationConfig(validationConfig)).toBeInstanceOf(Object);
  });

  it('should parse a config according to rules', () => {
    const configWithFormItems = parseValidationConfig(validationConfig);
    expect(configWithFormItems.userInfo.login.dependency).toEqual(['password', 'dumb']);
    expect(configWithFormItems.dumb.dependency).toEqual(['userInfo.email']);
  });
});
