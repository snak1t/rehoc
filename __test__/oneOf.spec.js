import oneOf from '../src/utils/oneOf'

const rules = [
  { rule: x => x > 3, message: 'msg1' },
  { rule: x => x < 1000, message: 'msg2' },
  { rule: x => x % 2 !== 0, message: 'msg3' }
]

describe('OneOf utility for validators composition', () => {
  it('must be defined', () => {
    expect(oneOf).toBeDefined()
  })

  it('must return object with rule and message defined', () => {
    const validator = oneOf([])
    expect(validator.rule).toBeDefined()
    expect(typeof validator.rule).toBe('function')
    expect(validator.message).toBeDefined()
    expect(typeof validator.message).toBe('string')
  })

  it('if no validators specified it must return function that evaluates to true for all paramater', () => {
    const validator = oneOf()
    expect(validator.rule(1)).toEqual(true)
    expect(validator.rule('asdf')).toEqual(true)
    expect(validator.rule(null)).toEqual(true)
    expect(validator.rule(undefined)).toEqual(true)
    expect(validator.rule(false)).toEqual(true)
    expect(validator.rule({ a: 1 })).toEqual(true)
    expect(validator.rule(Symbol('123'))).toEqual(true)
  })

  it('must return message of first validator if its rule returns false', () => {
    const validator = oneOf(rules)
    expect(validator.rule(2)).toEqual(false)
    expect(validator.message).toEqual('msg1')
  })

  it('must return message of the second validator if its rule returns false', () => {
    const validator = oneOf(rules)
    expect(validator.rule(1200)).toEqual(false)
    expect(validator.message).toEqual('msg2')
  })

  it('must return message of the third validator if its rule returns false', () => {
    const validator = oneOf(rules)
    expect(validator.rule(102)).toEqual(false)
    expect(validator.message).toEqual('msg3')
  })

  it('must return empty message if all validators pass', () => {
    const validator = oneOf(rules)
    expect(validator.rule(101)).toEqual(true)
    expect(validator.message).toEqual('')
  })
})
