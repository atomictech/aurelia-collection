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
      }()) || _class));

      _export('Config', Config);
    }
  };
});