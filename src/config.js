import { inject } from 'aurelia-framework';
import { HttpClient } from 'aurelia-fetch-client';
import { Service } from './service';

/**
 * Config class. Configures and stores collections services
 */
@inject(HttpClient)
export class Config {

  constructor(httpClient) {
    this.httpClient = httpClient;
  }

  collections = {};
  defaultCollection = null;

  registerCollection(key, defaultRoute, modelClass = Object, ServiceClass = Service) {

    this.collections[key] = new ServiceClass(this, key, defaultRoute, modelClass);
    this.collections[key]._setHttpClient(this.httpClient);

    return this;
  }

  getCollection(key) {
    if (!key) {
      return this.defaultCollection || null;
    }

    return this.collections[key] || null;
  }

  collectionExists(key) {
    return !!this.collections[key];
  }

  setDefaultCollection(key) {
    this.defaultCollection = this.getCollection(key);

    return this;
  }
}
