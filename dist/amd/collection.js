define(['exports', 'lodash', 'aurelia-dependency-injection', 'aurelia-fetch-client', './config'], function (exports, _lodash, _aureliaDependencyInjection, _aureliaFetchClient, _config) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Collection = undefined;

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

  var Collection = exports.Collection = function () {
    function Collection() {
      _classCallCheck(this, Collection);
    }

    Collection.prototype.configure = function configure(key, modelClass, defaultRoute) {
      var modelid = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '_id';

      this.container = _aureliaDependencyInjection.Container.instance;

      if (_lodash2.default.isUndefined(defaultRoute)) {
        defaultRoute = '/api/' + key + '/';
      }

      this.modelid = modelid;
      this.defaultRoute = defaultRoute;
      this.modelClass = modelClass;
      this.collection = [];

      this._httpClient = null;
    };

    Collection.prototype.fromJSON = function fromJSON(data, options) {
      if (_lodash2.default.isNil(data)) {
        return Promise.resolve(null);
      }

      options = _lodash2.default.defaults(options, {
        ignoreCollection: false,
        force: false
      });

      var model = this._getFromCollection(data[this.modelid]);

      if (_lodash2.default.isUndefined(model)) {
        model = this.container.invoke(this.modelClass, data);

        if (!options.ignoreCollection) {
          this.collection.push(model);
        }
      } else if (!this.isComplete(model) || options.force) {
        this._syncFrom(model, data);
      }
      return Promise.resolve(model);
    };

    Collection.prototype.toJSON = function toJSON(model, options) {
      return _lodash2.default.isFunction(model.toJSON) ? model.toJSON() : model;
    };

    Collection.prototype.flush = function flush() {
      this.collection = [];
    };

    Collection.prototype.isComplete = function isComplete(model) {
      return true;
    };

    Collection.prototype.sync = function sync(model, options) {
      return this.get(_lodash2.default.isString(model) ? model : model[this.modelid], _lodash2.default.merge({}, options, { force: true }));
    };

    Collection.prototype.refKeys = function refKeys() {
      return [];
    };

    Collection.prototype._setHttpClient = function _setHttpClient(httpClient) {
      this._httpClient = httpClient;
    };

    Collection.prototype._syncFrom = function _syncFrom(model, data) {
      _lodash2.default.merge(model, data);
    };

    Collection.prototype._getFromCollection = function _getFromCollection(id) {
      var obj = {};
      obj[this.modelid] = id;
      return _lodash2.default.find(this.collection, obj);
    };

    Collection.prototype._removeFromCollection = function _removeFromCollection(id) {
      var obj = {};
      obj[this.modelid] = id;
      _lodash2.default.remove(this.collection, obj);
    };

    Collection.prototype._getById = function _getById(id, options) {
      var _this = this;

      var opts = options || {};
      var apiRoute = opts.route || this.defaultRoute + id;
      var model = this._getFromCollection(id);

      if (_lodash2.default.isUndefined(model) || !this.isComplete(model) || opts.force) {
        return this._httpClient.fetch(apiRoute).then(function (response) {
          return response.json();
        }).then(function (data) {
          return _this.fromJSON(data, { force: opts.force });
        });
      }

      return Promise.resolve(model);
    };

    Collection.prototype.create = function create(jsonModel, options) {
      var _this2 = this;

      var opts = options || {};
      var apiRoute = opts.route || this.defaultRoute.slice(0, -1);

      return this._httpClient.fetch(apiRoute, {
        method: 'post',
        body: (0, _aureliaFetchClient.json)(jsonModel)
      }).then(function (response) {
        return response.json();
      }).then(function (data) {
        return _this2.get(data);
      });
    };

    Collection.prototype.destroy = function destroy(id, options) {
      var opts = options || {};
      var apiRoute = opts.route || this.defaultRoute + id;

      this._removeFromCollection(id);
      return this._httpClient.fetch(apiRoute, {
        method: 'delete'
      }).then(function (response) {
        return response.json();
      });
    };

    Collection.prototype.get = function get(data, options) {
      var _this3 = this;

      options = _lodash2.default.defaults(options, {
        _child: false,
        force: false,
        recursive: false,
        populate: false
      });

      var modelPromise = null;

      if (_lodash2.default.isEmpty(data) || _lodash2.default.isUndefined(data)) {
        return Promise.resolve(data);
      } else if (_lodash2.default.isArray(data)) {
        return modelPromise = Promise.all(_lodash2.default.map(data, function (item) {
          return _this3.get(item, options);
        }));
      } else if (_lodash2.default.isObject(data)) {
        modelPromise = this.fromJSON(data);
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
        if (_lodash2.default.isNil(model)) {
          return model;
        }

        var childOpt = _lodash2.default.cloneDeep(options);

        delete childOpt.route;

        if (childOpt._child) {
          childOpt.populate = childOpt.recursive = childOpt.recursive === true;
        }
        childOpt._child = true;

        return Promise.all(_lodash2.default.map(_this3.refKeys(model), function (item) {
          item = _lodash2.default.defaults(item, {
            backendKey: null,
            collection: null,
            frontendKey: null,
            backendKeyDeletion: true
          });

          var collection = _this3.container.get(_config.Config).getCollection(item.collection);
          if (_lodash2.default.isNil(item.backendKey)) {
            return;
          }

          if (_lodash2.default.isNil(item.frontendKey)) {
            item.frontendKey = item.backendKey;
          }

          var itemData = model[item.backendKey];

          var itemDataPromise = Promise.resolve(null);

          if (_lodash2.default.isNull(item.collection)) {
            itemDataPromise = Promise.resolve(itemData);
          } else if (!_lodash2.default.isNil(collection)) {
            itemDataPromise = collection.get(itemData, childOpt);
          }

          return itemDataPromise.then(function (childrenItems) {
            if (!_lodash2.default.isNil(childrenItems) && isNotNullArray(childrenItems)) {
              if (item.backendKeyDeletion === true) {
                delete model[item.backendKey];
              }

              return model[item.frontendKey] = _lodash2.default.pull(childrenItems, null, undefined);
            }
          });
        })).then(function () {
          return model;
        });
      });
    };

    Collection.prototype.update = function update(model, attr, options) {
      var _this4 = this;

      var opts = options || {};
      var apiRoute = opts.route || this.defaultRoute + model[this.modelid];

      return this._frontToBackend(attr, opts).then(function (backAttr) {
        return _this4._httpClient.fetch(apiRoute, {
          method: 'put',
          headers: { 'Content-Type': 'application/json' },
          body: (0, _aureliaFetchClient.json)(backAttr)
        }).then(function (response) {
          return response.json();
        }).then(function (attributes) {
          return _this4._backToFrontend(attributes, backAttr, model, opts);
        });
      }).then(function () {
        return model;
      });
    };

    Collection.prototype._frontToBackend = function _frontToBackend(attributes, options) {
      var _this5 = this;

      var refKeys = this.refKeys();

      var _getIdFromData = function _getIdFromData(data) {
        if (_lodash2.default.isString(data)) {
          return data;
        } else if (_lodash2.default.isArray(data)) {
          return _lodash2.default.map(data, _getIdFromData);
        } else if (_lodash2.default.isObject(data)) {
          return data[_this5.modelid];
        }
        return null;
      };

      _lodash2.default.each(attributes, function (value, field) {
        var item = _lodash2.default.find(refKeys, { frontendKey: field });

        if (_lodash2.default.isUndefined(item)) {
          return;
        }

        item = _lodash2.default.defaults(item, {
          backendKey: null,
          frontendKey: null,
          backendKeyDeletion: true
        });

        if (item.backendKeyDeletion) {
          delete attributes[item.frontendKey];
        }

        var id = _getIdFromData(value);
        attributes[item.backendKey] = _lodash2.default.isUndefined(id) ? null : id;
      });

      return Promise.resolve(attributes);
    };

    Collection.prototype._backToFrontend = function _backToFrontend(attributes, backAttr, model, options) {
      var _this6 = this;

      var opts = options || {};
      var refKeys = this.refKeys();

      return Promise.all(_lodash2.default.map(backAttr, function (value, field) {
        var frontendKey = field;
        var backendKey = field;
        var frontendValue = Promise.resolve(attributes[backendKey]);

        var item = _lodash2.default.find(refKeys, { backendKey: field });
        if (!_lodash2.default.isUndefined(item)) {
          item = _lodash2.default.defaults(item, {
            backendKey: null,
            frontendKey: null,
            collection: null,
            backendKeyDeletion: true
          });

          frontendKey = item.frontendKey;
          backendKey = item.backendKey;

          if (!_lodash2.default.isNull(item.collection)) {
            frontendValue = _this6.container.get(_config.Config).getCollection(item.collection).get(attributes[backendKey]);
          }
        }

        return frontendValue.then(function (result) {
          if (!_lodash2.default.has(opts, 'mergeStrategy') || opts.mergeStrategy === 'replace') {
            model[frontendKey] = result;
          } else if (opts.mergeStrategy === 'ignore') {
            return Promise.resolve(model);
          } else if (opts.mergeStrategy === 'array') {
            if (_lodash2.default.isArray(model[frontendKey])) {
              model[frontendKey] = _lodash2.default.union(model[frontendKey], result);
            } else {
              model[frontendKey] = result;
            }
          } else {
            model[frontendKey] = _lodash2.default.merge(model[frontendKey], result);
          }
          return Promise.resolve(model);
        });
      }));
    };

    return Collection;
  }();

  function isNotNullArray(arr) {
    return !_lodash2.default.isArray(arr) || _lodash2.default.isEmpty(arr) || _lodash2.default.some(arr, _lodash2.default.negate(_lodash2.default.isNil));
  }
});