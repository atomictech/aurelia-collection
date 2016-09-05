import _ from 'lodash';

import { json } from 'aurelia-fetch-client';

export class Service {

  configure(container, plugin, key, defaultRoute, modelClass, modelid = '_id') {
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
  }

  fromJSON(data, options) {
    if (_.isNil(data)) {
      return Promise.resolve(null);
    }

    let model = this._getFromCollection(data[this.modelid]);

    if (_.isUndefined(model)) {
      model = this.container.invoke(this.modelClass, data);

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
    return this.get(_.isString(model) ? model : model[this.modelid], { force: true });
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

    if (_.isEmpty(data) || _.isUndefined(data)) { // you cannot get nothing
      return Promise.resolve(data);
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
              let collection = this.plugin.collections[item.collection];
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

                    return model[item.frontendKey] = _.pull(childrenItems, null, undefined);
                  }
                });
            }))
          .then(() => model);
      });
  }

  update(model, attr) {
    return this._frontToBackend(attr)
      .then(backAttr => {
        return this._httpClient
          .fetch(this.defaultRoute + model[this.modelid], {
            method: 'put',
            headers: { 'Content-Type': 'application/json' },
            body: json(backAttr)
          }).then(response => response.json())
          .then(attributes => this._backToFrontend(attributes, backAttr, model));
      }).then(() => model);
  }

  _frontToBackend(attributes) {
    const refKeys = this.refKeys();

    let _getIdFromData = (data) => {
      if (_.isString(data)) {
        return data;
      } else if (_.isArray(data)) {
        return _.map(data, _getIdFromData);
      } else if (_.isObject(data)) {
        return data[this.modelid];
      }
    };

    _.each(attributes, (value, field) => {
      let item = _.find(refKeys, { frontendKey: field });
      // If undefined, nothing to convert.
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

      attributes[item.backendKey] = _getIdFromData(value);
    });

    return Promise.resolve(attributes);
  }

  _backToFrontend(attributes, backAttr, model) {
    const refKeys = this.refKeys();

    return Promise.all(_.map(backAttr, (value, field) => {
      let frontendKey = field;
      let backendKey = field;
      let frontendValue = Promise.resolve(attributes[backendKey]);

      // The current field is a frontend type of key.
      let item = _.find(refKeys, { backendKey: field });
      if (!_.isUndefined(item)) {
        item = _.defaults(item, {
          backendKey: null,
          frontendKey: null,
          backendKeyDeletion: true
        });

        frontendKey = item.frontendKey;
        backendKey = item.backendKey;
        frontendValue = this.plugin.collections[item.collection].get(attributes[backendKey]);
      }

      // Update the right key in the model.
      return frontendValue.then(result => model[frontendKey] = result);
    }));
  }

}

function isNotNullArray(arr) {
  // If the arr is an empty array, it is NOT a null array.
  // Therefore we can't compact it and check if it is empty.
  return !_.isArray(arr) || _.isEmpty(arr) || _.some(arr, _.negate(_.isNil));
}
