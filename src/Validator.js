//#region Import statements
import React from 'react';
import * as ConfigUtility from './utils/parseConfig';
import * as FormHelper from './utils/form-helpers';
import { mapRecursively } from './utils/mapRecursively';
import { forEachRecursively } from './utils/forEachRecuresively';
import isEmpty from 'ramda/src/isEmpty';
import lensPath from 'ramda/src/lensPath';
import over from 'ramda/src/over';
import view from 'ramda/src/view';
import path from 'ramda/src/path';
import evolve from 'ramda/src/evolve';
import tap from 'ramda/src/tap';
import compose from 'ramda/src/compose';
import { FormItem } from './components/FormItem';
import { Key } from './components/keys';
import * as VD from './components/ValueDescriptor';
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
      return this.validateAll();
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
    mapRecursively(FormHelper.isFormItem, (cfg, _, compoundKey) => cfg.setHandler(this.valueHandler(compoundKey))),
    ConfigUtility.parseConfig,
    path(['config'])
  );

  validateAll = () => forEachRecursively(FormHelper.isFormItem, cfg => cfg.handler(cfg.value))(this.state.config);

  validateNotEmptyValues() {
    forEachRecursively(FormHelper.isFormItem, cfgItem => {
      if (!isEmpty(cfgItem.value)) {
        cfgItem.handler(cfgItem.value);
      }
    })(this.state.config);
  }

  setErrorsAndStatus = ({ valueDescriptor, errors }) => formItem =>
    formItem.setErrorsAndStatus(valueDescriptor, errors);

  updateStateValue = ({ valueDescriptor, previousState }) => {
    const [errors, asyncErrors] = FormHelper.performValidation({
      state: previousState,
      valueDescriptor
    });
    const lens = lensPath(VD.key(valueDescriptor));
    const updatedState = over(lens, this.setErrorsAndStatus({ valueDescriptor, errors }), previousState);
    const dependencies = view(lens, updatedState).dependency;
    return dependencies.length === 0
      ? [updatedState, asyncErrors]
      : dependencies.reduce(this.dependencyStateReducer, [updatedState, asyncErrors]);
  };

  dependencyStateReducer = ([state, asyncErrors], key) => {
    const keyHelper = Key(key);
    const valueDescriptor = {
      key: keyHelper,
      value: keyHelper.append('value').execute(state),
      isTarget: false
    };
    const [updatedState, _asyncErrors] = this.updateStateValue({
      valueDescriptor,
      previousState: state
    });
    return [updatedState, [...asyncErrors, _asyncErrors]];
  };

  updateStateSlice(previousState, valueDescriptor, errors) {
    const lens = lensPath(VD.key(valueDescriptor));
    return over(lens, this.setErrorsAndStatus({ valueDescriptor, errors }), previousState);
  }

  valueHandler(key) {
    let currentPromise = 0;
    return value => {
      const valueDescriptor = VD.of({ value, isTarget: true, key });
      const innerPromise = ++currentPromise;
      const [newState, asyncErrors] = this.updateStateValue({
        valueDescriptor,
        previousState: this.state.config
      });
      this.setState(
        evolve({
          config: FormHelper.updateConfig(newState, valueDescriptor)
        })
      );
      const filteredAsyncErrors = FormHelper.filterPromises(asyncErrors);
      if (innerPromise === currentPromise && filteredAsyncErrors.length !== 0) {
        this.runAsync(filteredAsyncErrors, valueDescriptor);
      }
    };
  }

  runAsync(asyncErrors, valueDescriptor) {
    Promise.all(asyncErrors).catch(errors => {
      const updatedState = this.updateStateSlice(this.state.config, valueDescriptor, errors);
      this.setState(evolve({ config: FormHelper.mergeWithoutField(updatedState) }));
    });
  }

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
