import path from 'path';

function base() {
  return {
    filename: '',
    filenameRelative: '',
    sourceMap: true,
    sourceRoot: '',
    moduleRoot: path.resolve('src').replace(/\\/g, '/'),
    moduleIds: false,
    comments: false,
    compact: false,
    code: true,
    presets: [['@babel/env', { targets: { browsers: ['last 2 versions'] } }], '@babel/stage-1'],
    plugins: [
      '@babel/syntax-flow',
      '@babel/proposal-decorators',
      '@babel/transform-flow-strip-types'
    ]
  };
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
  options.presets = ['@babel/stage-1'];
  return options;
}

export { base, commonjs, amd, system, es2015 };
