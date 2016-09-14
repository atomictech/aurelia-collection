import _ from 'lodash';

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
   * [constructor description]
   * @param  {[type]} aurelia    [description]
   * @param  {[type]} httpClient [description]
   * @return {[type]}            [description]
   */
  constructor(aurelia, httpClient) {
    this.httpClient = httpClient;
    this.aurelia = aurelia;
  }

  collections = {};
  defaultCollection = null;

  /**
   * [registerCollection description]
   * @param  {[type]} key               [description]
   * @param  {[type]} defaultRoute      [description]
   * @param  {[type]} collectionService [description]
   * @param  {[type]} modelClass        [description]
   * @param  {String} modelid           [description]
   * @return {[type]}                   [description]
   */
  registerCollection(key, defaultRoute, collectionService, modelClass = ObjectCreator, modelid = '_id') {
    this.collections[key] = collectionService;
    collectionService.configure(this.aurelia.container, this, key, defaultRoute, modelClass, modelid);

    this.collections[key]._setHttpClient(this.httpClient);

    return this;
  }

  /**
   * [getCollection description]
   * @param  {[type]} key [description]
   * @return {[type]}     [description]
   */
  getCollection(key) {
    if (!key) {
      return this.defaultCollection || null;
    }

    return this.collections[key] || null;
  }

  /**
   * [collectionExists description]
   * @param  {[type]} key [description]
   * @return {[type]}     [description]
   */
  collectionExists(key) {
    return !!this.collections[key];
  }

  /**
   * [setDefaultCollection description]

   * @param {[type]} key [description]
   */
  setDefaultCollection(key) {
    this.defaultCollection = this.getCollection(key);

    return this;
  }
}
