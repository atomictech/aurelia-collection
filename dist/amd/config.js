define(['exports', 'lodash', 'aurelia-framework', 'aurelia-fetch-client'], function (exports, _lodash, _aureliaFramework, _aureliaFetchClient) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Config = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _dec, _class;

  function ObjectCreator(data) {
    return _lodash._.cloneDeep(data);
  }

  var Config = exports.Config = (_dec = (0, _aureliaFramework.inject)(_aureliaFetchClient.HttpClient), _dec(_class = function () {
    function Config(httpClient) {
      _classCallCheck(this, Config);

      this.services = {};
      this.defaultService = null;

      this.httpClient = httpClient;
    }

    Config.prototype.registerService = function registerService(key, service, defaultRoute) {
      var modelClass = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : ObjectCreator;
      var modelid = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '_id';

      this.services[key] = service;
      service.configure(key, modelClass, defaultRoute, modelid);

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
});