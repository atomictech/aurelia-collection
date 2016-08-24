define(['exports', 'aurelia-dependency-injection', './config'], function (exports, _aureliaDependencyInjection, _config) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Collection = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _dec, _class;

  var Collection = exports.Collection = (_dec = (0, _aureliaDependencyInjection.resolver)(), _dec(_class = function () {
    function Collection(key) {
      _classCallCheck(this, Collection);

      this._key = key;
    }

    Collection.prototype.get = function get(container) {
      return container.get(_config.Config).getCollection(this._key);
    };

    Collection.of = function of(key) {
      return new Collection(key);
    };

    return Collection;
  }()) || _class);
});