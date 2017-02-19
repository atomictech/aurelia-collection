'use strict';

System.register(['lodash', 'aurelia-dependency-injection', 'aurelia-fetch-client', './config'], function (_export, _context) {
  "use strict";

  var _, Container, json, Config, Collection;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function isNotNullArray(arr) {
    return !_.isArray(arr) || _.isEmpty(arr) || _.some(arr, _.negate(_.isNil));
  }
  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_aureliaDependencyInjection) {
      Container = _aureliaDependencyInjection.Container;
    }, function (_aureliaFetchClient) {
      json = _aureliaFetchClient.json;
    }, function (_config) {
      Config = _config.Config;
    }],
    execute: function () {
      _export('Collection', Collection = function () {
        function Collection() {
          _classCallCheck(this, Collection);
        }

        Collection.prototype.configure = function configure(key, modelClass, defaultRoute) {
          var modelid = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '_id';

          this.container = Container.instance;

          if (_.isUndefined(defaultRoute)) {
            defaultRoute = '/api/' + key + '/';
          }

          this.modelid = modelid;
          this.defaultRoute = defaultRoute;
          this.modelClass = modelClass;
          this.collection = [];

          this._httpClient = null;
        };

        Collection.prototype.fromJSON = function fromJSON(data, options) {
          if (_.isNil(data)) {
            return Promise.resolve(null);
          }

          options = _.defaults(options, {
            ignoreCollection: false,
            force: false
          });

          var model = this._getFromCollection(data[this.modelid]);

          if (_.isUndefined(model)) {
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
          return _.isFunction(model.toJSON) ? model.toJSON() : model;
        };

        Collection.prototype.flush = function flush() {
          this.collection = [];
        };

        Collection.prototype.isComplete = function isComplete(model) {
          return true;
        };

        Collection.prototype.sync = function sync(model, options) {
          return this.get(_.isString(model) ? model : model[this.modelid], _.merge({}, options, { force: true }));
        };

        Collection.prototype.refKeys = function refKeys() {
          return [];
        };

        Collection.prototype._setHttpClient = function _setHttpClient(httpClient) {
          this._httpClient = httpClient;
        };

        Collection.prototype._syncFrom = function _syncFrom(model, data) {
          _.merge(model, data);
        };

        Collection.prototype._getFromCollection = function _getFromCollection(id) {
          var obj = {};
          obj[this.modelid] = id;
          return _.find(this.collection, obj);
        };

        Collection.prototype._removeFromCollection = function _removeFromCollection(id) {
          var obj = {};
          obj[this.modelid] = id;
          _.remove(this.collection, obj);
        };

        Collection.prototype._getById = function _getById(id, options) {
          var _this = this;

          var opts = options || {};
          var apiRoute = opts.route || this.defaultRoute + id;
          var model = this._getFromCollection(id);

          if (_.isUndefined(model) || !this.isComplete(model) || opts.force) {
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
            body: json(jsonModel)
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

          options = _.defaults(options, {
            _child: false,
            force: false,
            recursive: false,
            populate: false
          });

          var modelPromise = null;

          if (_.isEmpty(data) || _.isUndefined(data)) {
            return Promise.resolve(data);
          } else if (_.isArray(data)) {
            return modelPromise = Promise.all(_.map(data, function (item) {
              return _this3.get(item, options);
            }));
          } else if (_.isObject(data)) {
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
            if (_.isNil(model)) {
              return model;
            }

            var childOpt = _.cloneDeep(options);

            delete childOpt.route;

            if (childOpt._child) {
              childOpt.populate = childOpt.recursive = childOpt.recursive === true;
            }
            childOpt._child = true;

            return Promise.all(_.map(_this3.refKeys(model), function (item) {
              item = _.defaults(item, {
                backendKey: null,
                collection: null,
                frontendKey: null,
                backendKeyDeletion: true
              });

              var collection = _this3.container.get(Config).getCollection(item.collection);
              if (_.isNil(item.backendKey)) {
                return;
              }

              if (_.isNil(item.frontendKey)) {
                item.frontendKey = item.backendKey;
              }

              var itemData = model[item.backendKey];

              var itemDataPromise = Promise.resolve(null);

              if (_.isNull(item.collection)) {
                itemDataPromise = Promise.resolve(itemData);
              } else if (!_.isNil(collection)) {
                itemDataPromise = collection.get(itemData, childOpt);
              }

              return itemDataPromise.then(function (childrenItems) {
                if (!_.isNil(childrenItems) && isNotNullArray(childrenItems)) {
                  if (item.backendKeyDeletion === true) {
                    delete model[item.backendKey];
                  }

                  return model[item.frontendKey] = _.pull(childrenItems, null, undefined);
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

          if (_.has(options, 'fireAndForget') && options.fireAndForget) {
            return Promise.resolve(attr);
          }

          return this._frontToBackend(attr, opts).then(function (backAttr) {
            return _this4._httpClient.fetch(apiRoute, {
              method: 'put',
              headers: { 'Content-Type': 'application/json' },
              body: json(backAttr)
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
            if (_.isString(data)) {
              return data;
            } else if (_.isArray(data)) {
              return _.map(data, _getIdFromData);
            } else if (_.isObject(data)) {
              return data[_this5.modelid];
            }
            return null;
          };

          _.each(attributes, function (value, field) {
            var item = _.find(refKeys, { frontendKey: field });

            if (_.isUndefined(item)) {
              return;
            }

            item = _.defaults(item, {
              backendKey: null,
              frontendKey: null,
              backendKeyDeletion: true
            });

            if (item.backendKeyDeletion) {
              delete attributes[item.frontendKey];
            }

            var id = _getIdFromData(value);
            attributes[item.backendKey] = _.isUndefined(id) ? null : id;
          });

          return Promise.resolve(attributes);
        };

        Collection.prototype._backToFrontend = function _backToFrontend(attributes, backAttr, model, options) {
          var _this6 = this;

          var opts = options || {};
          var refKeys = this.refKeys();

          return Promise.all(_.map(backAttr, function (value, field) {
            var frontendKey = field;
            var backendKey = field;
            var frontendValue = Promise.resolve(attributes[backendKey]);

            var item = _.find(refKeys, { backendKey: field });
            if (!_.isUndefined(item)) {
              item = _.defaults(item, {
                backendKey: null,
                frontendKey: null,
                collection: null,
                backendKeyDeletion: true
              });

              frontendKey = item.frontendKey;
              backendKey = item.backendKey;

              if (!_.isNull(item.collection)) {
                frontendValue = _this6.container.get(Config).getCollection(item.collection).get(attributes[backendKey]);
              }
            }

            return frontendValue.then(function (result) {
              if (!_.has(opts.mergeStrategy) || opts.mergeStrategy === 'replace') {
                model[frontendKey] = result;
              } else if (opts.mergeStrategy === 'array') {
                if (_.isArray(model[frontendKey])) {
                  model[frontendKey] = _.union(model[frontendKey], result);
                } else {
                  model[frontendKey] = result;
                }
              } else {
                model[frontendKey] = _.merge(model[frontendKey], result);
              }
              return Promise.resolve(model);
            });
          }));
        };

        return Collection;
      }());

      _export('Collection', Collection);
    }
  };
});