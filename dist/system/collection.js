'use strict';

System.register(['aurelia-dependency-injection', './config'], function (_export, _context) {
  "use strict";

  var resolver, Config, _dec, _class, UseCollection;

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
      _export('UseCollection', UseCollection = (_dec = resolver(), _dec(_class = function () {
        function UseCollection(key) {
          _classCallCheck(this, UseCollection);

          this._key = key;
        }

        UseCollection.prototype.get = function get(container) {
          return container.get(Config).getCollection(this._key);
        };

        UseCollection.of = function of(key) {
          return new UseCollection(key);
        };

        return UseCollection;
      }()) || _class));

      _export('UseCollection', UseCollection);
    }
  };
});