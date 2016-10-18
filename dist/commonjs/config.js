'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Config = undefined;

var _dec, _class;

var _lodash = require('lodash');

var _aureliaFramework = require('aurelia-framework');

var _aureliaFetchClient = require('aurelia-fetch-client');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function ObjectCreator(data) {
  return _lodash._.cloneDeep(data);
}

var Config = exports.Config = (_dec = (0, _aureliaFramework.inject)(_aureliaFetchClient.HttpClient), _dec(_class = function () {
  function Config(httpClient) {
    _classCallCheck(this, Config);

    this.collections = {};
    this.defaultCollection = null;

    this.httpClient = httpClient;
  }

  Config.prototype.registerCollection = function registerCollection(key, collection, defaultRoute) {
    var modelClass = arguments.length <= 3 || arguments[3] === undefined ? ObjectCreator : arguments[3];
    var modelid = arguments.length <= 4 || arguments[4] === undefined ? '_id' : arguments[4];

    this.collections[key] = collection;
    collection.configure(key, modelClass, defaultRoute, modelid);

    this.collections[key]._setHttpClient(this.httpClient);

    return this;
  };

  Config.prototype.getCollection = function getCollection(key) {
    if (!key) {
      return this.defaultCollection || null;
    }

    return this.collections[key] || null;
  };

  Config.prototype.collectionExists = function collectionExists(key) {
    return !!this.collections[key];
  };

  Config.prototype.setDefaultCollection = function setDefaultCollection(key) {
    this.defaultCollection = this.getCollection(key);

    return this;
  };

  return Config;
}()) || _class);