'use strict';

System.register(['lodash'], function (_export, _context) {
  "use strict";

  var _, ModelFactory;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }],
    execute: function () {
      _export('ModelFactory', ModelFactory = function () {
        function ModelFactory() {
          _classCallCheck(this, ModelFactory);
        }

        ModelFactory.prototype.create = function create(data) {
          return _.cloneDeep(data);
        };

        return ModelFactory;
      }());

      _export('ModelFactory', ModelFactory);
    }
  };
});