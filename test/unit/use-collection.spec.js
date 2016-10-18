import { Config } from '../../src/config';
import { Collection } from '../../src/collection';
import { UseCollection } from '../../src/use-collection';
import { Container } from 'aurelia-dependency-injection';
import { InjectTest } from './resources/inject-test';

let container = new Container();
let config = container.get(Config);
let collectionInstance = new Collection();
config.registerCollection('fake', collectionInstance, 'http://jsonplaceholder.typicode.com');

describe('Collection', () => {
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
