'use strict';

System.register(['aurelia-framework', 'aurelia-fetch-client', './service'], function (_export, _context) {
  "use strict";

  var inject, HttpClient, Service, _dec, _class, Config;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_aureliaFramework) {
      inject = _aureliaFramework.inject;
    }, function (_aureliaFetchClient) {
      HttpClient = _aureliaFetchClient.HttpClient;
    }, function (_service) {
      Service = _service.Service;
    }],
    execute: function () {
      _export('Config', Config = (_dec = inject(HttpClient), _dec(_class = function () {
        function Config(httpClient) {
          _classCallCheck(this, Config);

          this.collections = {};
          this.defaultCollection = null;

          this.httpClient = httpClient;
        }

        Config.prototype.registerCollection = function registerCollection(key, defaultRoute) {
          var modelClass = arguments.length <= 2 || arguments[2] === undefined ? Object : arguments[2];
          var modelid = arguments.length <= 3 || arguments[3] === undefined ? '_id' : arguments[3];
          var ServiceClass = arguments.length <= 4 || arguments[4] === undefined ? Service : arguments[4];


          this.collections[key] = new ServiceClass(this, key, defaultRoute, modelClass, modelid);
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
      }()) || _class));

      _export('Config', Config);
    }
  };
});