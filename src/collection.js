import { Container, resolver } from 'aurelia-dependency-injection';
import { Config } from './config';

@resolver()
export class Collection {

  constructor(key) {
    this._key = key;
  }

  get(container) {
    return container.get(Config).getCollection(this._key);
  }

  static of(key) {
    return new Collection(key)
  }

}
