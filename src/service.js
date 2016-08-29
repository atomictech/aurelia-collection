import _ from 'lodash';

import { json } from 'aurelia-fetch-client';
import { ModelFactory } from './model-factory';

export class Service {

  constructor(container, key, defaultRoute, modelFactory = ModelFactory, modelid = '_id') {
    if (_.isUndefined(defaultRoute)) {
      defaultRoute = '/api/' + key + '/';
    }

    this.modelid = modelid;
    this.defaultRoute = defaultRoute;
    this.modelFactory = modelFactory;
    this.collection = [];
    this.container = container;

    this._httpClient = null;
  }

  fromJSON(data, options) {
    let model = this._getFromCollection(data[this.modelid]);

    if (_.isUndefined(model)) {
      model = this.modelFactory.create(data);
      if (!_.has(options, 'ignoreCollection')) {
        this.collection.push(model);
      }
    } else if (!this.isComplete(model) || (_.has(options, 'force') && options.force)) {
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

  // Should be an array of objects
  // The objects should be made of 3 keys:
  // a backendKey, the `old` key in the data
  // a frontendKey, the `new` key in the model
  // and a collection, the collection from which the items will be 'got'.
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
      return this._httpClient
        .fetch(this.defaultRoute + id)
        .then(response => response.json())
        .then(data => {
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

    return this._httpClient
      .fetch(apiRoute, {
        method: 'post',
        body: json(jsonModel)
      }).then(response => response.json())
      .then(data => this.get(data));
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

    if (_.isEmpty(data)) { // you cannot get nothing
      return Promise.resolve(null);
    } else if (_.isArray(data)) { // you iterate on the array, and go one level deeper (for ID or JSON array)
      return modelPromise = Promise.all(_.map(data, item => this.get(item, options)));
    } else if (_.isObject(data)) { // you already have the json data, just instanciate the model
      modelPromise = this.fromJSON(data);
    } else if (_.isString(data)) { // Test whether it is an id.
      if (!options._child) { // we are the root level, we want the model no matter what.
        modelPromise = this._getById(data, options.force);
      } else {
        if (options.populate === true) { // we are a child, so populate means we want the model level root + 1
          modelPromise = this._getById(data, options.force);
        } else { // otherwise, we want to keep the backend data (the reference IDs)
          modelPromise = Promise.resolve(null);
        }
      }
    }

    return modelPromise
      .then(model => {
        // we don't need to inspect our children, as we are empty
        if (_.isNil(model)) {
          return model;
        }

        // if we are a grand child or more, we suppose that recursive take ownership of population for all the decendants levels
        let childOpt = _.cloneDeep(options);
        if (childOpt._child) {
          childOpt.populate = childOpt.recursive = (childOpt.recursive === true);
        }
        childOpt._child = true;

        // each reference attribute (described by the model class) is replaced by the matching model instance if we ask for population
        return Promise.all(
            _.map(this.refKeys(model), item => {
              item = _.defaults(item, {
                backendKey: null,
                collection: null,
                frontendKey: null,
                backendKeyDeletion: true
              });

              // collection and backendKey have to be defined.
              let collection = this.container.collections[item.collection];
              if (_.isNil(item.backendKey) || _.isNull(item.collection) || _.isUndefined(collection)) {
                return;
              }

              // If frontendKey has not been specified,
              // we consider it as equal to backendKey
              if (_.isNil(item.frontendKey)) {
                item.frontendKey = item.backendKey;
              }

              let itemData = model[item.backendKey];
              return collection.get(itemData, childOpt)
                .then(childrenItems => {
                  // Replace the model key if necessary.
                  if (!_.isNil(childrenItems) && isNotNullArray(childrenItems)) {
                    if (item.backendKeyDeletion === true) {
                      delete model[item.backendKey];
                    }

                    return model[item.frontendKey] = childrenItems;
                  }
                });
            }))
          .then(() => model);
      });
  }
}

function isNotNullArray(arr) {
  return _.some(arr, _.negate(_.isNil));
}
