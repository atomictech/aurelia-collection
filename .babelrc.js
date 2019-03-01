const presets = [
  [
    "@babel/env",
    {
      "targets": {
        "browsers": "last 2 versions"
      }
    }
  ]
];

const plugins = [
  "@babel/syntax-flow",
  ["@babel/proposal-decorators", { "legacy": true }],
  "@babel/transform-flow-strip-types",
  "@babel/plugin-proposal-class-properties"
];

if (process.env['NODE_ENV'] === 'test') {
  plugins.push('istanbul');
}

module.exports = { presets, plugins };
