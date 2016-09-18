import { _ } from 'lodash';

import { inject } from 'aurelia-framework';
import { HttpClient } from 'aurelia-fetch-client';

function ObjectCreator(data) {
  return _.cloneDeep(data);
}

/**
 * Config class. Configures and stores service instances.
 */
@inject(HttpClient)
export class Config {

  /**
   * Config constructor.
   * @param  {Aurelia} aurelia : the aurelia object containing all containers.
   * @param  {Object} httpClient : the http client of our choice.
   */
  constructor(httpClient) {
    this.httpClient = httpClient;
  }

  services = {};
  defaultService = null;

  /**
   * Register a service for it to be use thanks to the `Collection` resolver.
   * Additional params are used to configure the service.
   * @param  {String} key : the key to identify a service, such as a string.
   * @param  {String} defaultRoute : route to use when performing the backend
   * http requests, to which the model id is to be appended where expected.
   * @param  {Service} service : a collection of models (as a `Service` instance)
   * to be stored.
   * @param  {Function} modelClass : a function to be called when new data has
   * been retrieved from the backend (i.e. not already known thanks to the
   * modelid key)?
   * @param  {String} modelid : the key to use as the id (uniqueness) in the
   * modelClass instances.
   * @return {Config} the current Config instance.
   */
  registerService(key, defaultRoute, service, modelClass = ObjectCreator, modelid = '_id') {
    this.services[key] = service;
    service.configure(key, defaultRoute, modelClass, modelid);

    this.services[key]._setHttpClient(this.httpClient);

    return this;
  }

  /**
   * Get a registered service by key.
   * @param  {String} key : a registered key.
   * @return {Service} : the service when found or null otherwise.
   */
  getService(key) {
    if (!key) {
      return this.defaultService || null;
    }

    return this.services[key] || null;
  }

  /**
   * Checks if a service exists (i.e. is registered) for a specific key.
   * @param  {String} key : the key to search for a service.
   * @return {Boolean} True if a service exists for the key, false
   * otherwise.
   */
  serviceExists(key) {
    return !!this.services[key];
  }

  /**
   * Set a service as the default by searching by key.
   * @param {String} key : the key to search for a service.
   * @return {Config} the current Config instance.
   */
  setDefaultService(key) {
    this.defaultService = this.getService(key);

    return this;
  }
}
