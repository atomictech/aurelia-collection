'use strict';

System.register(['aurelia-dependency-injection', './config'], function (_export, _context) {
  "use strict";

  var resolver, Config, _dec, _class, Collection;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_aureliaDependencyInjection) {
      resolver = _aureliaDependencyInjection.resolver;
    }, function (_config) {
      Config = _config.Config;
    }],
    execute: function () {
      _export('Collection', Collection = (_dec = resolver(), _dec(_class = function () {
        function Collection(key) {
          _classCallCheck(this, Collection);

          this._key = key;
        }

        Collection.prototype.get = function get(container) {
          return container.get(Config).getCollection(this._key);
        };

        Collection.of = function of(key) {
          return new Collection(key);
        };

        return Collection;
      }()) || _class));

      _export('Collection', Collection);
    }
  };
});