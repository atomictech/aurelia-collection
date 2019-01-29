import { Container } from 'aurelia-framework';

import { Schema, Collection } from '../../src/aurelia-collection';
import { TestSchema, createEmptyRepository, TestCollection } from './helpers';

describe('repository', () => {
  it('should have a repository and create a collection with only key and SchemaClass', () => {
    const container = new Container().makeGlobal();
    const repo = createEmptyRepository();

    repo.createCollection<Schema>('foo', Schema);

    let c = repo.collections['foo'];
    expect(c).toBeDefined();
    expect(c).toBeInstanceOf(Collection);
    expect((c as any).schema).toBeInstanceOf(Schema);
    expect((c as any).baseUrl).toEqual('/api/foo/');
    expect((c as any).modelid).toEqual('_id');
  });

  it('should have a repository and create a collection with key, SchemaClass and baseUrl', () => {
    const container = new Container().makeGlobal();
    const repo = createEmptyRepository();

    repo.createCollection<Schema>('foo', Schema, '/api/bar/');

    let c = repo.collections['foo'];
    expect(c).toBeDefined();
    expect(c).toBeInstanceOf(Collection);
    expect((c as any).schema).toBeInstanceOf(Schema);
    expect((c as any).baseUrl).toEqual('/api/bar/');
    expect((c as any).modelid).toEqual('_id');
  });

  it('should have a repository and create a collection with key, SchemaClass, baseUrl and CollectionClass', () => {
    const container = new Container().makeGlobal();
    const repo = createEmptyRepository();

    repo.createCollection<TestSchema>('foo', TestSchema, '/api/bar/', TestCollection);

    let c = repo.collections['foo'];
    expect(c).toBeDefined();
    expect(c).toBeInstanceOf(TestCollection);
    expect((c as any).schema).toBeInstanceOf(TestSchema);
    expect((c as any).baseUrl).toEqual('/api/bar/');
    expect((c as any).modelid).toEqual('_id');
  });

  it('should have a repository and create a collection with key, SchemaClass, baseUrl CollectionClass and modelid', () => {
    const container = new Container().makeGlobal();
    const repo = createEmptyRepository();

    repo.createCollection<TestSchema>('foo', TestSchema, '/api/bar/', TestCollection, 'name');

    let c = repo.collections['foo'];
    expect(c).toBeDefined();
    expect(c).toBeInstanceOf(TestCollection);
    expect((c as any).schema).toBeInstanceOf(TestSchema);
    expect((c as any).baseUrl).toEqual('/api/bar/');
    expect((c as any).modelid).toEqual('name');
  });


});
