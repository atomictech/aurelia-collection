import { Config } from '../../src/config';
import { Collection } from '../../src/service';
import { UseCollection } from '../../src/collection';
import { Container } from 'aurelia-dependency-injection';
import { InjectTest } from './resources/inject-test';

let container = new Container();
let config = container.get(Config);
let collectionInstance = new Collection();
config.registerCollection('fake', collectionInstance, 'http://jsonplaceholder.typicode.com');

describe('Collection', () => {
  describe('static .of()', () => {
    it('Should return a new instance of self.', () => {
      let collection = UseCollection.of('foo');

      expect(collection instanceof UseCollection).toBe(true);
      expect(collection._key).toBe('foo');
    });

    it('Should return a new instance of Collection.', () => {
      let injectTest = container.get(InjectTest);

      expect(injectTest.myCollection instanceof Collection).toBe(true);
    });
  });
});
