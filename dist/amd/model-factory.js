define(['exports', 'lodash'], function (exports, _lodash) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.ModelFactory = undefined;

  var _lodash2 = _interopRequireDefault(_lodash);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var ModelFactory = exports.ModelFactory = function () {
    function ModelFactory() {
      _classCallCheck(this, ModelFactory);
    }

    ModelFactory.prototype.create = function create(data) {
      return _lodash2.default.cloneDeep(data);
    };

    return ModelFactory;
  }();
});