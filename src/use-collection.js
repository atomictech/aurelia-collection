import { resolver } from 'aurelia-dependency-injection';
import { Config } from './config';

/**
 * UseCollection class. Resolver for collection injection.
 */
@resolver()
export class UseCollection {
  /**
   * Collection resolver constructor.
   * @param  {String} key : should be the unique key that identify a collection instance.
   */
  constructor(key) {
    this._key = key;
  }

  /**
   * Accessor to the collections instance through aurelia container.
   * @param  {Container} container : the aurelia container.
   * @return {Collection} The collection instance associated to the collection key, otherwise undefined.
   */
  get(container) {
    return container.get(Config).getCollection(this._key);
  }

  /**
   * Static acces to a collection instance, this should be used in injections as Collection.of('collection-key')
   * @param  {String} key : the unique key of that identify a collection.
   * @return {Collection} A collection resolver.
   */
  static of(key) {
    return new UseCollection(key);
  }
}
