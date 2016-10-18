'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Config = exports.Collection = exports.UseCollection = undefined;
exports.configure = configure;

require('fetch');

var _collection = require('./collection');

var _service = require('./service');

var _config = require('./config');

function configure(aurelia, configCallback) {
  var config = aurelia.container.get(_config.Config);

  if (configCallback === undefined || typeof configCallback !== 'function') {
    var error = 'You need to provide a callback method to properly configure the library';
    throw error;
  }

  configCallback(config);
}

exports.UseCollection = _collection.UseCollection;
exports.Collection = _service.Collection;
exports.Config = _config.Config;