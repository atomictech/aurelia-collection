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

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Collection {
  constructor() {
    _defineProperty(this, "_strategies", {
      replace: this._replaceStrategy,
      array: this._arrayStrategy,
      merge: this._mergeStrategy
    });
  }

  configure(key, modelClass, defaultRoute) {
    let modelid = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '_id';
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

  fromJSON(data, options) {
    let promise;

    if (_lodash.default.isNil(data)) {
      return Promise.resolve(null);
    }

    options = _lodash.default.defaults(options, {
      ignoreCollection: false,
      force: false
    });

    let model = this._getFromCollection(data[this.modelid]);

    if (_lodash.default.isUndefined(model)) {
      model = this.container.invoke(this.modelClass, data);

      _lodash.default.each(data, (value, key) => {
        model[key] = value;
      });

      if (!options.ignoreCollection) {
        this.collection.push(model);
      }

      promise = Promise.resolve(model);
    } else if (!this.isComplete(model) || options.force) {
      promise = this._syncFrom(model, data);
    }

    return promise || Promise.resolve(model);
  }

  toJSON(model, options) {
    return _lodash.default.isFunction(model.toJSON) ? model.toJSON() : model;
  }

  flush() {
    this.collection = [];
  }

  isComplete(model) {
    return true;
  }

  sync(model, options) {
    return this.get(_lodash.default.isString(model) ? model : model[this.modelid], _lodash.default.merge({}, options, {
      force: true
    }));
  }

  refKeys() {
    return [];
  }

  _setHttpClient(httpClient) {
    this._httpClient = httpClient;
  }

  _syncFrom(model, data) {
    return this._backToFrontend(data, model);
  }

  _getFromCollection(id) {
    let obj = {};
    obj[this.modelid] = id;
    return _lodash.default.find(this.collection, obj);
  }

  _removeFromCollection(id) {
    let obj = {};
    obj[this.modelid] = id;

    _lodash.default.remove(this.collection, obj);
  }

  _getById(id, options) {
    const opts = options || {};
    const apiRoute = opts.route || this.defaultRoute + id;

    let model = this._getFromCollection(id);

    if (_lodash.default.isUndefined(model) || !this.isComplete(model) || opts.force) {
      return this._httpClient.fetch(apiRoute).then(response => response.json()).then(data => {
        return this.fromJSON(data, {
          force: opts.force
        });
      });
    }

    return Promise.resolve(model);
  }

  _walk(pointer, remainingPath, leafProcessor) {
    if (_lodash.default.isNil(pointer)) {
      return Promise.resolve(null);
    }

    let remainingPathCopy = _lodash.default.clone(remainingPath);

    let key = remainingPathCopy.shift();

    if (remainingPathCopy.length > 0) {
      if (_lodash.default.isArray(pointer[key])) {
        return Promise.all(_lodash.default.map(pointer[key], element => this._walk(element, remainingPathCopy, leafProcessor)));
      }

      return this._walk(pointer[key], remainingPathCopy, leafProcessor);
    }

    return leafProcessor(pointer, key);
  }

  create(jsonModel, options) {
    const opts = options || {};
    const apiRoute = opts.route || this.defaultRoute.slice(0, -1);
    return this._httpClient.fetch(apiRoute, {
      method: 'post',
      body: opts.notJson ? jsonModel : (0, _aureliaFetchClient.json)(jsonModel)
    }).then(response => response.json()).then(data => this.get(data));
  }

  destroy(id, options) {
    const opts = options || {};
    const apiRoute = opts.route || this.defaultRoute + id;

    this._removeFromCollection(id);

    return this._httpClient.fetch(apiRoute, {
      method: 'delete'
    }).then(response => response.json());
  }

  all(options) {
    return this._httpClient.fetch(this.defaultRoute).then(response => response.json()).then(data => {
      return this.get(data, options);
    });
  }

  get(data, options) {
    options = _lodash.default.defaults(options, {
      _child: false,
      force: false,
      recursive: false,
      populate: false
    });
    let modelPromise = null;

    if (_lodash.default.isEmpty(data) || _lodash.default.isUndefined(data)) {
      return Promise.resolve(data);
    } else if (_lodash.default.isArray(data)) {
      return modelPromise = Promise.all(_lodash.default.map(data, item => this.get(item, options)));
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

    return modelPromise.then(model => {
      if (_lodash.default.isNil(model)) {
        return model;
      }

      let childOpt = _lodash.default.cloneDeep(options);

      delete childOpt.route;

      if (childOpt._child) {
        childOpt.populate = childOpt.recursive = childOpt.recursive === true;
      }

      childOpt._child = true;
      return Promise.all(_lodash.default.map(this.refKeys(), item => {
        item = _lodash.default.defaults(item, {
          backendKey: null,
          collection: null,
          frontendKey: null,
          backendKeyDeletion: true
        });
        let collection = this.container.get(_config.Config).getCollection(item.collection);

        if (_lodash.default.isNil(item.backendKey)) {
          return;
        }

        if (_lodash.default.isNil(item.frontendKey)) {
          item.frontendKey = item.backendKey;
        }

        return this._walk(model, item.backendKey.split('.'), (pointer, key) => {
          let itemData = _lodash.default.get(pointer, key);

          let itemDataPromise = Promise.resolve(null);

          if (_lodash.default.isNull(item.collection)) {
            itemDataPromise = Promise.resolve(itemData);
          } else if (!_lodash.default.isNil(collection)) {
            itemDataPromise = collection.get(itemData, childOpt);
          }

          return itemDataPromise.then(childrenItems => {
            if (!_lodash.default.isNil(childrenItems) && isNotNullArray(childrenItems)) {
              if (item.backendKeyDeletion === true) {
                _lodash.default.unset(pointer, key);
              }

              return _lodash.default.set(pointer, item.frontendKey, _lodash.default.pull(childrenItems, null, undefined));
            }
          });
        });
      })).then(() => model);
    });
  }

  find(predicate, fallbackUrl) {
    let res = _lodash.default.find(this.collection, predicate);

    if (_lodash.default.isUndefined(res)) {
      if (_lodash.default.isUndefined(fallbackUrl)) {
        return Promise.resolve();
      }

      return this._httpClient.fetch(fallbackUrl).then(response => response.json()).then(data => {
        return this.get(data);
      });
    }

    return Promise.resolve(res);
  }

  update(model, attr, options) {
    const opts = options || {};
    const apiRoute = opts.route || this.defaultRoute + model[this.modelid];
    return this._frontToBackend(attr, opts).then(backAttr => {
      return this._httpClient.fetch(apiRoute, {
        method: 'put',
        headers: {
          'Content-Type': 'application/json'
        },
        body: opts.notJson ? backAttr : (0, _aureliaFetchClient.json)(backAttr)
      }).then(response => response.json()).then(attributes => {
        opts.attributeFilter = _lodash.default.keys(backAttr);
        return this._backToFrontend(attributes, model, opts);
      });
    });
  }

  _replaceStrategy(targetModel, fieldName, newFieldValue) {
    _lodash.default.set(targetModel, fieldName, newFieldValue);
  }

  _arrayStrategy(targetModel, fieldName, newFieldValue) {
    let currentValue = _lodash.default.get(targetModel, fieldName);

    if (_lodash.default.isArray(currentValue)) {
      _lodash.default.set(targetModel, fieldName, _lodash.default.union(currentValue, newFieldValue));
    } else {
      this._replaceStrategy(targetModel, fieldName, newFieldValue);
    }
  }

  _mergeStrategy(targetModel, fieldName, newFieldValue) {
    _lodash.default.set(targetModel, fieldName, _lodash.default.merge(_lodash.default.get(targetModel, fieldName), newFieldValue));
  }

  _frontToBackend(attributes, options) {
    const refKeys = this.refKeys();

    let _getIdFromData = data => {
      if (_lodash.default.isString(data)) {
        return data;
      } else if (_lodash.default.isArray(data)) {
        return _lodash.default.map(data, _getIdFromData);
      } else if (_lodash.default.isObject(data)) {
        return data[this.modelid];
      }

      return null;
    };

    _lodash.default.each(refKeys, entry => {
      entry = _lodash.default.defaults(entry, {
        backendKey: null,
        frontendKey: null,
        backendKeyDeletion: true
      });
      let backendPath = entry.backendKey.split('.');
      let backendKey = backendPath.pop();

      let frontendPath = _lodash.default.clone(backendPath);

      frontendPath.push(entry.frontendKey);

      this._walk(attributes, frontendPath, (pointer, key) => {
        if (!_lodash.default.has(pointer, key)) {
          return;
        }

        let val = _lodash.default.get(pointer, key);

        if (entry.backendKeyDeletion) {
          _lodash.default.unset(pointer, key);
        }

        let id = _getIdFromData(val);

        _lodash.default.set(pointer, backendKey, _lodash.default.isUndefined(id) ? null : id);
      });
    });

    return Promise.resolve(attributes);
  }

  _backToFrontend(attributes, model, options) {
    let attributesCopy = _lodash.default.cloneDeep(attributes);

    const opts = _lodash.default.defaults({}, options, {
      mergeStrategy: 'replace'
    });

    const refKeys = this.refKeys();
    let promises = [];

    if (opts.mergeStrategy === 'ignore') {
      return;
    }

    if (!_lodash.default.isUndefined(opts.attributeFilter)) {
      let filter = _lodash.default.isArray(opts.attributeFilter) ? opts.attributeFilter : _lodash.default.keys(opts.attributeFilter);
      attributesCopy = _lodash.default.pick(attributesCopy, filter);
    }

    _lodash.default.each(refKeys, entry => {
      entry = _lodash.default.defaults(entry, {
        backendKey: null,
        frontendKey: null,
        collection: null,
        backendKeyDeletion: true
      });

      if (_lodash.default.isNull(entry.collection)) {
        return;
      }

      let backendPath = entry.backendKey.split('.');
      promises.push(this._walk(attributesCopy, backendPath, (pointer, key) => {
        if (!_lodash.default.has(pointer, key)) {
          return;
        }

        let val = _lodash.default.get(pointer, key);

        if (entry.backendKeyDeletion) {
          _lodash.default.unset(pointer, key);
        }

        return this.container.get(_config.Config).getCollection(entry.collection).get(val).then(modelRef => {
          _lodash.default.set(pointer, entry.frontendKey, modelRef);
        });
      }));
    });

    return Promise.all(promises).then(() => {
      let updateModel = this._strategies[opts.mergeStrategy] || this._strategies.merge;

      _lodash.default.each(attributesCopy, (value, field) => {
        updateModel(model, field, value);
      });

      return Promise.resolve(model);
    });
  }

}

exports.Collection = Collection;

function isNotNullArray(arr) {
  return !_lodash.default.isArray(arr) || _lodash.default.isEmpty(arr) || _lodash.default.some(arr, _lodash.default.negate(_lodash.default.isNil));
}