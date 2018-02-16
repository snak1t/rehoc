import { FormItem } from '../../src/components/FormItem';

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
        validators: [
            { rule, message: '3', withFields: ['login'], async: true },
            { rule, message: '4', withFields: ['email'] }
        ]
    },
    passwordConfirm: {
        validators: [{ rule, message: '5' }, { rule, message: '6', withFields: ['password'] }]
    }
};

describe('Form Item Component: ', () => {
    it('should store initial value', () => {
        const login = validationConfig.login;
        const parsedLogin = FormItem.of(validationConfig.login);
        expect(parsedLogin.value).toBe(login.initialValue);
    });

    it('should store required status', () => {
        const login = validationConfig.login;
        const email = validationConfig.email;
        expect(FormItem.of(login).required).toBe(true);
        expect(FormItem.of(email).required).toBe(false);
    });

    it('should set initial status', () => {
        const login = FormItem.of(validationConfig.login);
        const email = FormItem.of(validationConfig.email);
        expect(login.status.dirty).toBe(false);
        expect(login.status.valid).toBe(false);
        expect(email.status.valid).toBe(true);
    });

    it('should set array of validators', () => {
        const login = FormItem.of(validationConfig.login);
        expect(login.validators).toEqual(validationConfig.login.validators);
    });

    it("shouldn't set async validators to array of sync validators", () => {
        const password = FormItem.of(validationConfig.password);
        const validators = validationConfig.password.validators.filter(validator => !validator.async);
        expect(password.validators.length).toBe(1);
        expect(password.validators).toEqual(validators);
    });

    it('should set async validators in its own array', () => {
        const password = FormItem.of(validationConfig.password);
        const validators = validationConfig.password.validators.filter(validator => !!validator.async);
        expect(password.validators.length).toBe(1);
        expect(password.asyncValidators).toEqual(validators);
    });
});
