'use strict';

System.register(['lodash', './config'], function (_export, _context) {
  "use strict";

  var _, Config, Service;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function isNullArray(arr) {
    return _.every(arr, _.isNil);
  }
  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_config) {
      Config = _config.Config;
    }],
    execute: function () {
      _export('Service', Service = function () {
        function Service(container, key, defaultRoute, modelClass) {
          var modelid = arguments.length <= 4 || arguments[4] === undefined ? '_id' : arguments[4];

          _classCallCheck(this, Service);

          if (_.isUndefined(defaultRoute)) {
            defaultRoute = '/api/' + key + '/';
          }

          this.modelid = modelid;
          this.defaultRoute = defaultRoute;
          this.ModelClass = modelClass;
          this.collection = [];
          this.container = container;

          this._httpClient = null;
        }

        Service.prototype.fromJSON = function fromJSON(data, options) {
          var model = this._getFromCollection(data[this.modelid]);

          if (_.isUndefined(model)) {
            model = new this.ModelClass(data);
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
              return _this.fromJSON(data);
            });
          }

          return Promise.resolve(model);
        };

        Service.prototype.create = function create(jsonModel) {
          var _this2 = this;

          return this._httpClient.fetch(this.defaultRoute.slice(0, -1), {
            method: 'post',
            body: json(jsonModel)
          }).then(function (response) {
            return response.json();
          }).then(function (data) {
            return _this2.get(data);
          });
        };

        Service.prototype.destroy = function destroy(id) {
          this._removeFromCollection(id);
          return this.http.fetch(this.defaultRoute + id, {
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
            return Promise.resolve(null);
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

            return Promise.all(_.map(_this3._refKeys(model), function (item) {
              var itemData = model[item.backendKey];
              return _this3.container[item.service].get(itemData, childOpt).then(function (childrenItems) {
                if (!_.isNil(childrenItems) && !isNullArray(childrenItems)) {
                  delete model[item.backendKey];
                  return model[item.frontendKey] = childrenItems;
                }
              });
            })).then(function () {
              return model;
            });
          });
        };

        return Service;
      }());

      _export('Service', Service);
    }
  };
});