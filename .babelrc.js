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

module.exports = { presets, plugins };
