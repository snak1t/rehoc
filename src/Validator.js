//#region Import statements
import React from 'react';
import * as ConfigUtility from './utils/parseConfig';
import * as FormHelper from './utils/form-helpers';
import { mapRecursively } from './utils/mapRecursively';
import { forEachRecursively } from './utils/forEachRecuresively';
import pathOr from 'ramda/src/pathOr';
import isEmpty from 'ramda/src/isEmpty';
import lensPath from 'ramda/src/lensPath';
import over from 'ramda/src/over';
import view from 'ramda/src/view';
import path from 'ramda/src/path';
import evolve from 'ramda/src/evolve';
import compose from 'ramda/src/compose';
import { FormItem } from './components/FormItem';
import { Key } from './components/keys';
//#endregion

export class Validator extends React.Component {
  static defaultProps = {
    options: {
      eager: false
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      config: this.parseConfig(props)
    };
  }

  componentDidMount() {
    if (this.props.options.eager) {
      this.validateAll();
    }
    this.validateNotEmptyValues();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.config !== this.props.config) {
      this.setState(
        evolve({
          config: ConfigUtility.mergeConfigs(this.parseConfig(nextProps))
        })
      );
    }
  }

  parseConfig = compose(
    mapRecursively(FormHelper.isFormItem, (cfg, _, compoundKey) => ({
      ...cfg,
      handler: this.valueHandler(compoundKey)
    })),
    ConfigUtility.parseConfig,
    path(['config'])
  );

  validateAll = () => forEachRecursively(FormHelper.isFormItem, cfg => cfg.handler(cfg.value))(this.state.config);

  validateNotEmptyValues() {
    forEachRecursively(FormHelper.isFormItem, cfgItem => {
      if (!isEmpty(cfgItem.value)) {
        cfgItem.handler(cfgItem.value);
      }
    });
  }

  setErrorsAndStatus = ({ valueDescriptor, errors }) => stateSlice => {
    const dirty = FormHelper.isDirty(stateSlice, valueDescriptor.isTarget);
    const valid = FormHelper.isValid(stateSlice, valueDescriptor.value, errors, dirty);
    const status = { dirty, valid };
    return {
      ...stateSlice,
      errors,
      value: valueDescriptor.value,
      status
    };
  };

  updateStateValue = ({ valueDescriptor, previousState }) => {
    const [errors, asyncErrors] = FormHelper.performValidation({
      state: previousState,
      valueDescriptor
    });
    const lens = lensPath(valueDescriptor.key.value);
    const updatedState = over(lens, this.setErrorsAndStatus({ valueDescriptor, errors }), previousState);
    const dependencies = view(lens, updatedState).dependency;
    return dependencies.length === 0
      ? [updatedState, asyncErrors]
      : dependencies.reduce(this.stateReducer, [updatedState, asyncErrors]);
  };

  stateReducer = ([state, asyncErrors], key) => {
    const keyHelper = Key(key);
    const [updatedState, _asyncErrors] = this.updateStateValue({
      valueDescriptor: {
        key: keyHelper,
        value: keyHelper.append('value').execute(state),
        isTarget: false
      },
      previousState: state
    });
    return [updatedState, [...asyncErrors, _asyncErrors]];
  };

  updateStateSlice(previousState, valueDescriptor, errors) {
    const lens = lensPath(valueDescriptor.key.value);
    return over(lens, this.setErrorsAndStatus({ valueDescriptor, errors }), previousState);
  }

  /**
   * Creates functions bound to a specific parts of state keys
   *
   * @param {string} key
   * @returns {Function}
   */
  valueHandler(key) {
    let currentPromise = 0;
    return data => {
      const valueDescriptor = { value: this.getRawOrEventValue(data), isTarget: true, key: Key(key) };
      const path = valueDescriptor.key.prepend('config').append('value').value;
      this.setState(FormHelper.updateValue(path, valueDescriptor.value));
      const innerPromise = ++currentPromise;
      const [newState, asyncErrors] = this.updateStateValue({
        valueDescriptor,
        previousState: this.state.config
      });
      this.setState(prevState => ({ config: FormHelper.mergeWithoutField(prevState.config, newState) }));
      const filteredAsyncErrors = FormHelper.filterPromises(asyncErrors);
      if (innerPromise === currentPromise && filteredAsyncErrors.length !== 0) {
        this.runAsync(filteredAsyncErrors, valueDescriptor);
      }
    };
  }

  getRawOrEventValue(data) {
    return pathOr(data, ['target', 'value'], data);
  }

  runAsync(asyncErrors, valueDescriptor) {
    Promise.all(asyncErrors).catch(errors => {
      this.setState(prevState => {
        const updatedState = this.updateStateSlice(prevState.config, valueDescriptor, errors);
        return { config: FormHelper.mergeWithoutField(prevState.config, updatedState) };
      });
    });
  }

  /**
   * Created props that will be passed to wrapped Component
   *
   * @returns {Output}
   */
  collectFormValues() {
    return {
      ...this.state.config,
      valid: FormHelper.isFormValid(this.state.config),
      validateAll: this.validateAll
    };
  }

  render() {
    return this.props.render(this.collectFormValues());
  }
}

export const withValidation = (config, options = { eager: false }) => Component => {
  const HelperComponent = props => (
    <Validator config={config} options={options} render={args => <Component {...props} {...args} />} />
  );
  HelperComponent.displayName = `withValidation(${Component.displayName || Component.name})`;
  return HelperComponent;
};
