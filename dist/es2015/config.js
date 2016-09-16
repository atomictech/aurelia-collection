var _dec, _class;

import { _ } from 'lodash';

import { Aurelia, inject } from 'aurelia-framework';
import { HttpClient } from 'aurelia-fetch-client';

function ObjectCreator(data) {
  return _.cloneDeep(data);
}

export let Config = (_dec = inject(Aurelia, HttpClient), _dec(_class = class Config {
  constructor(aurelia, httpClient) {
    this.services = {};
    this.defaultService = null;

    this.httpClient = httpClient;
    this.aurelia = aurelia;
  }

  registerService(key, defaultRoute, collectionService, modelClass = ObjectCreator, modelid = '_id') {
    this.services[key] = service;
    collectionService.configure(this.aurelia.container, this, key, defaultRoute, modelClass, modelid);

    this.services[key]._setHttpClient(this.httpClient);

    return this;
  }

  getService(key) {
    if (!key) {
      return this.defaultService || null;
    }

    return this.services[key] || null;
  }

  serviceExists(key) {
    return !!this.services[key];
  }

  setDefaultService(key) {
    this.defaultService = this.getService(key);

    return this;
  }
}) || _class);