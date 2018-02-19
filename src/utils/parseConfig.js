//#region Import statements
import { findCircularDependency } from './circullarErrors';
import { FormItem } from '../components/FormItem';
import isEmpty from 'ramda/src/isEmpty';
import mapObjIndexed from 'ramda/src/mapObjIndexed';
import forEachObjIndexed from 'ramda/src/forEachObjIndexed';
import compose from 'ramda/src/compose';
//#endregion

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

const _parseConfig = compose(mapObjIndexed(value => FormItem.of(value)), flatten);

export const parseConfig = cfg => {
    const parsedConfig = _parseConfig(cfg);
    forEachObjIndexed((value, key, object) => {
        const withFields = value.findObjectDependencies();
        if (withFields.length !== 0) {
            withFields.forEach(updateDependenciesOfParsedConfig(object, key));
        }
    }, parsedConfig);
    if (process.env.NODE_ENV !== 'production') {
        findCircularDependency(parsedConfig);
    }
    return parsedConfig;
};

export const mergeConfigs = (targetConfig, previousConfig) =>
    mapObjIndexed((configItem, key) => {
        return key in previousConfig ? configItem.concat(previousConfig) : configItem;
    }, targetConfig);
