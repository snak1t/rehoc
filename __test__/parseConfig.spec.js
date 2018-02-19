import { parseConfig as parseValidationConfig } from '../src/utils/parseConfig';

const rule = () => true;

const validationConfig = {
    userinfo: {
        __nested: true,
        login: {
            validators: [{ rule, message: '1' }, { rule, message: '2' }],
            initialValue: 'John'
        },
        email: {
            validators: [{ rule, message: 'email', withFields: ['dumb'] }],
            required: false
        }
    },
    password: {
        validators: [
            { rule, message: '3', withFields: ['userinfo.login'] },
            { rule, message: '4', withFields: ['userinfo.email'] }
        ]
    },
    passwordConfirm: {
        validators: [{ rule, message: '5' }, { rule, message: '6', withFields: ['password'] }]
    },
    dumb: {
        validators: [{ rule, message: '7', withFields: ['userinfo.login'] }]
    }
};

const expectedOutput = {
    'userinfo.login': {
        value: 'John',
        errors: [],
        dependency: ['password', 'dumb'],
        required: true,
        status: {
            dirty: false,
            valid: false
        }
    },
    'userinfo.email': {
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
    },
    dumb: {
        value: '',
        errors: [],
        dependency: [],
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

    fit('should parse a config according to rules', () => {
        const configWithFormItems = parseValidationConfig(validationConfig);
        expect(configWithFormItems['userinfo.login'].dependency).toEqual(expectedOutput['userinfo.login'].dependency);
        expect(configWithFormItems.dumb.dependency).toEqual(['userinfo.email']);
    });
});
