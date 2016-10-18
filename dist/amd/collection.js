define(['exports', 'aurelia-dependency-injection', './config'], function (exports, _aureliaDependencyInjection, _config) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.UseCollection = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _dec, _class;

  var UseCollection = exports.UseCollection = (_dec = (0, _aureliaDependencyInjection.resolver)(), _dec(_class = function () {
    function UseCollection(key) {
      _classCallCheck(this, UseCollection);

      this._key = key;
    }

    UseCollection.prototype.get = function get(container) {
      return container.get(_config.Config).getCollection(this._key);
    };

    UseCollection.of = function of(key) {
      return new UseCollection(key);
    };

    return UseCollection;
  }()) || _class);
});