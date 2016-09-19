'use strict';

System.register(['lodash', 'aurelia-framework', 'aurelia-fetch-client'], function (_export, _context) {
  "use strict";

  var _, inject, HttpClient, _dec, _class, Config;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function ObjectCreator(data) {
    return _.cloneDeep(data);
  }

  return {
    setters: [function (_lodash) {
      _ = _lodash._;
    }, function (_aureliaFramework) {
      inject = _aureliaFramework.inject;
    }, function (_aureliaFetchClient) {
      HttpClient = _aureliaFetchClient.HttpClient;
    }],
    execute: function () {
      _export('Config', Config = (_dec = inject(HttpClient), _dec(_class = function () {
        function Config(httpClient) {
          _classCallCheck(this, Config);

          this.services = {};
          this.defaultService = null;

          this.httpClient = httpClient;
        }

        Config.prototype.registerService = function registerService(key, service, defaultRoute) {
          var modelClass = arguments.length <= 3 || arguments[3] === undefined ? ObjectCreator : arguments[3];
          var modelid = arguments.length <= 4 || arguments[4] === undefined ? '_id' : arguments[4];

          this.services[key] = service;
          service.configure(key, defaultRoute, modelClass, modelid);

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
      }()) || _class));

      _export('Config', Config);
    }
  };
});