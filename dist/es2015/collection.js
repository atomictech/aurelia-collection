var _dec, _class;

import { resolver } from 'aurelia-dependency-injection';
import { Config } from './config';

export let UseCollection = (_dec = resolver(), _dec(_class = class UseCollection {
  constructor(key) {
    this._key = key;
  }

  get(container) {
    return container.get(Config).getCollection(this._key);
  }

  static of(key) {
    return new UseCollection(key);
  }

}) || _class);