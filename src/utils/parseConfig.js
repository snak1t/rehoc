import { findCircularDependency } from './circullarErrors';
import isEmpty from 'is-empty';
import { FormItem } from '../components/FormItem';

const updateDependenciesOfParsedConfig = (parsedConfig, baseField) => field => {
    if (parsedConfig[field] !== void 0) {
        return parsedConfig[field].addDependency(baseField);
    }
    parsedConfig[field] = FormItem.of().addDependency(baseField);
};

const _flatten = (cfg, key) => {
    let fcfg = {};
    let rKey = key === '' ? key : key + '.';

    for (let i in cfg) {
        if (cfg[i].__nested !== true) {
            if (i !== '__nested') {
                fcfg[rKey + i] = cfg[i];
            }
        } else {
            Object.assign(fcfg, _flatten(cfg[i], rKey + i));
        }
    }

    return fcfg;
};

export const flatten = cfg => {
    return _flatten(cfg, '');
};

export const unflatten = cfg => {
    const pcfg = {};
    Object.entries(cfg).forEach(([key, value]) => {
        const parsedKey = key.split('.');
        let currentF = pcfg;
        while (parsedKey.length !== 1) {
            const k = parsedKey.shift();
            if (pcfg[k] === void 0) {
                pcfg[k] = {};
            }
            currentF = pcfg[k];
        }
        currentF[parsedKey[0]] = value;
    });
    return pcfg;
};

export const parseConfig = cfg => {
    const config = flatten(cfg);
    let parsedConfig = {};
    for (let key in config) {
        const form = FormItem.of(config[key]);
        parsedConfig[key] = form;
    }
    Object.entries(parsedConfig).map(([key, value]) => {
        const withFields = value.findObjectDependencies();
        if (withFields.length !== 0) {
            withFields.forEach(updateDependenciesOfParsedConfig(parsedConfig, key));
        }
    });
    if (process.env.NODE_ENV !== 'production') {
        findCircularDependency(parsedConfig);
    }
    return parsedConfig;
};
