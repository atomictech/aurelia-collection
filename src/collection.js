import { resolver } from 'aurelia-dependency-injection';
import { Config } from './config';

/**
 * Collection class. Resolver for services injection.
 */
@resolver()
export class Collection {
  /**
   * Collection resolver constructor.
   * @param  {String} key : should be the unique key that identify a service instance.
   */
  constructor(key) {
    this._key = key;
  }

  /**
   * Accessor to the services instance through aurelia container.
   * @param  {Container} container : the aurelia container.
   * @return {Service} The service instance associated to the collection key, otherwise undefined.
   */
  get(container) {
    return container.get(Config).getCollection(this._key);
  }

  /**
   * Static acces to a service instance, this should be used in injections as Collection.of('collection-key')
   * @param  {String} key : the unique key of that identify a service.
   * @return {Collection} A collection resolver.
   */
  static of(key) {
    return new Collection(key);
  }

}
