import {
  findCircularDependency,
  createDependencyMatrix
} from '../src/utils/circullarErrors'

describe('Creating matrix', () => {
  it('should create a true/false matrix', () => {
    const initialState = {
      login: {
        dependency: ['password']
      },
      email: {
        dependency: ['password']
      },
      passwordConfirm: {},
      password: {
        dependency: ['passwordConfirm']
      }
    }

    const expectedMatrix = [
      [false, false, true, false],
      [false, false, true, false],
      [false, false, false, true],
      [false, false, false, false]
    ]

    expect(createDependencyMatrix(initialState)).toEqual(expectedMatrix)
  })

  it('should create a true/false matrix with circular dependencies', () => {
    const initialState = {
      login: {
        dependency: ['email']
      },
      email: {},
      name: {
        dependency: ['name']
      },
      passwordConfirm: {
        dependency: ['amount']
      },
      password: {
        dependency: ['passwordConfirm', 'login']
      },
      amount: {
        dependency: ['password']
      }
    }
    const expectedMatrix = [
      [false, false, false, false, true, false],
      [false, false, false, false, false, false],
      [false, true, false, false, false, false],
      [false, false, false, true, false, false],
      [false, false, true, false, false, true],
      [true, false, false, false, false, false]
    ]

    expect(createDependencyMatrix(initialState)).toEqual(expectedMatrix)
  })
})

describe('Circular dependency searcher', () => {
  it('should not throw if no circular dependency has been found', () => {
    const initialState = {
      name: {},
      login: {
        dependency: ['name']
      }
    }
    expect(() => findCircularDependency(initialState)).not.toThrow()
  })
  it('should throw for one field with circular dependency', () => {
    const initialState = {
      name: {
        dependency: ['name']
      }
    }
    expect(() => findCircularDependency(initialState)).toThrow()
  })
  it('should find a circular dependencies', () => {
    const initialState = {
      login: {
        dependency: ['email']
      },
      email: {},
      passwordConfirm: {
        dependency: ['amount']
      },
      password: {
        dependency: ['passwordConfirm', 'login']
      },
      amount: {
        dependency: ['password']
      }
    }
    expect(() => findCircularDependency(initialState)).toThrow()
  })
})
