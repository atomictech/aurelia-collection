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

var Config = exports.Config = (_dec = (0, _aureliaFramework.inject)(_aureliaFramework.Aurelia, _aureliaFetchClient.HttpClient), _dec(_class = function () {
  function Config(aurelia, httpClient) {
    _classCallCheck(this, Config);

    this.services = {};
    this.defaultService = null;

    this.httpClient = httpClient;
    this.aurelia = aurelia;
  }

  Config.prototype.registerService = function registerService(key, defaultRoute, service) {
    var modelClass = arguments.length <= 3 || arguments[3] === undefined ? ObjectCreator : arguments[3];
    var modelid = arguments.length <= 4 || arguments[4] === undefined ? '_id' : arguments[4];

    this.services[key] = service;
    service.configure(this.aurelia.container, this, key, defaultRoute, modelClass, modelid);

    this.services[key]._setHttpClient(this.httpClient);

    return this;
  };

  Config.prototype.getService = function getService(key) {
    if (!key) {
      return this.defaultService || null;
    }

    return this.services[key] || null;
  };

  Config.prototype.serviceExists = function serviceExists(key) {
    return !!this.services[key];
  };

  Config.prototype.setDefaultService = function setDefaultService(key) {
    this.defaultService = this.getService(key);

    return this;
  };

  return Config;
}()) || _class);