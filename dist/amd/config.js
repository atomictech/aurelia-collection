define(["exports", "lodash", "aurelia-framework", "aurelia-dependency-injection", "aurelia-fetch-client", "./collection"], function (_exports, _lodash, _aureliaFramework, _aureliaDependencyInjection, _aureliaFetchClient, _collection) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.Config = void 0;
  _lodash = _interopRequireDefault(_lodash);

  var _dec, _class, _temp;

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  function ObjectCreator(data) {
    return _lodash.default.cloneDeep(data);
  }

  var Config = (_dec = (0, _aureliaFramework.inject)(_aureliaFramework.Aurelia, _aureliaFetchClient.HttpClient), _dec(_class = (_temp = function () {
    function Config(aurelia, httpClient) {
      _classCallCheck(this, Config);

      _defineProperty(this, "collections", {});

      _defineProperty(this, "defaultCollection", null);

      this.aurelia = aurelia;
      this.container = _aureliaDependencyInjection.Container.instance;
      this.httpClient = httpClient;
    }

    _createClass(Config, [{
      key: "registerCollection",
      value: function registerCollection(key, defaultRoute) {
        var collection = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _collection.Collection;
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
  }(), _temp)) || _class);
  _exports.Config = Config;
});