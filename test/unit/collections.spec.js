import { Config } from '../../src/config';
import { Service } from '../../src/service';
import { Collection } from '../../src/collection';
import { Container } from 'aurelia-dependency-injection';
import { InjectTest } from './resources/inject-test';

let container = new Container();
let config = container.get(Config);
let service = new Service();
config.registerService('fake', service, 'http://jsonplaceholder.typicode.com');

describe('Collection', function() {
  describe('static .of()', function() {
    it('Should return a new instance of self.', function() {
      let collection = Collection.of('foo');

      expect(collection instanceof Collection).toBe(true);
      expect(collection._key).toBe('foo');
    });

    it('Should return a new instance of Service.', function() {
      let injectTest = container.get(InjectTest);

      expect(injectTest.myService instanceof Service).toBe(true);
    });
  });
});
