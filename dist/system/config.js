"use strict";

System.register(["lodash", "aurelia-framework", "aurelia-dependency-injection", "aurelia-fetch-client", "./collection"], function (_export, _context) {
  "use strict";

  var _, Aurelia, inject, Container, HttpClient, Collection, _dec, _class, _temp, Config;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  function ObjectCreator(data) {
    return _.cloneDeep(data);
  }

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
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
      _export("Config", Config = (_dec = inject(Aurelia, HttpClient), _dec(_class = (_temp = function () {
        function Config(aurelia, httpClient) {
          _classCallCheck(this, Config);

          _defineProperty(this, "collections", {});

          _defineProperty(this, "defaultCollection", null);

          this.aurelia = aurelia;
          this.container = Container.instance;
          this.httpClient = httpClient;
        }

        _createClass(Config, [{
          key: "registerCollection",
          value: function registerCollection(key, defaultRoute) {
            var collection = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Collection;
            var modelClass = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : ObjectCreator;
            var modelid = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '_id';
            var c = this.container.invoke(collection);
            this.collections[key] = c;
            c.configure(key, modelClass, defaultRoute, modelid);

            this.collections[key]._setHttpClient(this.httpClient);

            return c;
          }
        }, {
          key: "getCollection",
          value: function getCollection(key) {
            if (!key) {
              return this.defaultCollection || null;
            }

            return this.collections[key] || null;
          }
        }, {
          key: "collectionExists",
          value: function collectionExists(key) {
            return !!this.collections[key];
          }
        }, {
          key: "setDefaultCollection",
          value: function setDefaultCollection(key) {
            this.defaultCollection = this.getCollection(key);
            return this;
          }
        }]);

        return Config;
      }(), _temp)) || _class));
    }
  };
});