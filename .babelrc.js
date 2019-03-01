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

if (process.env['ENV'] === 'test') {
  plugins.push('instanbul');
}

module.exports = { presets, plugins };
