import React from 'react';
import { shallow, mount } from 'enzyme';
import { withValidation } from '../src/Validator';

const waiter = () =>
    new Promise((res, rej) => {
        setTimeout(() => res(), 2);
    });

const DummyForm = ({ login, asyncField }) => (
    <form>
        <input type="text" className="loginInput" value={login.value} onChange={login.handler} />
        <input type="text" className="asyncInput" value={asyncField.value} onChange={asyncField.handler} />
    </form>
);

const msg = 'Name must be John';
const validationConfig = {
    login: {
        validators: [{ rule: name => name === 'John', message: msg }]
    },
    asyncField: {
        validators: [
            {
                rule: (value, done) => setTimeout(() => done(value), 1),
                message: 'AsyncMsg',
                async: true
            }
        ]
    }
};

describe('Validator', () => {
    let component;
    let testForm;
    beforeAll(() => {
        const Component = withValidation(validationConfig)(DummyForm);
        component = mount(<Component />);
        testForm = component.find(DummyForm);
    });

    it('should exist', () => {
        expect(component.exists()).toEqual(true);
        expect(testForm.props()).toMatchSnapshot();
    });

    it('should update a string value', () => {
        const input = component.find('.loginInput');
        input.simulate('change', { target: { value: 'Sam' } });
        expect(testForm.props().login.value).toEqual('Sam');
    });

    it('should mark a field as dirty if changed', async () => {
        const input = component.find('.loginInput');
        input.simulate('change', { target: { value: 'John' } });
        await waiter();
        expect(testForm.props().login.status.dirty).toEqual(true);
    });

    it('should mark a field as valid if provided with valid value', async () => {
        const input = component.find('.loginInput');
        input.simulate('change', { target: { value: 'Sam' } });
        await waiter();
        expect(testForm.props().login.status.valid).toEqual(false);
        input.simulate('change', { target: { value: 'John' } });
        await waiter();
        expect(testForm.props().login.status.valid).toEqual(true);
    });

    it('should provide an error array if specified value is incorrect', async () => {
        const input = component.find('.loginInput');
        input.simulate('change', { target: { value: 'Sam' } });
        await waiter();
        expect(testForm.props().login.status.valid).toEqual(false);
        expect(testForm.props().login.errors).toBeInstanceOf(Array);
        expect(testForm.props().login.errors.length).toEqual(1);
        expect(testForm.props().login.errors[0]).toEqual(msg);
    });

    it('should also deal with async validations', async () => {
        const input = component.find('.asyncInput');
        input.simulate('change', { target: { value: true } });
        await waiter();
        expect(testForm.props().asyncField.status.valid).toEqual(true);
    });
});
