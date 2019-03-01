"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.configure = configure;
Object.defineProperty(exports, "UseCollection", {
  enumerable: true,
  get: function get() {
    return _useCollection.UseCollection;
  }
});
Object.defineProperty(exports, "Collection", {
  enumerable: true,
  get: function get() {
    return _collection.Collection;
  }
});
Object.defineProperty(exports, "Config", {
  enumerable: true,
  get: function get() {
    return _config.Config;
  }
});

require("whatwg-fetch");

var _useCollection = require("./use-collection");

var _collection = require("./collection");

var _config = require("./config");

function configure(aurelia, configCallback) {
  let config = aurelia.container.get(_config.Config);

  if (configCallback === undefined || typeof configCallback !== 'function') {
    let error = 'You need to provide a callback method to properly configure the library';
    throw error;
  }

  configCallback(config);
}