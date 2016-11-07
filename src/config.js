import { _ } from 'lodash';

import { inject } from 'aurelia-framework';
import { Container } from 'aurelia-dependency-injection';
import { HttpClient } from 'aurelia-fetch-client';
import { Collection } from './collection';

function ObjectCreator(data) {
  return _.cloneDeep(data);
}

/**
 * Config class. Configures and stores collection instances.
 */
@inject(HttpClient)
export class Config {

  /**
   * Config constructor.
   * @param  {Aurelia} aurelia : the aurelia object containing all containers.
   * @param  {Object} httpClient : the http client of our choice.
   */
  constructor(httpClient) {
    this.container = Container.instance;
    this.httpClient = httpClient;
  }

  collections = {};
  defaultCollection = null;

  /**
   * Register a collection for it to be use thanks to the `Collection` resolver.
   * Additional params are used to configure the collection.
   * @param  {String} key : the key to identify a collection, such as a string.
   * @param  {String} [defaultRoute] : route to use when performing the backend
   * http requests, to which the model id is to be appended where expected.
   * @param  {Collection} collection : a collection of models (as a `Collection` instance)
   * to be stored.
   * @param  {Function} [modelClass] : a function to be called when new data has
   * been retrieved from the backend (i.e. not already known thanks to the
   * modelid key)?
   * @param  {String} [modelid] : the key to use as the id (uniqueness) in the
   * modelClass instances.
   * @return {Config} the current Config instance.
   */
  registerCollection(key, defaultRoute, collection = Collection, modelClass = ObjectCreator, modelid = '_id') {
    let c = this.container.invoke(collection);
    this.collections[key] = c;
    c.configure(key, modelClass, defaultRoute, modelid);

    this.collections[key]._setHttpClient(this.httpClient);

    return c;
  }

  /**
   * Get a registered collection by key.
   * @param  {String} key : a registered key.
   * @return {Collection} : the collection when found or null otherwise.
   */
  getCollection(key) {
    if (!key) {
      return this.defaultCollection || null;
    }

    return this.collections[key] || null;
  }

  /**
   * Checks if a collection exists (i.e. is registered) for a specific key.
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
