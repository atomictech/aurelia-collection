import { Container } from 'aurelia-framework';

import { Schema, Collection, FetchTransporter, ITransporter, Model } from '../../src/aurelia-collection';
import { TestSchema, createEmptyRepository, TestCollection } from './helpers';
import { resolve } from 'url';

describe('collection', () => {
  it('should configure a collection with only key and SchemaClass', () => {
    const container = new Container().makeGlobal();

    let c = new Collection<Schema>();
    c.configure('foo', Schema);

    expect(c).toBeInstanceOf(Collection);
    expect((c as any).schema).toBeInstanceOf(Schema);
    expect((c as any).baseUrl).toEqual('/api/foo/');
    expect((c as any).modelid).toEqual('_id');
  });

  it('should configure a collection with only key and SchemaClass and baseUrl', () => {
    const container = new Container().makeGlobal();

    let c = new Collection<Schema>();
    c.configure('foo', Schema, '/api/bar/')

    expect(c).toBeInstanceOf(Collection);
    expect((c as any).schema).toBeInstanceOf(Schema);
    expect((c as any).baseUrl).toEqual('/api/bar/');
    expect((c as any).modelid).toEqual('_id');
  });

  it('should configure a collection with only key and SchemaClass and baseUrl and modelid', () => {
    const container = new Container().makeGlobal();

    let c = new TestCollection();
    c.configure('foo', TestSchema, '/api/bar/', 'name')

    expect(c).toBeInstanceOf(TestCollection);
    expect((c as any).schema).toBeInstanceOf(TestSchema);
    expect((c as any).baseUrl).toEqual('/api/bar/');
    expect((c as any).modelid).toEqual('name');
  });

  it('should set a transporter or set a default FetchTransporter', () => {
    const container = new Container().makeGlobal();

    class FakeTransporter implements ITransporter {
      fetch(endpoint: string, options: any): Promise<any> {
        return Promise.resolve();
      }
    }

    let c = new Collection<Schema>();
    c.configure('foo', Schema);
    expect((c as any).transporter).toBeInstanceOf(FetchTransporter);

    let c2 = new Collection<Schema>();
    c.configure('foo', Schema);
    c.setTransporter(new FakeTransporter());
    expect((c as any).transporter).toBeInstanceOf(FakeTransporter);
  });

  it('should clear all the Model instances', () => {
    const container = new Container().makeGlobal();

    let c = new Collection<Schema>();
    c.configure('foo', Schema);

    (c as any).models.push(new Model());
    expect((c as any).models.length).toEqual(1);
    c.flush();
    expect((c as any).models).toEqual([]);
  });

  it('should create a Promise that resolve a Model based on the correct Schema when given a json Object literal', () => {
    const container = new Container().makeGlobal();
  });

});
