var _dec, _class;

import { inject } from 'aurelia-framework';
import { HttpClient } from 'aurelia-fetch-client';
import { Service } from './service';

export let Config = (_dec = inject(HttpClient), _dec(_class = class Config {

  constructor(httpClient) {
    this.collections = {};
    this.defaultCollection = null;

    this.httpClient = httpClient;
  }

  registerCollection(key, defaultRoute, modelClass = Object, modelid = '_id', ServiceClass = Service) {

    this.collections[key] = new ServiceClass(this, key, defaultRoute, modelClass, modelid);
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
}) || _class);