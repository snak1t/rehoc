import email from '../src/validators/email';
import minLength from '../src/validators/minLength';
import pattern from '../src/validators/pattern';
import sameAs from '../src/validators/sameAs';

describe('email validator', () => {
  it('should return true for valid email', () => {
    const result = email('').rule('re@hoc.com');
    expect(result).toEqual(true);
  });
  it('should return false for invalid email', () => {
    const result1 = email('').rule('rehoc@com');
    const result2 = email('').rule('rehoc@');
    const result3 = email('').rule('@com');
    const result4 = email('').rule('rehoc.com');
    expect(result1).toEqual(false);
    expect(result2).toEqual(false);
    expect(result3).toEqual(false);
    expect(result4).toEqual(false);
  });
});

describe('minLength validator', () => {
  const string = 'test';
  it('should return true for correct length', () => {
    const result = minLength(3, '').rule(string);
    expect(result).toEqual(true);
  });
  it('should return false for incorrect length', () => {
    const result0 = minLength(4, '').rule(string);
    const result1 = minLength(5, '').rule(string);
    expect(result0).toEqual(false);
    expect(result1).toEqual(false);
  });
});

describe('pattern validator', () => {
  const regExp = /^\d[a-z]/g;
  it('should return true for valid string', () => {
    const result = pattern(regExp, '').rule('1bc');
    expect(result).toEqual(true);
  });
  it('should return false for invalid string', () => {
    const result = pattern(regExp, '').rule('123');
    expect(result).toEqual(false);
  });
});

describe('sameAs validator', () => {
  const fields = {
    a: 'a',
    b: 'b'
  };
  it('should return true for the same values', () => {
    const result = sameAs(fields, '').rule({ a: 'a', b: 'b' });
    expect(result).toEqual(true);
  });
  it('should return false for different values', () => {
    const result = sameAs(fields, '').rule({ a: 'b', b: 'b' });
    expect(result).toEqual(true);
  });
});
