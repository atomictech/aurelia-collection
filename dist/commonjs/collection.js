"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Collection = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _aureliaDependencyInjection = require("aurelia-dependency-injection");

var _aureliaFetchClient = require("aurelia-fetch-client");

var _config = require("./config");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Collection = function () {
  function Collection() {
    _classCallCheck(this, Collection);

    Object.defineProperty(this, "_strategies", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: {
        replace: this._replaceStrategy,
        array: this._arrayStrategy,
        merge: this._mergeStrategy
      }
    });
  }

  _createClass(Collection, [{
    key: "configure",
    value: function configure(key, modelClass, defaultRoute) {
      var modelid = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '_id';
      this.container = _aureliaDependencyInjection.Container.instance;

      if (_lodash.default.isUndefined(defaultRoute)) {
        defaultRoute = '/api/' + key + '/';
      }

      this.modelid = modelid;
      this.defaultRoute = defaultRoute;
      this.modelClass = modelClass;
      this.collection = [];
      this._httpClient = null;
    }
  }, {
    key: "fromJSON",
    value: function fromJSON(data, options) {
      if (_lodash.default.isNil(data)) {
        return Promise.resolve(null);
      }

      options = _lodash.default.defaults(options, {
        ignoreCollection: false,
        force: false
      });

      var model = this._getFromCollection(data[this.modelid]);

      if (_lodash.default.isUndefined(model)) {
        model = this.container.invoke(this.modelClass, data);

        _lodash.default.each(data, function (value, key) {
          model[key] = value;
        });

        if (!options.ignoreCollection) {
          this.collection.push(model);
        }
      } else if (!this.isComplete(model) || options.force) {
        this._syncFrom(model, data);
      }

      return Promise.resolve(model);
    }
  }, {
    key: "toJSON",
    value: function toJSON(model, options) {
      return _lodash.default.isFunction(model.toJSON) ? model.toJSON() : model;
    }
  }, {
    key: "flush",
    value: function flush() {
      this.collection = [];
    }
  }, {
    key: "isComplete",
    value: function isComplete(model) {
      return true;
    }
  }, {
    key: "sync",
    value: function sync(model, options) {
      return this.get(_lodash.default.isString(model) ? model : model[this.modelid], _lodash.default.merge({}, options, {
        force: true
      }));
    }
  }, {
    key: "refKeys",
    value: function refKeys() {
      return [];
    }
  }, {
    key: "_setHttpClient",
    value: function _setHttpClient(httpClient) {
      this._httpClient = httpClient;
    }
  }, {
    key: "_syncFrom",
    value: function _syncFrom(model, data) {
      _lodash.default.mergeWith(model, data, function (objValue, srcValue) {
        if (_lodash.default.isArray(objValue)) {
          return objValue = srcValue;
        }
      });
    }
  }, {
    key: "_getFromCollection",
    value: function _getFromCollection(id) {
      var obj = {};
      obj[this.modelid] = id;
      return _lodash.default.find(this.collection, obj);
    }
  }, {
    key: "_removeFromCollection",
    value: function _removeFromCollection(id) {
      var obj = {};
      obj[this.modelid] = id;

      _lodash.default.remove(this.collection, obj);
    }
  }, {
    key: "_getById",
    value: function _getById(id, options) {
      var _this = this;

      var opts = options || {};
      var apiRoute = opts.route || this.defaultRoute + id;

      var model = this._getFromCollection(id);

      if (_lodash.default.isUndefined(model) || !this.isComplete(model) || opts.force) {
        return this._httpClient.fetch(apiRoute).then(function (response) {
          return response.json();
        }).then(function (data) {
          return _this.fromJSON(data, {
            force: opts.force
          });
        });
      }

      return Promise.resolve(model);
    }
  }, {
    key: "_walk",
    value: function _walk(pointer, remainingPath, leafProcessor) {
      var _this2 = this;

      if (_lodash.default.isNil(pointer)) {
        return Promise.resolve(null);
      }

      var key = remainingPath.shift();

      if (remainingPath.length > 0) {
        if (_lodash.default.isArray(pointer[key])) {
          return Promise.all(_lodash.default.map(pointer[key], function (element) {
            return _this2._walk(element, remainingPath, leafProcessor);
          }));
        }

        return this._walk(pointer[key], remainingPath, leafProcessor);
      }

      return leafProcessor(pointer, key);
    }
  }, {
    key: "create",
    value: function create(jsonModel, options) {
      var _this3 = this;

      var opts = options || {};
      var apiRoute = opts.route || this.defaultRoute.slice(0, -1);
      return this._httpClient.fetch(apiRoute, {
        method: 'post',
        body: opts.notJson ? jsonModel : (0, _aureliaFetchClient.json)(jsonModel)
      }).then(function (response) {
        return response.json();
      }).then(function (data) {
        return _this3.get(data);
      });
    }
  }, {
    key: "destroy",
    value: function destroy(id, options) {
      var opts = options || {};
      var apiRoute = opts.route || this.defaultRoute + id;

      this._removeFromCollection(id);

      return this._httpClient.fetch(apiRoute, {
        method: 'delete'
      }).then(function (response) {
        return response.json();
      });
    }
  }, {
    key: "all",
    value: function all(options) {
      var _this4 = this;

      return this._httpClient.fetch(this.defaultRoute).then(function (response) {
        return response.json();
      }).then(function (data) {
        return _this4.get(data, options);
      });
    }
  }, {
    key: "get",
    value: function get(data, options) {
      var _this5 = this;

      options = _lodash.default.defaults(options, {
        _child: false,
        force: false,
        recursive: false,
        populate: false
      });
      var modelPromise = null;

      if (_lodash.default.isEmpty(data) || _lodash.default.isUndefined(data)) {
        return Promise.resolve(data);
      } else if (_lodash.default.isArray(data)) {
        return modelPromise = Promise.all(_lodash.default.map(data, function (item) {
          return _this5.get(item, options);
        }));
      } else if (_lodash.default.isObject(data)) {
        modelPromise = this.fromJSON(data, options);
      } else {
        if (!options._child) {
          modelPromise = this._getById(data, options);
        } else {
          if (options.populate === true) {
            modelPromise = this._getById(data, options);
          } else {
            modelPromise = Promise.resolve(null);
          }
        }
      }

      return modelPromise.then(function (model) {
        if (_lodash.default.isNil(model)) {
          return model;
        }

        var childOpt = _lodash.default.cloneDeep(options);

        delete childOpt.route;

        if (childOpt._child) {
          childOpt.populate = childOpt.recursive = childOpt.recursive === true;
        }

        childOpt._child = true;
        return Promise.all(_lodash.default.map(_this5.refKeys(), function (item) {
          item = _lodash.default.defaults(item, {
            backendKey: null,
            collection: null,
            frontendKey: null,
            backendKeyDeletion: true
          });

          var collection = _this5.container.get(_config.Config).getCollection(item.collection);

          if (_lodash.default.isNil(item.backendKey)) {
            return;
          }

          if (_lodash.default.isNil(item.frontendKey)) {
            item.frontendKey = item.backendKey;
          }

          return _this5._walk(model, item.backendKey.split('.'), function (pointer, key) {
            var itemData = _lodash.default.get(pointer, key);

            var itemDataPromise = Promise.resolve(null);

            if (_lodash.default.isNull(item.collection)) {
              itemDataPromise = Promise.resolve(itemData);
            } else if (!_lodash.default.isNil(collection)) {
              itemDataPromise = collection.get(itemData, childOpt);
            }

            return itemDataPromise.then(function (childrenItems) {
              if (!_lodash.default.isNil(childrenItems) && isNotNullArray(childrenItems)) {
                if (item.backendKeyDeletion === true) {
                  _lodash.default.unset(pointer, key);
                }

                return _lodash.default.set(pointer, item.frontendKey, _lodash.default.pull(childrenItems, null, undefined));
              }
            });
          });
        })).then(function () {
          return model;
        });
      });
    }
  }, {
    key: "find",
    value: function find(predicate, fallbackUrl) {
      var _this6 = this;

      var res = _lodash.default.find(this.collection, predicate);

      if (_lodash.default.isUndefined(res)) {
        if (_lodash.default.isUndefined(fallbackUrl)) {
          return Promise.resolve();
        }

        return this._httpClient.fetch(fallbackUrl).then(function (response) {
          return response.json();
        }).then(function (data) {
          return _this6.get(data);
        });
      }

      return Promise.resolve(res);
    }
  }, {
    key: "update",
    value: function update(model, attr, options) {
      var _this7 = this;

      var opts = options || {};
      var apiRoute = opts.route || this.defaultRoute + model[this.modelid];
      return this._frontToBackend(attr, opts).then(function (backAttr) {
        return _this7._httpClient.fetch(apiRoute, {
          method: 'put',
          headers: {
            'Content-Type': 'application/json'
          },
          body: opts.notJson ? backAttr : (0, _aureliaFetchClient.json)(backAttr)
        }).then(function (response) {
          return response.json();
        }).then(function (attributes) {
          return _this7._backToFrontend(attributes, backAttr, model, opts);
        });
      }).then(function () {
        return model;
      });
    }
  }, {
    key: "_replaceStrategy",
    value: function _replaceStrategy(targetModel, fieldName, newFieldValue) {
      _lodash.default.set(targetModel, fieldName, newFieldValue);
    }
  }, {
    key: "_arrayStrategy",
    value: function _arrayStrategy(targetModel, fieldName, newFieldValue) {
      var currentValue = _lodash.default.get(targetModel, fieldName);

      if (_lodash.default.isArray(currentValue)) {
        _lodash.default.set(targetModel, fieldName, _lodash.default.union(currentValue, newFieldValue));
      } else {
        this._replaceStrategy(targetModel, fieldName, newFieldValue);
      }
    }
  }, {
    key: "_mergeStrategy",
    value: function _mergeStrategy(targetModel, fieldName, newFieldValue) {
      _lodash.default.set(targetModel, fieldName, _lodash.default.merge(_lodash.default.get(targetModel, fieldName), newFieldValue));
    }
  }, {
    key: "_frontToBackend",
    value: function _frontToBackend(attributes, options) {
      var _this8 = this;

      var refKeys = this.refKeys();

      var _getIdFromData = function _getIdFromData(data) {
        if (_lodash.default.isString(data)) {
          return data;
        } else if (_lodash.default.isArray(data)) {
          return _lodash.default.map(data, _getIdFromData);
        } else if (_lodash.default.isObject(data)) {
          return data[_this8.modelid];
        }

        return null;
      };

      _lodash.default.each(refKeys, function (entry) {
        entry = _lodash.default.defaults(entry, {
          backendKey: null,
          frontendKey: null,
          backendKeyDeletion: true
        });
        var backendPath = entry.backendKey.split('.');
        var backendKey = backendPath.pop();

        var frontendPath = _lodash.default.clone(backendPath);

        frontendPath.push(entry.frontendKey);

        _this8._walk(attributes, frontendPath, function (pointer, key) {
          var val = _lodash.default.get(pointer, key);

          if (entry.backendKeyDeletion) {
            _lodash.default.unset(pointer, key);
          }

          var id = _getIdFromData(val);

          _lodash.default.set(pointer, backendKey, _lodash.default.isUndefined(id) ? null : id);
        });
      });

      return Promise.resolve(attributes);
    }
  }, {
    key: "_backToFrontend",
    value: function _backToFrontend(attributes, backAttr, model, options) {
      var _this9 = this;

      var attributesCopy = _lodash.default.cloneDeep(attributes);

      var backAttrCopy = _lodash.default.cloneDeep(backAttr);

      var opts = _lodash.default.defaults({}, options, {
        mergeStrategy: 'replace'
      });

      var refKeys = this.refKeys();
      var promises = [];

      if (opts.mergeStrategy === 'ignore') {
        return;
      }

      _lodash.default.each(refKeys, function (entry) {
        entry = _lodash.default.defaults(entry, {
          backendKey: null,
          frontendKey: null,
          collection: null,
          backendKeyDeletion: true
        });

        if (_lodash.default.isNull(entry.collection)) {
          return;
        }

        var backendPath = entry.backendKey.split('.');
        promises.push(_this9._walk(attributesCopy, backendPath, function (pointer, key) {
          var val = _lodash.default.get(pointer, key);

          if (entry.backendKeyDeletion) {
            _lodash.default.unset(pointer, key);
          }

          return _this9.container.get(_config.Config).getCollection(entry.collection).get(val).then(function (modelRef) {
            _lodash.default.set(pointer, entry.frontendKey, modelRef);
          });
        }));
        promises.push(_this9._walk(backAttrCopy, backendPath, function (pointer, key) {
          var val = _lodash.default.get(pointer, key);

          if (entry.backendKeyDeletion) {
            _lodash.default.unset(pointer, key);
          }

          _lodash.default.set(pointer, entry.frontendKey, val);
        }));
      });

      return Promise.all(promises).then(function () {
        var updateModel = _this9._strategies[opts.mergeStrategy] || _this9._strategies.merge;

        _lodash.default.each(backAttrCopy, function (value, field) {
          updateModel(model, field, _lodash.default.get(attributesCopy, field));
        });

        return Promise.resolve(model);
      });
    }
  }]);

  return Collection;
}();

exports.Collection = Collection;

function isNotNullArray(arr) {
  return !_lodash.default.isArray(arr) || _lodash.default.isEmpty(arr) || _lodash.default.some(arr, _lodash.default.negate(_lodash.default.isNil));
}