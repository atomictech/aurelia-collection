import { Container } from 'aurelia-dependency-injection';
import { StageComponent } from 'aurelia-testing';
import { bootstrap } from 'aurelia-bootstrapper';

import { Config } from '../../src/config';
import { Collection } from '../../src/collection';
import { UseCollection } from '../../src/use-collection';
import { InjectTest } from './resources/inject-test';

describe('UseCollection', () => {
  let component;
  let container;
  let config;

  beforeAll(done => {
    component = StageComponent.withResources();
    component.create(bootstrap)
      .then(() => {
        container = Container.instance;
        config = container.get(Config);
        config.registerCollection('fake', 'http://jsonplaceholder.typicode.com');
        done();
      });
  });

  afterAll(() => {
    component.dispose();
  });

  describe('static .of()', () => {
    it('Should return a new instance of self.', () => {
      let resolver = UseCollection.of('foo');

      expect(resolver instanceof UseCollection).toBe(true);
      expect(resolver._key).toBe('foo');
    });

    it('Should return a new instance of Collection.', () => {
      let injectTest = container.get(InjectTest);

      expect(injectTest.myCollection instanceof Collection).toBe(true);
    });
  });
});
