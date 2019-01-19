import { IConstructor } from './helpers';
import { ISchema } from './entities/schema';
import { ICollection, Collection } from './collection';

export class Repository {
  collections: ICollection<ISchema>[];

  constructor() {}

  generateState(): any {
    // 1- dynamically load all the entity types
    // 2- aggregate them in a single TYPES object for store.state.collections.TYPES
    let promises = [];
    let pluginRoot = '';

    // for each collection EntityClass
    // extract initial entity structure for the store
  }

  observeState(): void {}

  createCollection<S extends ISchema, C extends ICollection<S> = Collection<S>>(
    key: string,
    baseUrl: string,
    SchemaClass: IConstructor<S>,
    CollectionClass?: IConstructor<C>,
    modelid: string = '_id'
  ): void {
    let col = CollectionClass ? new CollectionClass() : new Collection<S>();
    col.configure(key, SchemaClass, baseUrl, modelid);
  }
}
