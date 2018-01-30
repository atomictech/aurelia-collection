System.register(["lodash", "aurelia-dependency-injection", "aurelia-fetch-client", "./config"], function (_export, _context) {
  "use strict";

  var _, Container, json, Config, Collection;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
            _.merge(model, data);
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
              body: options.notJson ? jsonModel : json(jsonModel)
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
                return _this4.get(item, options);
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
              return Promise.all(_.map(_this4.refKeys(model), function (item) {
                item = _.defaults(item, {
                  backendKey: null,
                  collection: null,
                  frontendKey: null,
                  backendKeyDeletion: true
                });

                var collection = _this4.container.get(Config).getCollection(item.collection);

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
          }
        }, {
          key: "find",
          value: function find(predicate, fallbackUrl) {
            var _this5 = this;

            return new Promise(function (resolve, reject) {
              var res = _.find(_this5.collection, predicate);

              if (_.isUndefined(res)) {
                if (_.isUndefined(fallbackUrl)) {
                  return resolve();
                }

                return _this5._httpClient.fetch(fallbackUrl).then(function (response) {
                  return response.json();
                }).then(function (data) {
                  return _this5.get(data, options);
                });
              }

              return resolve(res);
            });
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
                body: options.notJson ? backAttr : json(backAttr)
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
              if (_.isString(data)) {
                return data;
              } else if (_.isArray(data)) {
                return _.map(data, _getIdFromData);
              } else if (_.isObject(data)) {
                return data[_this7.modelid];
              }

              return null;
            };

            _.each(attributes, function (value, field) {
              var item = _.find(refKeys, {
                frontendKey: field
              });

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
          }
        }, {
          key: "_backToFrontend",
          value: function _backToFrontend(attributes, backAttr, model, options) {
            var _this8 = this;

            var opts = options || {};
            var refKeys = this.refKeys();
            return Promise.all(_.map(backAttr, function (value, field) {
              var frontendKey = field;
              var backendKey = field;
              var frontendValue = Promise.resolve(attributes[backendKey]);

              var item = _.find(refKeys, {
                backendKey: field
              });

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
                  frontendValue = _this8.container.get(Config).getCollection(item.collection).get(attributes[backendKey]);
                }
              }

              return frontendValue.then(function (result) {
                if (!_.has(opts, 'mergeStrategy') || opts.mergeStrategy === 'replace') {
                  model[frontendKey] = result;
                } else if (opts.mergeStrategy === 'ignore') {
                  return Promise.resolve(model);
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
          }
        }]);

        return Collection;
      }());

      _export("Collection", Collection);
    }
  };
});