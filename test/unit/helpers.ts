import { SchemaBase, Collection, Repository, Schema } from '../../src/aurelia-collection';

export class TestSchema extends SchemaBase {
  declare(): any {
    return undefined;
  }

  identifier(): string {
    return 'Test';
  }
}

export class TestCollection extends Collection<TestSchema> {
  doSomething(): void {}
}

export function createEmptyRepository() {
  return  new Repository();
}

export function createSimpleRepository() {
  const repo: Repository = new Repository();

  repo.createCollection<TestSchema>('SimpleTest', TestSchema);
}

export function createComplexRepository() {
  const repo: Repository = new Repository();

  repo.createCollection<TestSchema>('TestOne', TestSchema, '/api/testone/', TestCollection);
  repo.createCollection<TestSchema>('TestTwo', TestSchema, '/api/testtwo/', TestCollection);

  repo.createCollection<Schema>('Dummy', Schema);

}


export type Spied<T> = { [Method in keyof T]: T[Method] & jasmine.Spy };
