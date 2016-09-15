import { _ } from 'lodash';

import { Aurelia, inject } from 'aurelia-framework';
import { HttpClient } from 'aurelia-fetch-client';

function ObjectCreator(data) {
  return _.cloneDeep(data);
}

/**
 * Config class. Configures and stores collections instances.
 */
@inject(Aurelia, HttpClient)
export class Config {

  /**
   * Config constructor.
   * @param  {Aurelia} aurelia : the aurelia object containing all containers.
   * @param  {Object} httpClient : the http client of our choice.
   */
  constructor(aurelia, httpClient) {
    this.httpClient = httpClient;
    this.aurelia = aurelia;
  }

  collections = {};
  defaultCollection = null;

  /**
   * [registerCollection description]
   * @param  {String} key : the key to identify a collection, such as a
   * string.
   * @param  {String} defaultRoute : route to use when performing the backend
   * http requests, to which the model id is to be appended where expected.
   * @param  {Service} collectionService : a collection of models (such as a
   * `Service`) to be stored.
   * @param  {Function} modelClass : a function to be called when new data has
   * been retrieved from the backend (i.e. not already known thanks to the
   * modelid key)?
   * @param  {String} modelid : the key to use as the id (uniqueness) in the
   * modelClass instances.
   * @return {Config} the current Config instance.
   */
  registerCollection(key, defaultRoute, collectionService, modelClass = ObjectCreator, modelid = '_id') {
    this.collections[key] = collectionService;
    collectionService.configure(this.aurelia.container, this, key, defaultRoute, modelClass, modelid);

    this.collections[key]._setHttpClient(this.httpClient);

    return this;
  }

  /**
   * Get a registered collection by key.
   * @param  {String} key : a registered key.
   * @return {Service} : the collection when found or null otherwise.
   */
  getCollection(key) {
    if (!key) {
      return this.defaultCollection || null;
    }

    return this.collections[key] || null;
  }

  /**
   * Checks if a collection exists for a specific key.
   * @param  {String} key : the key to search for a collection.
   * @return {Boolean} True if a collection exists for the key, false
   * otherwise.
   */
  collectionExists(key) {
    return !!this.collections[key];
  }

  /**
   * Set a collection as the default by searching by key.
   * @param {String} key : the key to search for a collection.
   * @return {Config} the current Config instance.
   */
  setDefaultCollection(key) {
    this.defaultCollection = this.getCollection(key);

    return this;
  }
}
