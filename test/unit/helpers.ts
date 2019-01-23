import { SchemaBase, Collection } from '../../src/aurelia-collection';

export class TestSchema extends SchemaBase {
  declare(): any {
    return undefined;
  }

  identifier(): string {
    return 'test';
  }
}

export class TestCollection extends Collection<TestSchema> {
  doSomething(): void {}
}

export type Spied<T> = { [Method in keyof T]: T[Method] & jasmine.Spy };
