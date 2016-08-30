'use strict';

System.register(['lodash', 'aurelia-fetch-client'], function (_export, _context) {
  "use strict";

  var _, json, Service;

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
    }, function (_aureliaFetchClient) {
      json = _aureliaFetchClient.json;
    }],
    execute: function () {
      _export('Service', Service = function () {
        function Service() {
          _classCallCheck(this, Service);
        }

        Service.prototype.configure = function configure(container, plugin, key, defaultRoute, modelClass) {
          var modelid = arguments.length <= 5 || arguments[5] === undefined ? '_id' : arguments[5];

          if (_.isUndefined(defaultRoute)) {
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
          var model = this._getFromCollection(data[this.modelid]);

          if (_.isUndefined(model)) {
            model = this.container.invoke(this.modelClass, data);

            if (!_.has(options, 'ignoreCollection')) {
              this.collection.push(model);
            }
          } else if (!this.isComplete(model) || _.has(options, 'force') && options.force) {
            this._syncFrom(model, data);
          }
          return Promise.resolve(model);
        };

        Service.prototype.toJSON = function toJSON(model, options) {
          return _.isFunction(model.toJSON) ? model.toJSON() : model;
        };

        Service.prototype.flush = function flush() {
          this.collection = [];
        };

        Service.prototype.isComplete = function isComplete(model) {
          return true;
        };

        Service.prototype.sync = function sync(model) {
          this.get(model[this.modelid], { force: true });
        };

        Service.prototype.refKeys = function refKeys() {
          return [];
        };

        Service.prototype._setHttpClient = function _setHttpClient(httpClient) {
          this._httpClient = httpClient;
        };

        Service.prototype._syncFrom = function _syncFrom(model, data) {
          _.defaults(model, data);
        };

        Service.prototype._getFromCollection = function _getFromCollection(id) {
          var obj = {};
          obj[this.modelid] = id;
          return _.find(this.collection, obj);
        };

        Service.prototype._removeFromCollection = function _removeFromCollection(id) {
          var obj = {};
          obj[this.modelid] = id;
          _.remove(this.collection, obj);
        };

        Service.prototype._getById = function _getById(id, force) {
          var _this = this;

          var model = this._getFromCollection(id);

          if (_.isUndefined(model) || !this.isComplete(model) || force) {
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

          if (!_.isNil(route)) {
            apiRoute += '/' + route;
          }

          return this._httpClient.fetch(apiRoute, {
            method: 'post',
            body: json(jsonModel)
          }).then(function (response) {
            return response.json();
          }).then(function (data) {
            return _this2.get(data);
          });
        };

        Service.prototype.destroy = function destroy(id, route) {
          var apiRoute = this.defaultRoute;

          if (!_.isNil(route)) {
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

          options = _.defaults(options, {
            _child: false,
            force: false,
            recursive: false,
            populate: false
          });

          var modelPromise = null;

          if (_.isEmpty(data)) {
            return Promise.resolve(data);
          } else if (_.isArray(data)) {
            return modelPromise = Promise.all(_.map(data, function (item) {
              return _this3.get(item, options);
            }));
          } else if (_.isObject(data)) {
            modelPromise = this.fromJSON(data);
          } else if (_.isString(data)) {
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
            if (_.isNil(model)) {
              return model;
            }

            var childOpt = _.cloneDeep(options);
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

              var collection = _this3.plugin.collections[item.collection];
              if (_.isNil(item.backendKey) || _.isNull(item.collection) || _.isUndefined(collection)) {
                return;
              }

              if (_.isNil(item.frontendKey)) {
                item.frontendKey = item.backendKey;
              }

              var itemData = model[item.backendKey];
              return collection.get(itemData, childOpt).then(function (childrenItems) {
                if (!_.isNil(childrenItems) && isNotNullArray(childrenItems)) {
                  if (item.backendKeyDeletion === true) {
                    delete model[item.backendKey];
                  }

                  return model[item.frontendKey] = childrenItems;
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
              body: json(backAttr)
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
            if (_.isString(data)) {
              return data;
            } else if (_.isArray(data)) {
              return _.map(data, _getIdFromData);
            } else if (_.isObject(data)) {
              return data[_this5.modelid];
            }
          };

          _.each(attributes, function (value, field) {
            var item = _.find(refKeys, { frontendKey: field });
            item = _.defaults(item, {
              backendKey: null,
              frontendKey: null,
              backendKeyDeletion: true
            });

            if (_.isUndefined(item)) {
              return;
            }

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

          return Promise.all(_.map(backAttr, function (value, field) {
            var frontendKey = field;
            var backendKey = field;
            var frontendValue = Promise.resolve(attributes[backendKey]);

            var item = _.find(refKeys, { backendKey: field });
            item = _.defaults(item, {
              backendKey: null,
              frontendKey: null,
              backendKeyDeletion: true
            });

            if (!_.isUndefined(item)) {
              frontendKey = item.frontendKey;
              backendKey = item.backendKey;
              frontendValue = _this6.container.collections[item.collection].get(attributes[backendKey]);
            }

            return frontendValue.then(function (result) {
              return model[frontendKey] = result;
            });
          }));
        };

        return Service;
      }());

      _export('Service', Service);
    }
  };
});