import { findCircularDependency } from './circullarErrors';
import isEmpty from 'is-empty';
import { FormItem } from '../components/FormItem';

const updateDependenciesOfParsedConfig = (parsedConfig, baseField) => field => {
    if (parsedConfig[field] !== void 0) {
        return parsedConfig[field].addDependency(baseField);
    }
    parsedConfig[field] = FormItem.of().addDependency(baseField);
};

export default config => {
    let parsedConfig = {};
    for (let key in config) {
        const form = FormItem.of(config[key]);
        const withFields = form.findObjectDependencies(config[key]);
        if (withFields.length !== 0) {
            withFields.forEach(updateDependenciesOfParsedConfig(parsedConfig, key));
        }
        parsedConfig[key] = form;
    }
    if (process.env.NODE_ENV !== 'production') {
        findCircularDependency(parsedConfig);
    }
    return parsedConfig;
};
