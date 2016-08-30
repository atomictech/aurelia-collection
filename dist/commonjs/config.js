'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Config = undefined;

var _dec, _class;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _aureliaFramework = require('aurelia-framework');

var _aureliaFetchClient = require('aurelia-fetch-client');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function ObjectCreator(data) {
  return _lodash2.default.cloneDeep(data);
}

var Config = exports.Config = (_dec = (0, _aureliaFramework.inject)(_aureliaFramework.Aurelia, _aureliaFetchClient.HttpClient), _dec(_class = function () {
  function Config(aurelia, httpClient) {
    _classCallCheck(this, Config);

    this.collections = {};
    this.defaultCollection = null;

    this.httpClient = httpClient;
    this.aurelia = aurelia;
  }

  Config.prototype.registerCollection = function registerCollection(key, defaultRoute, collectionService) {
    var modelClass = arguments.length <= 3 || arguments[3] === undefined ? ObjectCreator : arguments[3];
    var modelid = arguments.length <= 4 || arguments[4] === undefined ? '_id' : arguments[4];

    this.collections[key] = collectionService;
    collectionService.configure(this.aurelia.container, this, key, defaultRoute, modelClass, modelid);

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