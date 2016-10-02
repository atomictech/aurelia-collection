define(['exports', './collection', './service', './config', 'fetch'], function (exports, _collection, _service, _config) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Config = exports.Service = exports.Collection = undefined;
  exports.configure = configure;
  function configure(aurelia, configCallback) {
    var config = aurelia.container.get(_config.Config);

    if (configCallback === undefined || typeof configCallback !== 'function') {
      var error = 'You need to provide a callback method to properly configure the library';
      throw error;
    }

    configCallback(config);
  }

  exports.Collection = _collection.Collection;
  exports.Service = _service.Service;
  exports.Config = _config.Config;
});