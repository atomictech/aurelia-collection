define(['exports', 'lodash', 'aurelia-fetch-client'], function (exports, _lodash, _aureliaFetchClient) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Service = undefined;

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

  var Service = exports.Service = function () {
    function Service() {
      _classCallCheck(this, Service);
    }

    Service.prototype.configure = function configure(container, plugin, key, defaultRoute, modelClass) {
      var modelid = arguments.length <= 5 || arguments[5] === undefined ? '_id' : arguments[5];

      if (_lodash2.default.isUndefined(defaultRoute)) {
        defaultRoute = '/api/' + key + '/';
      }

      this.modelid = modelid;
      this.defaultRoute = defaultRoute;
      this.modelClass = modelClass;
      this.collection = [];
      this.plugin = plugin;
      this.container = container;

      this._httpClient = null;
    };

    Service.prototype.fromJSON = function fromJSON(data, options) {
      if (_lodash2.default.isNil(data)) {
        return Promise.resolve(null);
      }

      var model = this._getFromCollection(data[this.modelid]);

      if (_lodash2.default.isUndefined(model)) {
        model = this.container.invoke(this.modelClass, data);

        if (!_lodash2.default.has(options, 'ignoreCollection')) {
          this.collection.push(model);
        }
      } else if (!this.isComplete(model) || _lodash2.default.has(options, 'force') && options.force) {
        this._syncFrom(model, data);
      }
      return Promise.resolve(model);
    };

    Service.prototype.toJSON = function toJSON(model, options) {
      return _lodash2.default.isFunction(model.toJSON) ? model.toJSON() : model;
    };

    Service.prototype.flush = function flush() {
      this.collection = [];
    };

    Service.prototype.isComplete = function isComplete(model) {
      return true;
    };

    Service.prototype.sync = function sync(model) {
      return this.get(_lodash2.default.isString(model) ? model : model[this.modelid], { force: true });
    };

    Service.prototype.refKeys = function refKeys() {
      return [];
    };

    Service.prototype._setHttpClient = function _setHttpClient(httpClient) {
      this._httpClient = httpClient;
    };

    Service.prototype._syncFrom = function _syncFrom(model, data) {
      _lodash2.default.defaults(model, data);
    };

    Service.prototype._getFromCollection = function _getFromCollection(id) {
      var obj = {};
      obj[this.modelid] = id;
      return _lodash2.default.find(this.collection, obj);
    };

    Service.prototype._removeFromCollection = function _removeFromCollection(id) {
      var obj = {};
      obj[this.modelid] = id;
      _lodash2.default.remove(this.collection, obj);
    };

    Service.prototype._getById = function _getById(id, force) {
      var _this = this;

      var model = this._getFromCollection(id);

      if (_lodash2.default.isUndefined(model) || !this.isComplete(model) || force) {
        return this._httpClient.fetch(this.defaultRoute + id).then(function (response) {
          return response.json();
        }).then(function (data) {
          return _this.fromJSON(data, { force: force });
        });
      }

      return Promise.resolve(model);
    };

    Service.prototype.create = function create(jsonModel, route) {
      var _this2 = this;

      var apiRoute = this.defaultRoute.slice(0, -1);

      if (!_lodash2.default.isNil(route)) {
        apiRoute += '/' + route;
      }

      return this._httpClient.fetch(apiRoute, {
        method: 'post',
        body: (0, _aureliaFetchClient.json)(jsonModel)
      }).then(function (response) {
        return response.json();
      }).then(function (data) {
        return _this2.get(data);
      });
    };

    Service.prototype.destroy = function destroy(id, route) {
      var apiRoute = this.defaultRoute;

      if (!_lodash2.default.isNil(route)) {
        apiRoute += route;
      }

      this._removeFromCollection(id);
      return this._httpClient.fetch(apiRoute, {
        method: 'delete'
      }).then(function (response) {
        return response.json();
      });
    };

    Service.prototype.get = function get(data, options) {
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
      } else if (_lodash2.default.isString(data)) {
        if (!options._child) {
          modelPromise = this._getById(data, options.force);
        } else {
          if (options.populate === true) {
            modelPromise = this._getById(data, options.force);
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

          var collection = _this3.plugin.collections[item.collection];
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
          } else if (!_lodash2.default.isUndefined(collection)) {
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

    Service.prototype.update = function update(model, attr) {
      var _this4 = this;

      return this._frontToBackend(attr).then(function (backAttr) {
        return _this4._httpClient.fetch(_this4.defaultRoute + model[_this4.modelid], {
          method: 'put',
          headers: { 'Content-Type': 'application/json' },
          body: (0, _aureliaFetchClient.json)(backAttr)
        }).then(function (response) {
          return response.json();
        }).then(function (attributes) {
          return _this4._backToFrontend(attributes, backAttr, model);
        });
      }).then(function () {
        return model;
      });
    };

    Service.prototype._frontToBackend = function _frontToBackend(attributes) {
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

        attributes[item.backendKey] = _getIdFromData(value);
      });

      return Promise.resolve(attributes);
    };

    Service.prototype._backToFrontend = function _backToFrontend(attributes, backAttr, model) {
      var _this6 = this;

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
            frontendValue = _this6.plugin.collections[item.collection].get(attributes[backendKey]);
          }
        }

        return frontendValue.then(function (result) {
          return model[frontendKey] = result;
        });
      }));
    };

    return Service;
  }();

  function isNotNullArray(arr) {
    return !_lodash2.default.isArray(arr) || _lodash2.default.isEmpty(arr) || _lodash2.default.some(arr, _lodash2.default.negate(_lodash2.default.isNil));
  }
});