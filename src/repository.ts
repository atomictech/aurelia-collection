// import { autoinject } from 'aurelia-framework';
import { Collection } from './collection';

// @autoinject()
export class Repository {
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

  declareCollection<S, C>(
    name: string,
    endpoint: string,
    SchemaClass: typeof S,
    CollectionClass?: typeof C
  ) {
    let collection = CollectionClass
      ? new CollectionClass<SchemaClass>(endpoint)
      : new Collection<SchemaClass>(endpoint);
  }
}
