define(["exports", "whatwg-fetch", "./use-collection", "./collection", "./config"], function (_exports, _whatwgFetch, _useCollection, _collection, _config) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.configure = configure;
  Object.defineProperty(_exports, "UseCollection", {
    enumerable: true,
    get: function get() {
      return _useCollection.UseCollection;
    }
  });
  Object.defineProperty(_exports, "Collection", {
    enumerable: true,
    get: function get() {
      return _collection.Collection;
    }
  });
  Object.defineProperty(_exports, "Config", {
    enumerable: true,
    get: function get() {
      return _config.Config;
    }
  });

  function configure(aurelia, configCallback) {
    var config = aurelia.container.get(_config.Config);

    if (configCallback === undefined || typeof configCallback !== 'function') {
      var error = 'You need to provide a callback method to properly configure the library';
      throw error;
    }

    configCallback(config);
  }
});