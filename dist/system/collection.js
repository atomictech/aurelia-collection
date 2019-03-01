"use strict";

System.register(["lodash", "aurelia-dependency-injection", "aurelia-fetch-client", "./config"], function (_export, _context) {
  "use strict";

  var _, Container, json, Config, Collection;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
      _export("Collection", Collection = function () {
        function Collection() {
          _classCallCheck(this, Collection);

          _defineProperty(this, "_strategies", {
            replace: this._replaceStrategy,
            array: this._arrayStrategy,
            merge: this._mergeStrategy
          });
        }

        _createClass(Collection, [{
          key: "configure",
          value: function configure(key, modelClass, defaultRoute) {
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
          }
        }, {
          key: "fromJSON",
          value: function fromJSON(data, options) {
            var promise;

            if (_.isNil(data)) {
              return Promise.resolve(null);
            }

            options = _.defaults(options, {
              ignoreCollection: false,
              force: false,
              autoSet: true
            });

            var model = this._getFromCollection(data[this.modelid]);

            if (_.isUndefined(model)) {
              model = this.container.invoke(this.modelClass, data);

              if (options.autoSet) {
                _.each(data, function (value, key) {
                  model[key] = value;
                });
              }

              if (!options.ignoreCollection) {
                this.collection.push(model);
              }

              promise = Promise.resolve(model);
            } else if (!this.isComplete(model) || options.force) {
              promise = this._syncFrom(model, data);
            }

            return promise || Promise.resolve(model);
          }
        }, {
          key: "toJSON",
          value: function toJSON(model, options) {
            return _.isFunction(model.toJSON) ? model.toJSON() : model;
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
            return this.get(_.isString(model) ? model : model[this.modelid], _.merge({}, options, {
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
            return this._backToFrontend(data, model);
          }
        }, {
          key: "_getFromCollection",
          value: function _getFromCollection(id) {
            var obj = {};
            obj[this.modelid] = id;
            return _.find(this.collection, obj);
          }
        }, {
          key: "_removeFromCollection",
          value: function _removeFromCollection(id) {
            var obj = {};
            obj[this.modelid] = id;

            _.remove(this.collection, obj);
          }
        }, {
          key: "_getById",
          value: function _getById(id, options) {
            var _this = this;

            var opts = options || {};
            var apiRoute = opts.route || this.defaultRoute + id;

            var model = this._getFromCollection(id);

            if (_.isUndefined(model) || !this.isComplete(model) || opts.force) {
              return this._httpClient.fetch(apiRoute).then(function (response) {
                return response.json();
              }).then(function (data) {
                return _this.fromJSON(data, {
                  force: opts.force,
                  autoSet: opts.autoSet
                });
              });
            }

            return Promise.resolve(model);
          }
        }, {
          key: "_walk",
          value: function _walk(pointer, remainingPath, leafProcessor) {
            var _this2 = this;

            if (_.isNil(pointer)) {
              return Promise.resolve(null);
            }

            var remainingPathCopy = _.clone(remainingPath);

            var key = remainingPathCopy.shift();

            if (remainingPathCopy.length > 0) {
              if (_.isArray(pointer[key])) {
                return Promise.all(_.map(pointer[key], function (element) {
                  return _this2._walk(element, remainingPathCopy, leafProcessor);
                }));
              }

              return this._walk(pointer[key], remainingPathCopy, leafProcessor);
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
              body: opts.notJson ? jsonModel : json(jsonModel)
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
                return _this5.get(item, options);
              }));
            } else if (_.isObject(data)) {
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
              if (_.isNil(model)) {
                return model;
              }

              var childOpt = _.cloneDeep(options);

              delete childOpt.route;

              if (childOpt._child) {
                childOpt.populate = childOpt.recursive = childOpt.recursive === true;
              }

              childOpt._child = true;
              return Promise.all(_.map(_this5.refKeys(), function (item) {
                item = _.defaults(item, {
                  backendKey: null,
                  collection: null,
                  frontendKey: null,
                  backendKeyDeletion: true
                });

                var collection = _this5.container.get(Config).getCollection(item.collection);

                if (_.isNil(item.backendKey)) {
                  return;
                }

                if (_.isNil(item.frontendKey)) {
                  item.frontendKey = item.backendKey;
                }

                return _this5._walk(model, item.backendKey.split('.'), function (pointer, key) {
                  var itemData = _.get(pointer, key);

                  var itemDataPromise = Promise.resolve(null);

                  if (_.isNull(item.collection)) {
                    itemDataPromise = Promise.resolve(itemData);
                  } else if (!_.isNil(collection)) {
                    itemDataPromise = collection.get(itemData, childOpt);
                  }

                  return itemDataPromise.then(function (childrenItems) {
                    if (!_.isNil(childrenItems) && isNotNullArray(childrenItems)) {
                      if (item.backendKeyDeletion === true) {
                        _.unset(pointer, key);
                      }

                      return _.set(pointer, item.frontendKey, _.pull(childrenItems, null, undefined));
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

            var res = _.find(this.collection, predicate);

            if (_.isUndefined(res)) {
              if (_.isUndefined(fallbackUrl)) {
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
                body: opts.notJson ? backAttr : json(backAttr)
              }).then(function (response) {
                return response.json();
              }).then(function (attributes) {
                opts.attributeFilter = _.keys(backAttr);
                return _this7._backToFrontend(attributes, model, opts);
              });
            });
          }
        }, {
          key: "_replaceStrategy",
          value: function _replaceStrategy(targetModel, fieldName, newFieldValue) {
            _.set(targetModel, fieldName, newFieldValue);
          }
        }, {
          key: "_arrayStrategy",
          value: function _arrayStrategy(targetModel, fieldName, newFieldValue) {
            var currentValue = _.get(targetModel, fieldName);

            if (_.isArray(currentValue)) {
              _.set(targetModel, fieldName, _.union(currentValue, newFieldValue));
            } else {
              this._replaceStrategy(targetModel, fieldName, newFieldValue);
            }
          }
        }, {
          key: "_mergeStrategy",
          value: function _mergeStrategy(targetModel, fieldName, newFieldValue) {
            _.set(targetModel, fieldName, _.merge(_.get(targetModel, fieldName), newFieldValue));
          }
        }, {
          key: "_frontToBackend",
          value: function _frontToBackend(attributes, options) {
            var _this8 = this;

            var refKeys = this.refKeys();

            var _getIdFromData = function _getIdFromData(data) {
              if (_.isString(data)) {
                return data;
              } else if (_.isArray(data)) {
                return _.map(data, _getIdFromData);
              } else if (_.isObject(data)) {
                return data[_this8.modelid];
              }

              return null;
            };

            _.each(refKeys, function (entry) {
              entry = _.defaults(entry, {
                backendKey: null,
                frontendKey: null,
                backendKeyDeletion: true
              });
              var backendPath = entry.backendKey.split('.');
              var backendKey = backendPath.pop();

              var frontendPath = _.clone(backendPath);

              frontendPath.push(entry.frontendKey);

              _this8._walk(attributes, frontendPath, function (pointer, key) {
                if (!_.has(pointer, key)) {
                  return;
                }

                var val = _.get(pointer, key);

                if (entry.backendKeyDeletion) {
                  _.unset(pointer, key);
                }

                var id = _getIdFromData(val);

                _.set(pointer, backendKey, _.isUndefined(id) ? null : id);
              });
            });

            return Promise.resolve(attributes);
          }
        }, {
          key: "_backToFrontend",
          value: function _backToFrontend(attributes, model, options) {
            var _this9 = this;

            var attributesCopy = _.cloneDeep(attributes);

            var opts = _.defaults({}, options, {
              mergeStrategy: 'replace'
            });

            var refKeys = this.refKeys();
            var promises = [];

            if (opts.mergeStrategy === 'ignore') {
              return;
            }

            if (!_.isUndefined(opts.attributeFilter)) {
              var filter = _.isArray(opts.attributeFilter) ? opts.attributeFilter : _.keys(opts.attributeFilter);
              attributesCopy = _.pick(attributesCopy, filter);
            }

            _.each(refKeys, function (entry) {
              entry = _.defaults(entry, {
                backendKey: null,
                frontendKey: null,
                collection: null,
                backendKeyDeletion: true
              });

              if (_.isNull(entry.collection)) {
                return;
              }

              var backendPath = entry.backendKey.split('.');
              promises.push(_this9._walk(attributesCopy, backendPath, function (pointer, key) {
                if (!_.has(pointer, key)) {
                  return;
                }

                var val = _.get(pointer, key);

                if (entry.backendKeyDeletion) {
                  _.unset(pointer, key);
                }

                return _this9.container.get(Config).getCollection(entry.collection).get(val).then(function (modelRef) {
                  _.set(pointer, entry.frontendKey, modelRef);
                });
              }));
            });

            return Promise.all(promises).then(function () {
              var updateModel = _this9._strategies[opts.mergeStrategy] || _this9._strategies.merge;

              _.each(attributesCopy, function (value, field) {
                updateModel(model, field, value);
              });

              return Promise.resolve(model);
            });
          }
        }]);

        return Collection;
      }());
    }
  };
});