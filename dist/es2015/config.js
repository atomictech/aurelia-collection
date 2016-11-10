var _dec, _class;

import { _ } from 'lodash';

import { Aurelia, inject } from 'aurelia-framework';
import { Container } from 'aurelia-dependency-injection';
import { HttpClient } from 'aurelia-fetch-client';
import { Collection } from './collection';

function ObjectCreator(data) {
  return _.cloneDeep(data);
}

export let Config = (_dec = inject(Aurelia, HttpClient), _dec(_class = class Config {
  constructor(aurelia, httpClient) {
    this.collections = {};
    this.defaultCollection = null;

    this.aurelia = aurelia;
    this.container = Container.instance;
    this.httpClient = httpClient;
  }

  registerCollection(key, defaultRoute, collection = Collection, modelClass = ObjectCreator, modelid = '_id') {
    let c = this.container.invoke(collection);
    this.collections[key] = c;
    c.configure(key, modelClass, defaultRoute, modelid);

    this.collections[key]._setHttpClient(this.httpClient);

    return c;
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