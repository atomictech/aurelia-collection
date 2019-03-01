"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Config = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _aureliaFramework = require("aurelia-framework");

var _aureliaDependencyInjection = require("aurelia-dependency-injection");

var _aureliaFetchClient = require("aurelia-fetch-client");

var _collection = require("./collection");

var _dec, _class, _temp;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function ObjectCreator(data) {
  return _lodash.default.cloneDeep(data);
}

let Config = (_dec = (0, _aureliaFramework.inject)(_aureliaFramework.Aurelia, _aureliaFetchClient.HttpClient), _dec(_class = (_temp = class Config {
  constructor(aurelia, httpClient) {
    _defineProperty(this, "collections", {});

    _defineProperty(this, "defaultCollection", null);

    this.aurelia = aurelia;
    this.container = _aureliaDependencyInjection.Container.instance;
    this.httpClient = httpClient;
  }

  registerCollection(key, defaultRoute) {
    let collection = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _collection.Collection;
    let modelClass = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : ObjectCreator;
    let modelid = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '_id';
    let c = this.container.invoke(collection);
    this.collections[key] = c;
    c.configure(key, modelClass, defaultRoute, modelid);

    this.collections[key]._setHttpClient(this.httpClient);

    return c;
  }

  getCollection(key) {
    if (!key) {
      return this.defaultCollection || null;
    }

    return this.collections[key] || null;
  }

  collectionExists(key) {
    return !!this.collections[key];
  }

  setDefaultCollection(key) {
    this.defaultCollection = this.getCollection(key);
    return this;
  }

}, _temp)) || _class);
exports.Config = Config;