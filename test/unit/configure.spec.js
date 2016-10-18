import { Collection } from '../../src/collection';
import { Config } from '../../src/config';

class HttpStub {
  fetch(url) {
    let response = this.itemStub;
    this.url = url;
    return new Promise((resolve) => {
      resolve({ json: () => response });
    });
  }

  configure(func) {}
}

describe('Config', () => {
  describe('.registerCollection()', () => {
    it('Should properly register a collection.', () => {
      let config = new Config(new HttpStub());
      let collection = new Collection();
      let result = config.registerCollection('myCollection', collection, '/api/mycollection');

      expect(config.collections.myCollection).toEqual(collection);
      expect(result).toBe(config);
    });
  });

  describe('.getCollection()', () => {
    it('Should return the registred collection, or null.', () => {
      let config = new Config(new HttpStub());
      let collection = new Collection();
      config.registerCollection('myCollection', collection, '/api/mycollection');

      let myCollection = config.getCollection('myCollection');
      let nullCollection = config.getCollection('none');
      let defaultCollection = config.getCollection();

      expect(myCollection instanceof Collection).toBe(true);
      expect(myCollection._httpClient instanceof HttpStub).toBe(true);
      expect(nullCollection).toBe(null);
      expect(defaultCollection).toBe(null);

      config.setDefaultCollection('myCollection');
      defaultCollection = config.getCollection();

      expect(defaultCollection instanceof Collection).toBe(true);
      expect(defaultCollection._httpClient instanceof HttpStub).toBe(true);
    });
  });

  describe('.collectionExists()', () => {
    it('Should true when a collection is registered', () => {
      let config = new Config(new HttpStub());
      let collection = new Collection();

      config.registerCollection('collection', collection, '/api/collection');

      let exists = config.collectionExists('collection');
      let unknownExist = config.collectionExists('unknownCollection');

      expect(exists).toBe(true);
      expect(unknownExist).toBe(false);
    });
  });
});
