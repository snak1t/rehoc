React Forms Validation (rehoc-validator) (WIP)
======
[![Edit Rehoc Validator Example](https://img.shields.io/badge/CodeSandbox-demo-blue.svg)](https://codesandbox.io/s/qxNYvy53)
[![npm version](https://img.shields.io/npm/v/rehoc-validator.svg)](https://www.npmjs.com/package/rehoc-validator)

Rehoc-validator is a javascript library for React, for easily perform forms validation. It's a validation data layer that only provides information about validation state of each value. We don't provide validation input components etc. It's for you how to manage this data.
Currently rehoc-validator is in WIP stage.

### Installation
Use your favaourite package manager
```bash
npm install --save rehoc-validator
yarn add rehoc-validator
```

Basic usage
======
### Validation config
For performing validation we need to create a validation config
```javascript
import {minLength, email, pattern, sameAs, all } from 'rehoc-validator'

export const validationConfig = {
  login: {
    validators: [
      minLength(4, 'Login must be more than 4 characters'),
      {
        rule: (loginValue, done) => fetchUserForExistance(loginValue).then(result => done(result)),
        message: 'User with this login exists',
        async: true
      }
    ]
  },
  email: {
    validators: [email()],
    required: false
  },
  password: {
    validators: [
      all([
        minLength(2),
        pattern(/^[A-Z]/, 'Password must start with capital letter only')
      ])
    ]
  },
  passwordConfirm: {
    validators: [
      sameAs(['password'])
    ]
  }
}
```

Let's see what is a Validator object

### Validator
Each validator contains of at least two fields: rule and message.

`rule` is just a function that returns `true` if value is valid and `false` otherwise.

`message` - as you may guess a message that will be passed if rule evaluates to false.

Validator may also have additional properties:

`withFields` - an array of other fields name, if specified than values of this fields will be passed to rule function

```javascript
  {
    rule: (currentFieldValue, otherField1, otherField2) => {true}, //some logic
    message: 'Some message',
    withFields: ['otherField', 'oneMoreField']
  }
```

**Please note** that we check for circular dependency only in development mode and throw you an error. It's a bad decision to create a circular dependency. Currently `withFields` not working with async validations

`async` - if specified than to `rule` function a callback function will be passed. That function must be invoked with true or false values 

```javascript
{
  rule: (loginValue, done) => fetchUserForExistance(loginValue).then(result => done(result)),
  message: 'User with this login exists',
  async: true
}
```

**Please note** that if you provide an async property, then this validator will be executed *only* if your trigger change on this field.

`initialValue` - initial value for the field, the validation of this field will be triggered as forms render depsite the fact whether field is required or not. In future releases a new option will be added to override this behavior.

`required` - If this field is required to validate the whole form. Some fields may not be required but still you may want to add some validation logic into them. By default if you don't provide required field, each field will be explicitly set to required. And only if you pass `required: false` than it will be excluded from the list of required fields.

Some of the validators are so common, that we provide some validators such as:

1. minLength(value: number, message?: string)
2. pattern(value: RegExp, message?: string)
3. required(message?: string)
4. sameAs(fields: Array<string>, message)

Each validator is a pure function that returns a validation object (that was described above). You may write your own, or in case you think you find a common validation logic, please create an issue or submit a pull request.

### Validation options

Second parameter for validation is validation options. It's not a required parameter.

List of all options with defaults values
```javascript
 const validationOptions = {
   eager: false
 }
```

`eager` - if set to `true` than each validator will be triggered for the first time forms renders.


### Validation component

We have already created `validationConfig`, now we need to connect this config to our component:

```javascript
import React from "react";
import { validationConfig } from "./configs";
import { withValidation } from "rehoc-validator";

const SimpleForm = ({
  title,
  login,
  valid,
  email,
  password,
  passwordConfirm,
  validateAll
}) =>
  <div>
    <h2>
      {title}
    </h2>

    <form>
      Login{" "}
      <input
        type="text"
        name="login"
        value={login.value}
        onChange={login.handler}
      />
      <pre>{JSON.stringify(login)}</pre>
      Email{" "}
      <input
        type="email"
        name="email"
        value={email.value}
        onChange={email.handler}
      />
      <pre>{JSON.stringify(email)}</pre>
      Password{" "}
      <input
        type="password"
        name="password"
        value={password.value}
        onChange={password.handler}
      />
      <pre>{JSON.stringify(password)}</pre>
      Confirm{" "}
      <input
        type="password"
        name="passwordConfirm"
        value={passwordConfirm.value}
        onChange={passwordConfirm.handler}
      />
      <pre>{JSON.stringify(passwordConfirm)}</pre>
      <button onClick={validateAll}>Validate all values</button>
      <button type="submit" disabled={!valid}>
        Submit form
      </button>
    </form>
  </div>;

export default withValidation(validationConfig)(SimpleForm);
```

Each field that was described in validation config is passed down as objects with following properties:

1. `value` - fields value;
2. `errors` - Array<string> an array of errors messages
3. `status` - Object<{dirty: boolean, valid: boolean}>
4. `required` - boolean 

That's all.
