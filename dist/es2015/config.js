var _dec, _class;

import { _ } from 'lodash';

import { inject } from 'aurelia-framework';
import { HttpClient } from 'aurelia-fetch-client';

function ObjectCreator(data) {
  return _.cloneDeep(data);
}

export let Config = (_dec = inject(HttpClient), _dec(_class = class Config {
  constructor(httpClient) {
    this.services = {};
    this.defaultService = null;

    this.httpClient = httpClient;
  }

  registerService(key, service, defaultRoute, modelClass = ObjectCreator, modelid = '_id') {
    this.services[key] = service;
    service.configure(key, defaultRoute, modelClass, modelid);

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