'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Collection = undefined;

var _lodash = require('lodash');

var _aureliaDependencyInjection = require('aurelia-dependency-injection');

var _aureliaFetchClient = require('aurelia-fetch-client');

var _config = require('./config');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Collection = exports.Collection = function () {
  function Collection() {
    _classCallCheck(this, Collection);
  }

  Collection.prototype.configure = function configure(key, modelClass, defaultRoute) {
    var modelid = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '_id';

    this.container = _aureliaDependencyInjection.Container.instance;

    if (_lodash._.isUndefined(defaultRoute)) {
      defaultRoute = '/api/' + key + '/';
    }

    this.modelid = modelid;
    this.defaultRoute = defaultRoute;
    this.modelClass = modelClass;
    this.collection = [];

    this._httpClient = null;
  };

  Collection.prototype.fromJSON = function fromJSON(data, options) {
    if (_lodash._.isNil(data)) {
      return Promise.resolve(null);
    }

    options = _lodash._.defaults(options, {
      ignoreCollection: false,
      force: false
    });

    var model = this._getFromCollection(data[this.modelid]);

    if (_lodash._.isUndefined(model)) {
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
    return _lodash._.isFunction(model.toJSON) ? model.toJSON() : model;
  };

  Collection.prototype.flush = function flush() {
    this.collection = [];
  };

  Collection.prototype.isComplete = function isComplete(model) {
    return true;
  };

  Collection.prototype.sync = function sync(model, options) {
    return this.get(_lodash._.isString(model) ? model : model[this.modelid], _lodash._.merge({}, options, { force: true }));
  };

  Collection.prototype.refKeys = function refKeys() {
    return [];
  };

  Collection.prototype._setHttpClient = function _setHttpClient(httpClient) {
    this._httpClient = httpClient;
  };

  Collection.prototype._syncFrom = function _syncFrom(model, data) {
    _lodash._.defaults(model, data);
  };

  Collection.prototype._getFromCollection = function _getFromCollection(id) {
    var obj = {};
    obj[this.modelid] = id;
    return _lodash._.find(this.collection, obj);
  };

  Collection.prototype._removeFromCollection = function _removeFromCollection(id) {
    var obj = {};
    obj[this.modelid] = id;
    _lodash._.remove(this.collection, obj);
  };

  Collection.prototype._getById = function _getById(id, force) {
    var _this = this;

    var model = this._getFromCollection(id);

    if (_lodash._.isUndefined(model) || !this.isComplete(model) || force) {
      return this._httpClient.fetch(this.defaultRoute + id).then(function (response) {
        return response.json();
      }).then(function (data) {
        return _this.fromJSON(data, { force: force });
      });
    }

    return Promise.resolve(model);
  };

  Collection.prototype.create = function create(jsonModel, route) {
    var _this2 = this;

    var apiRoute = this.defaultRoute.slice(0, -1);

    if (!_lodash._.isNil(route)) {
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

  Collection.prototype.destroy = function destroy(id, route) {
    var apiRoute = this.defaultRoute;

    if (!_lodash._.isNil(route)) {
      apiRoute += route;
    } else {
      apiRoute += id;
    }

    this._removeFromCollection(id);
    return this._httpClient.fetch(apiRoute, {
      method: 'delete'
    }).then(function (response) {
      return response.json();
    });
  };

  Collection.prototype.get = function get(data, options) {
    var _this3 = this;

    options = _lodash._.defaults(options, {
      _child: false,
      force: false,
      recursive: false,
      populate: false
    });

    var modelPromise = null;

    if (_lodash._.isEmpty(data) || _lodash._.isUndefined(data)) {
      return Promise.resolve(data);
    } else if (_lodash._.isArray(data)) {
      return modelPromise = Promise.all(_lodash._.map(data, function (item) {
        return _this3.get(item, options);
      }));
    } else if (_lodash._.isObject(data)) {
      modelPromise = this.fromJSON(data);
    } else {
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
      if (_lodash._.isNil(model)) {
        return model;
      }

      var childOpt = _lodash._.cloneDeep(options);
      if (childOpt._child) {
        childOpt.populate = childOpt.recursive = childOpt.recursive === true;
      }
      childOpt._child = true;

      return Promise.all(_lodash._.map(_this3.refKeys(model), function (item) {
        item = _lodash._.defaults(item, {
          backendKey: null,
          collection: null,
          frontendKey: null,
          backendKeyDeletion: true
        });

        var collection = _this3.container.get(_config.Config).getCollection(item.collection);
        if (_lodash._.isNil(item.backendKey)) {
          return;
        }

        if (_lodash._.isNil(item.frontendKey)) {
          item.frontendKey = item.backendKey;
        }

        var itemData = model[item.backendKey];

        var itemDataPromise = Promise.resolve(null);

        if (_lodash._.isNull(item.collection)) {
          itemDataPromise = Promise.resolve(itemData);
        } else if (!_lodash._.isNil(collection)) {
          itemDataPromise = collection.get(itemData, childOpt);
        }

        return itemDataPromise.then(function (childrenItems) {
          if (!_lodash._.isNil(childrenItems) && isNotNullArray(childrenItems)) {
            if (item.backendKeyDeletion === true) {
              delete model[item.backendKey];
            }

            return model[item.frontendKey] = _lodash._.pull(childrenItems, null, undefined);
          }
        });
      })).then(function () {
        return model;
      });
    });
  };

  Collection.prototype.update = function update(model, attr) {
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

  Collection.prototype._frontToBackend = function _frontToBackend(attributes) {
    var _this5 = this;

    var refKeys = this.refKeys();

    var _getIdFromData = function _getIdFromData(data) {
      if (_lodash._.isString(data)) {
        return data;
      } else if (_lodash._.isArray(data)) {
        return _lodash._.map(data, _getIdFromData);
      } else if (_lodash._.isObject(data)) {
        return data[_this5.modelid];
      }
      return null;
    };

    _lodash._.each(attributes, function (value, field) {
      var item = _lodash._.find(refKeys, { frontendKey: field });

      if (_lodash._.isUndefined(item)) {
        return;
      }

      item = _lodash._.defaults(item, {
        backendKey: null,
        frontendKey: null,
        backendKeyDeletion: true
      });

      if (item.backendKeyDeletion) {
        delete attributes[item.frontendKey];
      }

      var id = _getIdFromData(value);
      attributes[item.backendKey] = _lodash._.isUndefined(id) ? null : id;
    });

    return Promise.resolve(attributes);
  };

  Collection.prototype._backToFrontend = function _backToFrontend(attributes, backAttr, model) {
    var _this6 = this;

    var refKeys = this.refKeys();

    return Promise.all(_lodash._.map(backAttr, function (value, field) {
      var frontendKey = field;
      var backendKey = field;
      var frontendValue = Promise.resolve(attributes[backendKey]);

      var item = _lodash._.find(refKeys, { backendKey: field });
      if (!_lodash._.isUndefined(item)) {
        item = _lodash._.defaults(item, {
          backendKey: null,
          frontendKey: null,
          collection: null,
          backendKeyDeletion: true
        });

        frontendKey = item.frontendKey;
        backendKey = item.backendKey;

        if (!_lodash._.isNull(item.collection)) {
          frontendValue = _this6.container.get(_config.Config).getCollection(item.collection).get(attributes[backendKey]);
        }
      }

      return frontendValue.then(function (result) {
        return model[frontendKey] = result;
      });
    }));
  };

  return Collection;
}();

function isNotNullArray(arr) {
  return !_lodash._.isArray(arr) || _lodash._.isEmpty(arr) || _lodash._.some(arr, _lodash._.negate(_lodash._.isNil));
}