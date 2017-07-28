import parseValidationConfig from '../src/utils/parseConfig'

const rule = () => true

const validationConfig = {
  login: {
    validators: [{ rule, message: '1' }, { rule, message: '2' }],
    initialValue: 'John'
  },
  email: {
    validators: [{ rule, message: 'email' }]
  },
  password: {
    validators: [
      { rule, message: '3', withFields: ['login'] },
      { rule, message: '4', withFields: ['email'] }
    ]
  },
  passwordConfirm: {
    validators: [
      { rule, message: '5' },
      { rule, message: '6', withFields: ['password'] }
    ]
  }
}

const expectedOutput = {
  login: {
    value: 'John',
    errors: [],
    dependency: ['password'],
    status: {
      dirty: false,
      valid: false
    }
  },
  email: {
    value: '',
    errors: [],
    dependency: ['password'],
    status: {
      dirty: false,
      valid: false
    }
  },
  passwordConfirm: {
    value: '',
    errors: [],
    status: {
      dirty: false,
      valid: false
    }
  },
  password: {
    value: '',
    errors: [],
    dependency: ['passwordConfirm'],
    status: {
      dirty: false,
      valid: false
    }
  }
}

describe('Parsing validation config', () => {
  it('function should exist', () => {
    expect(parseValidationConfig).toBeDefined()
  })

  it('should accept a config as a paramater and return an object', () => {
    expect(parseValidationConfig(validationConfig)).toBeInstanceOf(Object)
  })

  it('should parse a config according to rules', () => {
    expect(parseValidationConfig(validationConfig)).toEqual(expectedOutput)
  })
})
