import _ from 'lodash';

import { Aurelia, inject } from 'aurelia-framework';
import { HttpClient } from 'aurelia-fetch-client';

function ObjectCreator(data) {
  return _.cloneDeep(data);
}

/**
 * Config class. Configures and stores collections services
 */
@inject(Aurelia, HttpClient)
export class Config {

  constructor(aurelia, httpClient) {
    this.httpClient = httpClient;
    this.aurelia = aurelia;
  }

  collections = {};
  defaultCollection = null;

  registerCollection(key, defaultRoute, collectionService, modelClass = ObjectCreator, modelid = '_id') {
    this.collections[key] = collectionService;
    collectionService.configure(this.aurelia.container, this, key, defaultRoute, modelClass, modelid);

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
