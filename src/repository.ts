import { IConstructor } from './helpers';
import { SchemaBase } from './entities/schema';
import { ICollection, Collection } from './collection';

export class Repository {
  collections: { [k: string]: ICollection } = {};

  constructor() { }

  //----------------------------------------------------------------------------
  //#region public-api
  /**
   *
   *
   * @returns {*}
   * @memberof Repository
   */
  // generateState(): any {
  //   // 1- dynamically load all the entity types
  //   // 2- aggregate them in a single TYPES object for store.state.collections.TYPES
  //   let promises = [];
  //   let pluginRoot = '';

  //   // for each collection EntityClass
  //   // extract initial entity structure for the store
  // }

  /**
   *
   *
   * @memberof Repository
   */
  // observeState(): void { }

  /**
   *
   *
   * @template S
   * @template C
   * @param {string} key
   * @param {string} baseUrl
   * @param {IConstructor<S>} SchemaClass
   * @param {IConstructor<C>} [CollectionClass]
   * @param {string} [modelid='_id']
   * @memberof Repository
   */
  createCollection<S extends SchemaBase, C extends Collection<S> = Collection<S>>(
    key: string,
    SchemaClass: IConstructor<S>,
    baseUrl?: string,
    CollectionClass?: IConstructor<C>,
    modelid: string = '_id'
  ): void {
    let col = CollectionClass ? new CollectionClass() : new Collection<S>();
    col.configure(key, SchemaClass, baseUrl, modelid);
    this.collections[key] = col;
  }
  //----------------------------------------------------------------------------
}
