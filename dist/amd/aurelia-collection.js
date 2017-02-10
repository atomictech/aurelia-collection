define(['exports', './use-collection', './collection', './config', 'whatwg-fetch'], function (exports, _useCollection, _collection, _config) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Config = exports.Collection = exports.UseCollection = undefined;
  exports.configure = configure;
  function configure(aurelia, configCallback) {
    var config = aurelia.container.get(_config.Config);

    if (configCallback === undefined || typeof configCallback !== 'function') {
      var error = 'You need to provide a callback method to properly configure the library';
      throw error;
    }

    configCallback(config);
  }

  exports.UseCollection = _useCollection.UseCollection;
  exports.Collection = _collection.Collection;
  exports.Config = _config.Config;
});