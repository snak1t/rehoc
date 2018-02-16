import parseValidationConfig from '../src/utils/parseConfig';

const rule = () => true;

const validationConfig = {
    login: {
        validators: [{ rule, message: '1' }, { rule, message: '2' }],
        initialValue: 'John'
    },
    email: {
        validators: [{ rule, message: 'email' }],
        required: false
    },
    password: {
        validators: [{ rule, message: '3', withFields: ['login'] }, { rule, message: '4', withFields: ['email'] }]
    },
    passwordConfirm: {
        validators: [{ rule, message: '5' }, { rule, message: '6', withFields: ['password'] }]
    }
};

const expectedOutput = {
    login: {
        value: 'John',
        errors: [],
        dependency: ['password'],
        required: true,
        status: {
            dirty: false,
            valid: false
        }
    },
    email: {
        value: '',
        errors: [],
        dependency: ['password'],
        required: false,
        status: {
            dirty: false,
            valid: true
        }
    },
    passwordConfirm: {
        value: '',
        errors: [],
        required: true,
        dependency: [],
        status: {
            dirty: false,
            valid: false
        }
    },
    password: {
        value: '',
        errors: [],
        dependency: ['passwordConfirm'],
        required: true,
        status: {
            dirty: false,
            valid: false
        }
    }
};

describe('Parsing validation config', () => {
    it('function should exist', () => {
        expect(parseValidationConfig).toBeDefined();
    });

    it('should accept a config as a paramater and return an object', () => {
        expect(parseValidationConfig(validationConfig)).toBeInstanceOf(Object);
    });

    it('should parse a config according to rules', () => {
        const configWithFormItems = parseValidationConfig(validationConfig);
        const parsedConfigKeys = Object.keys(configWithFormItems).sort();
        expect(parsedConfigKeys).toEqual(Object.keys(expectedOutput).sort());
    });
});
