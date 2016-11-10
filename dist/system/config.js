'use strict';

System.register(['lodash', 'aurelia-framework', 'aurelia-dependency-injection', 'aurelia-fetch-client', './collection'], function (_export, _context) {
  "use strict";

  var _, Aurelia, inject, Container, HttpClient, Collection, _dec, _class, Config;

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
      Aurelia = _aureliaFramework.Aurelia;
      inject = _aureliaFramework.inject;
    }, function (_aureliaDependencyInjection) {
      Container = _aureliaDependencyInjection.Container;
    }, function (_aureliaFetchClient) {
      HttpClient = _aureliaFetchClient.HttpClient;
    }, function (_collection) {
      Collection = _collection.Collection;
    }],
    execute: function () {
      _export('Config', Config = (_dec = inject(Aurelia, HttpClient), _dec(_class = function () {
        function Config(aurelia, httpClient) {
          _classCallCheck(this, Config);

          this.collections = {};
          this.defaultCollection = null;

          this.aurelia = aurelia;
          this.container = Container.instance;
          this.httpClient = httpClient;
        }

        Config.prototype.registerCollection = function registerCollection(key, defaultRoute) {
          var collection = arguments.length <= 2 || arguments[2] === undefined ? Collection : arguments[2];
          var modelClass = arguments.length <= 3 || arguments[3] === undefined ? ObjectCreator : arguments[3];
          var modelid = arguments.length <= 4 || arguments[4] === undefined ? '_id' : arguments[4];

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
      }()) || _class));

      _export('Config', Config);
    }
  };
});