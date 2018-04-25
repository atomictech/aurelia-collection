import _ from 'lodash';

import { Container } from 'aurelia-dependency-injection';
import { json } from 'aurelia-fetch-client';

import { Config } from './config';

/**
 * Collection class. A collection of models that are
 * related to a backend data store and accessible through REST API.
 */
export class Collection {
  /**
   * Configure the collection.
   * @param  {String} key : the key provided when the collection has been
   * registered
   * @param  {String} [defaultRoute] : route to use when performing the backend
   * http requests, to which the model id is to be appended where expected.
   * @param  {Function} [modelClass] : function to be called to be called to
   * create a model.
   * @param  {String} [modelid] : the key to use for uniqueness of the models in
   * order to store and search for them.
   */
  configure(key, modelClass, defaultRoute, modelid = '_id') {
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
   * collection when created.
   * - force attribute forces the sync of a model (when it already exists) even
   * if it is complete.
   * @return {Promise} a promise containg the resolved model created or got
   * from the models set saved within the collection. If data is null or
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

      // affect model attribute based on what the backend is sending, this avoid the need of constructor in models
      _.each(data, (value, key) => {
        model[key] = value;
      });

      // do not store the model in the collection flag
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
   * The models the collection collects may have references to other models
   * in other collections (i.e. collections).
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
   * Set the http client to be used for the requests made by the collection.
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
    _.mergeWith(model, data, (objValue, srcValue) => {
      if (_.isArray(objValue)) {
        return objValue = srcValue;
      }
    });
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
   * @param  {[type]} options [description]
   * @return {[type]}       [description]
   */
  _getById(id, options) {
    const opts = options || {};
    const apiRoute = opts.route || this.defaultRoute + id;
    let model = this._getFromCollection(id);

    if (_.isUndefined(model) || !this.isComplete(model) || opts.force) {
      return this._httpClient
        .fetch(apiRoute)
        .then(response => response.json())
        .then(data => {
          return this.fromJSON(data, { force: opts.force });
        });
    }

    return Promise.resolve(model);
  }

  /**
   * [create description]
   * @param  {[type]} jsonModel [description]
   * @param  {[type]} options   [description]
   * @return {[type]}           [description]
   */
  create(jsonModel, options) {
    const opts = options || {};
    const apiRoute = opts.route || this.defaultRoute.slice(0, -1);

    return this._httpClient
      .fetch(apiRoute, {
        method: 'post',
        body: opts.notJson ? jsonModel : json(jsonModel)
      }).then(response => response.json())
      .then(data => this.get(data));
  }

  /**
   * [destroy description]
   * @param  {[type]} id    [description]
   * @param  {[type]} route [description]
   * @return {[type]}       [description]
   */
  destroy(id, options) {
    const opts = options || {};
    const apiRoute = opts.route || this.defaultRoute + id;

    this._removeFromCollection(id);
    return this._httpClient.fetch(apiRoute, {
      method: 'delete'
    }).then(response => response.json());
  }

  /**
   * force fetch all models from a collection endpoint
   * @return {[Promise]}         return a Promise that fullfill a get on all models fetched
   */
  all(options) {
    return this._httpClient.fetch(this.defaultRoute)
      .then(response => response.json())
      .then(data => {
        return this.get(data, options);
      });
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
      modelPromise = this.fromJSON(data, options);
    } else { // If we end up here, then data is string. We'd better test whether it is an id, but we consider a string as a type of an id.
      if (!options._child) { // we are the root level, we want the model no matter what.
        modelPromise = this._getById(data, options);
      } else {
        if (options.populate === true) { // we are a child, so populate means we want the model level root + 1
          modelPromise = this._getById(data, options);
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

        // Removal of the route options since it is not supposed to be relevant for children paths.
        delete childOpt.route;

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
            let collection = this.container.get(Config).getCollection(item.collection);
            if (_.isNil(item.backendKey)) {
              return;
            }

            // If frontendKey has not been specified,
            // we consider it as equal to backendKey
            if (_.isNil(item.frontendKey)) {
              item.frontendKey = item.backendKey;
            }

            let itemData = _.get(model, item.backendKey);

            let itemDataPromise = Promise.resolve(null);

            // item.collection can be null if we want to keep JSON data.
            if (_.isNull(item.collection)) {
              itemDataPromise = Promise.resolve(itemData);
            } else if (!_.isNil(collection)) {
              itemDataPromise = collection.get(itemData, childOpt);
            }

            return itemDataPromise
              .then(childrenItems => {
                // Replace the model key if necessary.
                if (!_.isNil(childrenItems) && isNotNullArray(childrenItems)) {
                  if (item.backendKeyDeletion === true) {
                    _.unset(model, item.backendKey);
                  }

                  return _.set(model, item.frontendKey, _.pull(childrenItems, null, undefined));
                }
              });
          }))
          .then(() => model);
      });
  }

  /**
   * Try to find a model that match `predicate` attributes.
   * If no such model is found, try to use given fallbackUrl to retrieve it and return it.
   * Otherwise return `undefined`.
   *
   * @param {Object} predicate Attributes to find in collection.
   * @param {[String]} fallbackUrl A GET url endpoint where the model can be retrieved.
   * @returns Model found, otherwise `undefined`.
   * @memberof Collection
   */
  find(predicate, fallbackUrl) {
    let res = _.find(this.collection, predicate);
    if (_.isUndefined(res)) {
      if (_.isUndefined(fallbackUrl)) {
        return Promise.resolve();
      }

      return this._httpClient.fetch(fallbackUrl)
        .then(response => response.json())
        .then(data => {
          return this.get(data);
        });
    }

    return Promise.resolve(res);
  }

  /**
   * Allow to send a PUT method to the backend to update the model, and expect a response with the updated model.
   * @param  {[type]} model   [The model instance to update]
   * @param  {[type]} attr    [A literal object of attribute that should be updated]
   * @param  {[type]} options [{mergeStrategy: 'replace|array|all|ignore'}, mergeStrategy to correctly merge data recieved]
   * @return {[type]}         [A Promise resolving with the updated model instance]
   */
  update(model, attr, options) {
    const opts = options || {};
    const apiRoute = opts.route || this.defaultRoute + model[this.modelid];

    return this._frontToBackend(attr, opts)
      .then(backAttr => {
        return this._httpClient
          .fetch(apiRoute, {
            method: 'put',
            headers: { 'Content-Type': 'application/json' },
            body: opts.notJson ? backAttr : json(backAttr)
          }).then(response => response.json())
          .then(attributes => this._backToFrontend(attributes, backAttr, model, opts));
      }).then(() => model);
  }

  /**
   * [_frontToBackend description]
   * @param  {[type]} attributes [description]
   * @param  {[type]} options    [description]
   * @return {[type]}            [description]
   */
  _frontToBackend(attributes, options) {
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
        _.unset(attributes, item.frontendKey);
      }

      // browser request filter undefined fields, we need to explicitely set it to null to be sent to the backend. (in case of reseting the field)
      let id = _getIdFromData(value);
      _.set(attributes, item.backendKey, _.isUndefined(id) ? null : id);
    });

    return Promise.resolve(attributes);
  }

  /**
   * [_backToFrontend description]
   * @param  {[type]} attributes [description]
   * @param  {[type]} backAttr   [description]
   * @param  {[type]} model      [description]
   * @param  {[type]} options    [description]
   * @return {[type]}            [description]
   */
  _backToFrontend(attributes, backAttr, model, options) {
    const opts = options || {};
    const refKeys = this.refKeys();

    return Promise.all(_.map(backAttr, (value, field) => {
      let frontendKey = field;
      let backendKey = field;
      let frontendValue = Promise.resolve(value);

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
          frontendValue = this.container.get(Config).getCollection(item.collection).get(_.get(attributes, backendKey));
        }
      }

      // Update the right key in the model, with updateStrategy to replace, merge only arrays or merge all the attribute.
      return frontendValue.then(result => {
        if (!_.has(opts, 'mergeStrategy') || opts.mergeStrategy === 'replace') {
          _.set(model, frontendKey, result);
        } else if (opts.mergeStrategy === 'ignore') {
          return Promise.resolve(model);
        } else if (opts.mergeStrategy === 'array') {
          let currentFrontendValue = _.get(model, frontendKey);
          if (_.isArray(currentFrontendValue)) {
            _.set(model, frontendKey, _.union(currentFrontendValue, result));
          } else {
            _.set(model, frontendKey, result);
          }
        } else {
          _.set(model, frontendKey, _.merge(_.get(model, frontendKey), result));
        }
        return Promise.resolve(model);
      });
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
