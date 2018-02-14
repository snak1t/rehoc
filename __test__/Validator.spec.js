import React from 'react';
import { shallow, mount } from 'enzyme';
import { withValidation } from '../src/Validator';

const waiter = () =>
    new Promise((res, rej) => {
        setTimeout(() => res(), 500);
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
                rule: (value, done) => setTimeout(() => done(value), 100),
                message: 'AsyncMsg',
                async: true
            }
        ]
    }
};

describe('Validator', () => {
    it('should exist', () => {
        const Component = withValidation(validationConfig)(DummyForm);
        const component = mount(<Component />);
        const testForm = component.find(DummyForm);
        expect(component.exists()).toEqual(true);
        expect(testForm.props()).toMatchSnapshot();
    });

    it('should update a string value', () => {
        const Component = withValidation(validationConfig)(DummyForm);
        const component = mount(<Component />);
        const testForm = component.find(DummyForm);
        const input = component.find('.loginInput');
        input.simulate('change', { target: { value: 'Sam' } });
        expect(testForm.props().login.value).toEqual('Sam');
    });

    it('should mark a field as dirty if changed', async () => {
        const Component = withValidation(validationConfig)(DummyForm);
        const component = mount(<Component />);
        const testForm = component.find(DummyForm);
        const input = component.find('.loginInput');
        input.simulate('change', { target: { value: 'John' } });
        await waiter();
        expect(testForm.props().login.status.dirty).toEqual(true);
    });

    it('should mark a field as valid if provided with valid value', async () => {
        const Component = withValidation(validationConfig)(DummyForm);
        const component = mount(<Component />);
        const testForm = component.find(DummyForm);
        const input = component.find('.loginInput');
        input.simulate('change', { target: { value: 'Sam' } });
        await waiter();
        expect(testForm.props().login.status.valid).toEqual(false);
        input.simulate('change', { target: { value: 'John' } });
        await waiter();
        expect(testForm.props().login.status.valid).toEqual(true);
    });

    it('should provide an error array if specified value is incorrect', async () => {
        const Component = withValidation(validationConfig)(DummyForm);
        const component = mount(<Component />);
        const testForm = component.find(DummyForm);
        const input = component.find('.loginInput');
        input.simulate('change', { target: { value: 'Sam' } });
        await waiter();
        expect(testForm.props().login.status.valid).toEqual(false);
        expect(testForm.props().login.errors).toBeInstanceOf(Array);
        expect(testForm.props().login.errors.length).toEqual(1);
        expect(testForm.props().login.errors[0]).toEqual(msg);
    });

    it('should also deal with async validations', async () => {
        const Component = withValidation(validationConfig)(DummyForm);
        const component = mount(<Component />);
        const testForm = component.find(DummyForm);
        const input = component.find('.asyncInput');
        input.simulate('change', { target: { value: true } });
        await waiter();
        expect(testForm.props().asyncField.status.valid).toEqual(true);
    });
});
