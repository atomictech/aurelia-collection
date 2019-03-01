import path from 'path';
import _ from 'lodash';

import babelOpts from '../.babelrc';

function base() {
  return Object.assign({}, _.cloneDeep(babelOpts), {
    filename: '',
    filenameRelative: '',
    sourceMap: true,
    sourceRoot: '',
    moduleRoot: path.resolve('src').replace(/\\/g, '/'),
    moduleIds: false,
    comments: false,
    compact: false,
    code: true
  });
}

function commonjs() {
  const options = base();
  options.plugins.push('@babel/transform-modules-commonjs');
  return options;
}

function amd() {
  const options = base();
  options.plugins.push('@babel/transform-modules-amd');
  return options;
}

function system() {
  const options = base();
  options.plugins.push('@babel/transform-modules-systemjs');
  return options;
}

function es2015() {
  const options = base();
  options.presets = [['@babel/preset-env', { targets: { esmodules: true } }]];
  return options;
}

export { base, commonjs, amd, system, es2015 };
