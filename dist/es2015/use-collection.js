"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UseCollection = void 0;

var _aureliaDependencyInjection = require("aurelia-dependency-injection");

var _config = require("./config");

var _dec, _class;

let UseCollection = (_dec = (0, _aureliaDependencyInjection.resolver)(), _dec(_class = class UseCollection {
  constructor(key) {
    this._key = key;
  }

  get(container) {
    return container.get(_config.Config).getCollection(this._key);
  }

  static of(key) {
    return new UseCollection(key);
  }

}) || _class);
exports.UseCollection = UseCollection;