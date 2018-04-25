define(["exports", "lodash", "aurelia-dependency-injection", "aurelia-fetch-client", "./config"], function (_exports, _lodash, _aureliaDependencyInjection, _aureliaFetchClient, _config) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.Collection = void 0;
  _lodash = _interopRequireDefault(_lodash);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  var Collection = function () {
    function Collection() {
      _classCallCheck(this, Collection);
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
      key: "create",
      value: function create(jsonModel, options) {
        var _this2 = this;

        var opts = options || {};
        var apiRoute = opts.route || this.defaultRoute.slice(0, -1);
        return this._httpClient.fetch(apiRoute, {
          method: 'post',
          body: opts.notJson ? jsonModel : (0, _aureliaFetchClient.json)(jsonModel)
        }).then(function (response) {
          return response.json();
        }).then(function (data) {
          return _this2.get(data);
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
        var _this3 = this;

        return this._httpClient.fetch(this.defaultRoute).then(function (response) {
          return response.json();
        }).then(function (data) {
          return _this3.get(data, options);
        });
      }
    }, {
      key: "get",
      value: function get(data, options) {
        var _this4 = this;

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
            return _this4.get(item, options);
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
          return Promise.all(_lodash.default.map(_this4.refKeys(model), function (item) {
            item = _lodash.default.defaults(item, {
              backendKey: null,
              collection: null,
              frontendKey: null,
              backendKeyDeletion: true
            });

            var collection = _this4.container.get(_config.Config).getCollection(item.collection);

            if (_lodash.default.isNil(item.backendKey)) {
              return;
            }

            if (_lodash.default.isNil(item.frontendKey)) {
              item.frontendKey = item.backendKey;
            }

            var itemData = _lodash.default.get(model, item.backendKey);

            var itemDataPromise = Promise.resolve(null);

            if (_lodash.default.isNull(item.collection)) {
              itemDataPromise = Promise.resolve(itemData);
            } else if (!_lodash.default.isNil(collection)) {
              itemDataPromise = collection.get(itemData, childOpt);
            }

            return itemDataPromise.then(function (childrenItems) {
              if (!_lodash.default.isNil(childrenItems) && isNotNullArray(childrenItems)) {
                if (item.backendKeyDeletion === true) {
                  _lodash.default.unset(model, item.backendKey);
                }

                return _lodash.default.set(model, item.frontendKey, _lodash.default.pull(childrenItems, null, undefined));
              }
            });
          })).then(function () {
            return model;
          });
        });
      }
    }, {
      key: "find",
      value: function find(predicate, fallbackUrl) {
        var _this5 = this;

        var res = _lodash.default.find(this.collection, predicate);

        if (_lodash.default.isUndefined(res)) {
          if (_lodash.default.isUndefined(fallbackUrl)) {
            return Promise.resolve();
          }

          return this._httpClient.fetch(fallbackUrl).then(function (response) {
            return response.json();
          }).then(function (data) {
            return _this5.get(data);
          });
        }

        return Promise.resolve(res);
      }
    }, {
      key: "update",
      value: function update(model, attr, options) {
        var _this6 = this;

        var opts = options || {};
        var apiRoute = opts.route || this.defaultRoute + model[this.modelid];
        return this._frontToBackend(attr, opts).then(function (backAttr) {
          return _this6._httpClient.fetch(apiRoute, {
            method: 'put',
            headers: {
              'Content-Type': 'application/json'
            },
            body: opts.notJson ? backAttr : (0, _aureliaFetchClient.json)(backAttr)
          }).then(function (response) {
            return response.json();
          }).then(function (attributes) {
            return _this6._backToFrontend(attributes, backAttr, model, opts);
          });
        }).then(function () {
          return model;
        });
      }
    }, {
      key: "_frontToBackend",
      value: function _frontToBackend(attributes, options) {
        var _this7 = this;

        var refKeys = this.refKeys();

        var _getIdFromData = function _getIdFromData(data) {
          if (_lodash.default.isString(data)) {
            return data;
          } else if (_lodash.default.isArray(data)) {
            return _lodash.default.map(data, _getIdFromData);
          } else if (_lodash.default.isObject(data)) {
            return data[_this7.modelid];
          }

          return null;
        };

        _lodash.default.each(attributes, function (value, field) {
          var item = _lodash.default.find(refKeys, {
            frontendKey: field
          });

          if (_lodash.default.isUndefined(item)) {
            return;
          }

          item = _lodash.default.defaults(item, {
            backendKey: null,
            frontendKey: null,
            backendKeyDeletion: true
          });

          if (item.backendKeyDeletion) {
            _lodash.default.unset(attributes, item.frontendKey);
          }

          var id = _getIdFromData(value);

          _lodash.default.set(attributes, item.backendKey, _lodash.default.isUndefined(id) ? null : id);
        });

        return Promise.resolve(attributes);
      }
    }, {
      key: "_backToFrontend",
      value: function _backToFrontend(attributes, backAttr, model, options) {
        var _this8 = this;

        var opts = options || {};
        var refKeys = this.refKeys();
        return Promise.all(_lodash.default.map(backAttr, function (value, field) {
          var frontendKey = field;
          var backendKey = field;
          var frontendValue = Promise.resolve(value);

          var item = _lodash.default.find(refKeys, {
            backendKey: field
          });

          if (!_lodash.default.isUndefined(item)) {
            item = _lodash.default.defaults(item, {
              backendKey: null,
              frontendKey: null,
              collection: null,
              backendKeyDeletion: true
            });
            frontendKey = item.frontendKey;
            backendKey = item.backendKey;

            if (!_lodash.default.isNull(item.collection)) {
              frontendValue = _this8.container.get(_config.Config).getCollection(item.collection).get(_lodash.default.get(attributes, backendKey));
            }
          }

          return frontendValue.then(function (result) {
            if (!_lodash.default.has(opts, 'mergeStrategy') || opts.mergeStrategy === 'replace') {
              _lodash.default.set(model, frontendKey, result);
            } else if (opts.mergeStrategy === 'ignore') {
              return Promise.resolve(model);
            } else if (opts.mergeStrategy === 'array') {
              var currentFrontendValue = _lodash.default.get(model, frontendKey);

              if (_lodash.default.isArray(currentFrontendValue)) {
                _lodash.default.set(model, frontendKey, _lodash.default.union(currentFrontendValue, result));
              } else {
                _lodash.default.set(model, frontendKey, result);
              }
            } else {
              _lodash.default.set(model, frontendKey, _lodash.default.merge(_lodash.default.get(model, frontendKey), result));
            }

            return Promise.resolve(model);
          });
        }));
      }
    }]);

    return Collection;
  }();

  _exports.Collection = Collection;

  function isNotNullArray(arr) {
    return !_lodash.default.isArray(arr) || _lodash.default.isEmpty(arr) || _lodash.default.some(arr, _lodash.default.negate(_lodash.default.isNil));
  }
});