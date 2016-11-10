'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Config = undefined;

var _dec, _class;

var _lodash = require('lodash');

var _aureliaFramework = require('aurelia-framework');

var _aureliaDependencyInjection = require('aurelia-dependency-injection');

var _aureliaFetchClient = require('aurelia-fetch-client');

var _collection = require('./collection');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function ObjectCreator(data) {
  return _lodash._.cloneDeep(data);
}

var Config = exports.Config = (_dec = (0, _aureliaFramework.inject)(_aureliaFramework.Aurelia, _aureliaFetchClient.HttpClient), _dec(_class = function () {
  function Config(aurelia, httpClient) {
    _classCallCheck(this, Config);

    this.collections = {};
    this.defaultCollection = null;

    this.aurelia = aurelia;
    this.container = _aureliaDependencyInjection.Container.instance;
    this.httpClient = httpClient;
  }

  Config.prototype.registerCollection = function registerCollection(key, defaultRoute) {
    var collection = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _collection.Collection;
    var modelClass = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : ObjectCreator;
    var modelid = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '_id';

    var c = this.container.invoke(collection);
    this.collections[key] = c;
    c.configure(key, modelClass, defaultRoute, modelid);

    this.collections[key]._setHttpClient(this.httpClient);

    return c;
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