import { _ } from 'lodash';

import { Container } from 'aurelia-dependency-injection';
import { json } from 'aurelia-fetch-client';

import { Config } from './config';

/**
 * Service class. A collection of models that are
 * related to a backend service.
 */
export class Service {

  /**
   * Configure the service.
   * @param  {String} key : the key provided when the service has been
   * registered
   * @param  {String} defaultRoute : route to use when performing the backend
   * http requests, to which the model id is to be appended where expected.
   * @param  {Function} modelClass : function to be called to be called to
   * create a model.
   * @param  {String} modelid : the key to use for uniqueness of the models in
   * order to store and search for them.
   */
  configure(key, defaultRoute, modelClass, modelid = '_id') {
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

  /**
   * Creates or syncs a model from data.
   * @param  {Object} data : the content of the model to use for its creation
   * or its sync.
   * @param  {Object} options : modifiers for the method:
   * - ignoreCollection attribute can prevent the model from being stored in the
   * service when created.
   * - force attribute forces the sync of a model (when it already exists) even
   * if it is complete.
   * @return {Promise} a promise containg the resolved model created or got
   * from the models set saved within the service. If data is null or
   * undefined, it resolves to null.
   */
  fromJSON(data, options) {
    if (_.isNil(data)) {
      return Promise.resolve(null);
    }

    options = _.defaults(options, {
      ignoreCollection: false,
      force: false
    });

    let model = this._getFromCollection(data[this.modelid]);

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

  /**
   * Converts a model to a literal object. It usually calls the model's `toJSON`
   * method.
   * @param  {Model} model : the instance to be converted.
   * @param {Object} options : a placeholder argument that may be used when the
   * function is overloaded.
   * @return {Object} : the literal object made of the model's content.
   */
  toJSON(model, options) {
    return _.isFunction(model.toJSON) ? model.toJSON() : model;
  }

  /**
   * Clears the set from the models it contained.
   */
  flush() {
    this.collection = [];
  }

  /**
   * Checks if a model is complete, that is whether all the required fields
   * have been filled. If a model is not complete, then it can be fetched
   * again and then `_syncFrom`ed.
   * @param  {Model}  model : the model to check for completeness.
   * @return {Boolean} true if a model is considered as complete, false.
   * otherwise
   */
  isComplete(model) {
    return true;
  }

  /**
   * Sets the content of a model
   * @param  {String or Object} model : if it is a string, model is treated as
   * a model's id, otherwise it is treated as the content of the model to set.
   * @param  {Object} options : options to be provided to the get method, with
   * `force` attribute set to true to force the request to the backend and the
   * assignement of the received data to the model.
   * @return {Promise} a promise when the sync is done with the synced model.
   */
  sync(model, options) {
    return this.get(_.isString(model) ? model : model[this.modelid], _.merge({}, options, { force: true }));
  }

  /**
   * The models the service collects may have references to other models
   * in other services (i.e. collections).
   * This method defines which keys may contain references, the name of
   * the key when received from the backend's data, and its name in the model
   * class (i.e. `frontendKey`)
   * @return {Array} an array of objects which should be made of 3 keys:
   * - a backendKey, the `old` key in the data.
   * - a frontendKey, the `new` key in the model.
   * - and a collection, the collection from which the items will be 'got'.
   */
  refKeys() {
    return [];
  }

  /**
   * Set the http client to be used for the requests made by the service.
   * @param {Object} httpClient : an http client supporting the fetch API.
   */
  _setHttpClient(httpClient) {
    this._httpClient = httpClient;
  }

  /**
   * Affects the content of data to a model.
   * @param  {Model} model : the instance to be modified.
   * @param  {Object} data : the data to set to model.
   */
  _syncFrom(model, data) {
    _.defaults(model, data);
  }

  /**
   * Get a model by id.
   * @param  {String} id : the id of the model to be searched for.
   * @return {Model} : the matched model or undefined otherwise.
   */
  _getFromCollection(id) {
    let obj = {};
    obj[this.modelid] = id;
    return _.find(this.collection, obj);
  }

  /**
   * Remove a model from the collection by id.
   * @param  {String} id : the id of the model to be removed.
   */
  _removeFromCollection(id) {
    let obj = {};
    obj[this.modelid] = id;
    _.remove(this.collection, obj);
  }

  /**
   * [_getById description]
   * @param  {[type]} id    [description]
   * @param  {[type]} force [description]
   * @return {[type]}       [description]
   */
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

  /**
   * [create description]
   * @param  {[type]} jsonModel [description]
   * @param  {[type]} route     [description]
   * @return {[type]}           [description]
   */
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

  /**
   * [destroy description]
   * @param  {[type]} id    [description]
   * @param  {[type]} route [description]
   * @return {[type]}       [description]
   */
  destroy(id, route) {
    let apiRoute = this.defaultRoute;

    if (!_.isNil(route)) {
      apiRoute += route;
    } else {
      apiRoute += id;
    }

    this._removeFromCollection(id);
    return this._httpClient.fetch(apiRoute, {
      method: 'delete'
    }).then(response => response.json());
  }

  /**
   * [get description]
   * @param  {[type]} data    [description]
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */
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
              let collection = this.container.get(Config).getService(item.collection);
              if (_.isNil(item.backendKey)) {
                return;
              }

              // If frontendKey has not been specified,
              // we consider it as equal to backendKey
              if (_.isNil(item.frontendKey)) {
                item.frontendKey = item.backendKey;
              }

              let itemData = model[item.backendKey];

              let itemDataPromise = Promise.resolve(null);

              // item.collection can be null if we want to keep JSON data.
              if (_.isNull(item.collection)) {
                itemDataPromise = Promise.resolve(itemData);
              } else if (!_.isUndefined(collection)) {
                itemDataPromise = collection.get(itemData, childOpt);
              }

              return itemDataPromise
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

  /**
   * [update description]
   * @param  {[type]} model [description]
   * @param  {[type]} attr  [description]
   * @return {[type]}       [description]
   */
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

  /**
   * [_frontToBackend description]
   * @param  {[type]} attributes [description]
   * @return {[type]}            [description]
   */
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
      return null;
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

      // browser request filter undefined fields, we need to explicitely set it to null to be sent to the backend. (in case of reseting the field)
      let id = _getIdFromData(value);
      attributes[item.backendKey] = _.isUndefined(id) ? null : id;
    });

    return Promise.resolve(attributes);
  }

  /**
   * [_backToFrontend description]
   * @param  {[type]} attributes [description]
   * @param  {[type]} backAttr   [description]
   * @param  {[type]} model      [description]
   * @return {[type]}            [description]
   */
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
          collection: null,
          backendKeyDeletion: true
        });

        frontendKey = item.frontendKey;
        backendKey = item.backendKey;

        // item.collection can be null if we want to keep JSON data.
        if (!_.isNull(item.collection)) {
          frontendValue = this.container.get(Config).getService(item.collection).get(attributes[backendKey]);
        }
      }

      // Update the right key in the model.
      return frontendValue.then(result => model[frontendKey] = result);
    }));
  }

}

/**
 * Helper function to check that an object is not an `array filled with null
 * values`.
 * @param  {Any}  arr : the `object` to check.
 * @return {Boolean} false it is an array filled with `null` values, true
 * otherwise.
 */
function isNotNullArray(arr) {
  // If the arr is an empty array, it is NOT a null array.
  // Therefore we can't compact it and check if it is empty.
  return !_.isArray(arr) || _.isEmpty(arr) || _.some(arr, _.negate(_.isNil));
}
