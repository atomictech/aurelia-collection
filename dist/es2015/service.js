import _ from 'lodash';

import { json } from 'aurelia-fetch-client';

export let Service = class Service {

  constructor(container, key, defaultRoute, modelClass, modelid = '_id') {
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

  fromJSON(data, options) {
    let model = this._getFromCollection(data[this.modelid]);

    if (_.isUndefined(model)) {
      model = new this.ModelClass(data);
      if (!_.has(options, 'ignoreCollection')) {
        this.collection.push(model);
      }
    } else if (!this.isComplete(model) || _.has(options, 'force') && options.force) {
      this._syncFrom(model, data);
    }
    return Promise.resolve(model);
  }

  toJSON(model, options) {
    return _.isFunction(model.toJSON) ? model.toJSON() : model;
  }

  flush() {
    this.collection = [];
  }

  isComplete(model) {
    return true;
  }

  sync(model) {
    this.get(model[this.modelid], { force: true });
  }

  refKeys() {
    return [];
  }

  _setHttpClient(httpClient) {
    this._httpClient = httpClient;
  }

  _syncFrom(model, data) {
    _.defaults(model, data);
  }

  _getFromCollection(id) {
    let obj = {};
    obj[this.modelid] = id;
    return _.find(this.collection, obj);
  }

  _removeFromCollection(id) {
    let obj = {};
    obj[this.modelid] = id;
    _.remove(this.collection, obj);
  }

  _getById(id, force) {
    let model = this._getFromCollection(id);

    if (_.isUndefined(model) || !this.isComplete(model) || force) {
      return this._httpClient.fetch(this.defaultRoute + id).then(response => response.json()).then(data => {
        return this.fromJSON(data, { force: force });
      });
    }

    return Promise.resolve(model);
  }

  create(jsonModel, route) {
    let apiRoute = this.defaultRoute.slice(0, -1);

    if (!_.isNil(route)) {
      apiRoute += '/' + route;
    }

    return this._httpClient.fetch(apiRoute, {
      method: 'post',
      body: json(jsonModel)
    }).then(response => response.json()).then(data => this.get(data));
  }

  destroy(id, route) {
    let apiRoute = this.defaultRoute;

    if (!_.isNil(route)) {
      apiRoute += route;
    }

    this._removeFromCollection(id);
    return this._httpClient.fetch(apiRoute, {
      method: 'delete'
    }).then(response => response.json());
  }

  get(data, options) {
    options = _.defaults(options, {
      _child: false,
      force: false,
      recursive: false,
      populate: false
    });

    let modelPromise = null;

    if (_.isEmpty(data)) {
      return Promise.resolve(data);
    } else if (_.isArray(data)) {
      return modelPromise = Promise.all(_.map(data, item => this.get(item, options)));
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

    return modelPromise.then(model => {
      if (_.isNil(model)) {
        return model;
      }

      let childOpt = _.cloneDeep(options);
      if (childOpt._child) {
        childOpt.populate = childOpt.recursive = childOpt.recursive === true;
      }
      childOpt._child = true;

      return Promise.all(_.map(this.refKeys(model), item => {
        item = _.defaults(item, {
          backendKey: null,
          collection: null,
          frontendKey: null,
          backendKeyDeletion: true
        });

        let collection = this.container.collections[item.collection];
        if (_.isNil(item.backendKey) || _.isNull(item.collection) || _.isUndefined(collection)) {
          return;
        }

        if (_.isNil(item.frontendKey)) {
          item.frontendKey = item.backendKey;
        }

        let itemData = model[item.backendKey];
        return collection.get(itemData, childOpt).then(childrenItems => {
          if (!_.isNil(childrenItems) && isNotNullArray(childrenItems)) {
            if (item.backendKeyDeletion === true) {
              delete model[item.backendKey];
            }

            return model[item.frontendKey] = childrenItems;
          }
        });
      })).then(() => model);
    });
  }
};

function isNotNullArray(arr) {
  return !_.isArray(arr) || _.isEmpty(arr) || _.some(arr, _.negate(_.isNil));
}