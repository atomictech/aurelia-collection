import { _ } from 'lodash';
import fakeFetch from 'fake-fetch';
import { Container } from 'aurelia-dependency-injection';
import { StageComponent } from 'aurelia-testing';
import { bootstrap } from 'aurelia-bootstrapper';

import { Config } from '../../src/config';
import { Collection } from '../../src/service';

describe('Collection', () => {
  let component;
  let container;
  let config;

  beforeAll(done => {
    fakeFetch.install();
    component = StageComponent.withResources();
    component.create(bootstrap)
      .then(() => {
        container = Container.instance;
        config = container.get(Config);
        done();
      });
  });

  afterAll(() => {
    fakeFetch.restore();
    component.dispose();
  });

  describe('.configure()', () => {
    it('Should properly initialize the collection', () => {
      let collection = new Collection();
      collection.configure('myKey');

      expect(collection.container).toBe(container);
      expect(collection.modelid).toBe('_id');
      expect(collection.modelClass).toBeUndefined();
      expect(collection.defaultRoute).toBe('/api/myKey/');
      expect(collection.collection instanceof Array).toBe(true);
      expect(collection.refKeys()).toEqual([]);
      expect(collection.isComplete()).toBeTruthy();
    });
  });

  describe('.fromJSON', () => {
    let collection;

    beforeEach(() => {
      let creator = (data) => data;
      collection = new Collection();
      config.registerCollection('myKey', collection, 'default/route/', creator);
    });

    it('Should return null when data is undefined or null', () => {
      collection.fromJSON().then(res => {
        expect(res).toEqual(null);
      });
    });

    it('Should return a new model when data has an id not found in the collection', () => {
      collection.fromJSON({ _id: 'myId', foo: 21 }).then(res => {
        expect(res).toEqual({ _id: 'myId', foo: 21 });
      });
    });

    it('Should return a new model when data has an id not found in the collection', () => {
      collection.fromJSON({ _id: 'myId', foo: 21 }, { ignoreCollection: true })
        .then(res => {
          expect(res).toEqual({ _id: 'myId', foo: 21 });
          expect(collection.collection).toEqual([]);
        });
    });

    it('Should return a existing model, _syncFrom depending on isComplete, if data id is found in the collection', () => {
      let model = {
        _id: 'myId',
        foo: 42
      };
      collection.collection.push(model);

      collection.fromJSON({ _id: 'myId' }).then(res => {
        expect(res).toEqual(model);
      });
    });
  });

  describe('.toJSON()', () => {
    let model;
    let collection;

    beforeEach(() => {
      let creator = (data) => data;
      model = { _id: 'fakeId', other: 'field' };
      collection = new Collection();
      config.registerCollection('myKey', collection, 'default/route/', creator);
    });

    it('Should return the model when the model doesn\'t have a toJSON method', () => {
      let result = collection.toJSON(model);
      expect(result).toEqual(model);
    });

    it('Should call the toJSON method of a model', () => {
      model.toJSON = () => 'myFakeJSON';

      let result = collection.toJSON(model);
      expect(result).toBe('myFakeJSON');
    });
  });

  describe('.flush()', () => {
    it('Should clear the collection from the created models', done => {
      fakeFetch.respondWith('{ "_id": "myId" }');

      let collection = new Collection();
      config.registerCollection('myKey', collection);

      expect(collection.collection).toEqual([]);

      collection.get('myId')
        .then(res => {
          expect(res._id).toBe('myId');
          collection.flush();
          expect(collection.collection).toEqual([]);
          done();
        });
    });
  });

  describe('.isComplete', () => {
    it('Should return a boolean', () => {
      let collection = new Collection();
      expect(collection.isComplete({})).toBeTruthy();
    });
  });

  describe('.sync', () => {
    let model;
    let collection;
    beforeEach(() => {
      fakeFetch.respondWith('{ "_id": "myId", "foo": "bar" }');
      let creator = (data) => data;
      model = { _id: 'myId' };
      collection = new Collection();
      config.registerCollection('myKey', collection, 'default/route/', creator);
    });

    it('Should return the synced model when given an id', done => {
      collection.collection.push(model);
      collection.sync('myId').then(res => {
        expect(res).toEqual({ _id: 'myId', foo: 'bar' });
        done();
      });
    });

    it('Should return the synced model when given json data of the model', done => {
      collection.collection.push(model);
      collection.sync({ _id: 'myId' }).then(res => {
        expect(res).toEqual({ _id: 'myId', foo: 'bar' });
        done();
      });
    });
  });

  describe('.refKeys', () => {
    it('Should return an empty Array', () => {
      let collection = new Collection();
      expect(collection.refKeys()).toEqual([]);
    });
  });

  describe('._setHttpClient', () => {
    it('Should return the same httpClient object', () => {
      let collection = new Collection();
      collection._setHttpClient({ dummy: true });
      expect(collection._httpClient).toEqual({ dummy: true });
    });
  });

  describe('._syncFrom', () => {
    it('Should merge two literal objects', () => {
      let foo = { f1: 1 };
      let bar = { f2: 2 };
      let collection = new Collection();

      collection._syncFrom(foo, bar);
      expect(foo).toEqual({ f1: 1, f2: 2 });
    });
  });

  describe('._getFromCollection', () => {
    it('Should find a model with default _id property value', () => {
      let creator = (data) => data;
      let model = { _id: 'myId' };
      let collection = new Collection();
      config.registerCollection('myKey', collection, 'default/route/', creator);

      collection.collection.push(model);
      expect(collection._getFromCollection('myId')).toEqual(model);
      expect(collection._getFromCollection('noId')).toBeUndefined();
    });

    it('Should find a model with custom id property value', () => {
      let creator = (data) => data;
      let model = { idField: 'myId' };
      let collection = new Collection();
      config.registerCollection('myKey', collection, 'default/route/', creator, 'idField');

      collection.collection.push(model);
      expect(collection._getFromCollection('myId')).toEqual(model);
      expect(collection._getFromCollection('noId')).toBeUndefined();
    });
  });

  describe('._removeFromCollection', () => {
    let creator;
    let collection;

    beforeEach(() => {
      creator = (data) => data;
      collection = new Collection();
    });

    it('Should remove a model with default _id property value', () => {
      let model = { _id: 'myId' };
      let anotherModel = { idField: 'myOtherId' };
      config.registerCollection('myKey', collection, 'default/route/', creator);

      collection.collection.push(model);
      collection.collection.push(anotherModel);

      collection._removeFromCollection('myId');
      expect(collection.collection).toEqual([anotherModel]);

      // We can try to remove it  again, and it still works.
      collection._removeFromCollection('myId');
      expect(collection.collection).toEqual([anotherModel]);
    });

    it('Should remove a model with default _id property value', () => {
      let model = { idField: 'myId' };
      let anotherModel = { idField: 'myOtherId' };
      config.registerCollection('myKey', collection, 'default/route/', creator, 'idField');

      collection.collection.push(model);
      collection.collection.push(anotherModel);

      collection._removeFromCollection('myId');
      expect(collection.collection).toEqual([anotherModel]);

      // We can try to remove it  again, and it still works.
      collection._removeFromCollection('myId');
      expect(collection.collection).toEqual([anotherModel]);
    });
  });

  describe('._getById', () => {
    let creator;
    let model;
    let collection;

    beforeEach(() => {
      creator = (data) => data;
      model = { _id: 'myId', wheels: 4 };
      collection = new Collection();
      config.registerCollection('myKey', collection, 'default/route/', creator);
    });

    it('Should return an already known model', done => {
      collection.collection.push(model);

      collection._getById('myId')
        .then(foundModel => {
          expect(foundModel).toBe(model);
          done();
        });
    });

    it('Should return a model when it is not already a known model', done => {
      fakeFetch.respondWith(JSON.stringify(model));

      spyOn(collection._httpClient, 'fetch').and.callThrough();

      collection._getById('myId')
        .then(foundModel => {
          expect(foundModel).toEqual(model);
          expect(collection._httpClient.fetch).toHaveBeenCalled();
          done();
        });
    });

    it('Should return the model by calling the fetch method when forcing it', done => {
      collection.collection.push(model);
      fakeFetch.respondWith(JSON.stringify(model));

      spyOn(collection._httpClient, 'fetch').and.callThrough();

      collection._getById('myId', true)
        .then(foundModel => {
          expect(foundModel).toEqual(model);
          expect(collection._httpClient.fetch).toHaveBeenCalled();
          done();
        });
    });

    it('Should return the model by calling the fetch method is the model is not complete', done => {
      collection.isComplete = m => _.has(m, ['_id', 'wheels', 'doors']);

      collection.collection.push(model);
      fakeFetch.respondWith(JSON.stringify(model));

      spyOn(collection._httpClient, 'fetch').and.callThrough();
      collection._getById('myId', true)
        .then(foundModel => {
          expect(foundModel).toEqual(model);
          expect(collection._httpClient.fetch).toHaveBeenCalled();
          done();
        });
    });
  });

  describe('.create', () => {
    let creator;
    let model;
    let collection;

    beforeEach(() => {
      creator = (data) => data;
      model = { _id: 'myId', wheels: 4 };
      collection = new Collection();
      config.registerCollection('myKey', collection, 'default/route/', creator);
    });

    it('Should return the created model', done => {
      model = { _id: 'myId', wheels: 4 };
      fakeFetch.respondWith(JSON.stringify(model));

      spyOn(collection._httpClient, 'fetch').and.callThrough();

      collection.create(model)
        .then(createdModel => {
          expect(createdModel).toEqual(model);
          expect(collection._httpClient.fetch).toHaveBeenCalledWith('default/route', jasmine.objectContaining({ method: 'post' }));
          done();
        });
    });

    it('Should return the created model on a dedicated route', done => {
      model = { _id: 'myId', wheels: 4 };
      fakeFetch.respondWith(JSON.stringify(model));

      spyOn(collection._httpClient, 'fetch').and.callThrough();

      collection.create(model, 'creation')
        .then(createdModel => {
          expect(createdModel).toEqual(model);
          expect(collection._httpClient.fetch).toHaveBeenCalledWith(('default/route/creation'), jasmine.objectContaining({ method: 'post' }));
          done();
        });
    });

    it('Should return the model and leave the submodel id', done => {
      let collection2 = new Collection();
      let driver = { _id: 'fakeId', name: 'Fake Name' };
      model._ref_driver = 'fakeId';
      config.registerCollection('Drivers', collection2, 'api/drivers/', creator);
      collection2.collection.push(driver);
      collection.refKeys = () => [{ backendKey: '_ref_driver', collection: 'Drivers', frontendKey: 'driver' }];

      fakeFetch.respondWith('{ "_id": "myId", "wheels": 4, "_ref_driver": "fakeId"}');

      collection.create(model)
        .then(createdModel => {
          expect(createdModel._id).toEqual('myId');
          expect(createdModel.wheels).toEqual(4);
          expect(createdModel._ref_driver).toEqual(driver._id);
          done();
        });
    });

    it('Should return the model and replace the submodel id by its model when the backend populate its data', done => {
      let collection2 = new Collection();
      let driver = { _id: 'fakeId', name: 'Fake Name' };
      model._ref_driver = 'fakeId';
      config.registerCollection('Drivers', collection2, 'api/drivers/', creator);
      collection2.collection.push(driver);
      collection.refKeys = () => [{ backendKey: '_ref_driver', collection: 'Drivers', frontendKey: 'driver' }];

      fakeFetch.respondWith('{ "_id": "myId", "wheels": 4, "_ref_driver": { "_id": "fakeId", "name": "Fake Name" } }');

      collection.create(model)
        .then(createdModel => {
          expect(createdModel._id).toEqual('myId');
          expect(createdModel.wheels).toEqual(4);
          expect(createdModel.driver).toBe(driver);
          done();
        });
    });
  });

  describe('.destroy()', () => {
    let creator;
    let model;
    let collection;

    beforeEach(() => {
      creator = (data) => data;
      model = { _id: 'myId', wheels: 4 };
      collection = new Collection();
      config.registerCollection('myKey', collection, 'default/route/', creator);
      collection.collection.push(model);
      fakeFetch.respondWith('{ "response": "ok" }');
      spyOn(collection._httpClient, 'fetch').and.callThrough();
    });

    it('Should remove the model from the collection and call the fetch method', done => {
      collection.destroy(model._id)
        .then(answer => {
          expect(collection.collection).toEqual([]);
          expect(collection._httpClient.fetch).toHaveBeenCalledWith('default/route/' + model._id, { method: 'delete' });
          done();
        });
    });

    it('Should remove the model and call the fetch method on a dedicated route', done => {
      collection.destroy(model._id, 'destroy/' + model._id)
        .then(answer => {
          expect(collection.collection).toEqual([]);
          expect(collection._httpClient.fetch).toHaveBeenCalledWith('default/route/destroy/' + model._id, { method: 'delete' });
          done();
        });
    });
  });

  describe('.get()', () => {
    let creator;
    let model;
    let driver;
    let phone;
    let collection;
    let collection2;
    let collection3;

    beforeEach(() => {
      creator = (data) => data;
      model = { _id: 'myId', wheels: 4 };
      collection = new Collection;
      config.registerCollection('myKey', collection, 'default/route/', creator);
      collection.collection.push(model);

      collection2 = new Collection();
      driver = { _id: 'fakeId', name: 'Fake Name' };
      model._ref_driver = 'fakeId';
      config.registerCollection('Drivers', collection2, 'api/drivers/', creator);
      collection2.collection.push(driver);
      collection.refKeys = () => [{ backendKey: '_ref_driver', collection: 'Drivers', frontendKey: 'driver' }];

      collection3 = new Collection();
      phone = { _id: 'phone1', battery: '3h' };
      driver._ref_phones = ['phone1'];
      config.registerCollection('Phones', collection3, 'api/phones/', creator);
      collection3.collection.push(phone);
      collection2.refKeys = () => [{ backendKey: '_ref_phones', collection: 'Phones', frontendKey: 'phones' }];
    });

    it('Should return the parameters when calling with undefined', done => {
      collection.get()
        .then(data => {
          expect(data).toBeUndefined();
          done();
        });
    });

    it('Should return the parameters when calling with null', done => {
      collection.get(null)
        .then(data => {
          expect(data).toBeNull();
          done();
        });
    });

    it('Should return a model according to its id.', done => {
      collection.get('myId')
        .then(foundModel => {
          expect(foundModel).toBe(model);
          done();
        });
    });

    it('Should return a model according to its attributes containg an id.', done => {
      collection.get({ _id: 'myId' })
        .then(foundModel => {
          expect(foundModel).toBe(model);
          done();
        });
    });

    it('Should return the models according to the ids array.', done => {
      let model2 = { _id: 'id2', wheels: 2, _ref_driver: undefined };
      collection.collection.push(model2);

      collection.get(['myId', 'id2'])
        .then(modelArray => {
          expect(modelArray).toContain(model);
          expect(modelArray).toContain(model2);
          done();
        });
    });

    it('Should return a model by calling the fetch api when using force parameter', done => {
      fakeFetch.respondWith(JSON.stringify(model));
      spyOn(collection._httpClient, 'fetch').and.callThrough();

      collection.get('myId', { force: true })
        .then(foundModel => {
          expect(foundModel).toEqual(model);
          expect(collection._httpClient.fetch).toHaveBeenCalledWith(jasmine.stringMatching('default/route/' + model._id));
          done();
        });
    });

    it('Should populate the child when forcing it', done => {
      collection.get('myId', { populate: true })
        .then(foundModel => {
          expect(foundModel._id).toBe('myId');
          expect(foundModel.wheels).toBe(4);
          expect(foundModel.driver).toEqual({ _id: 'fakeId', name: 'Fake Name', _ref_phones: ['phone1'] });
          done();
        });
    });

    it('Should leave the reference key unmodified when the collection has not been registered', done => {
      collection.refKeys = () => [{ backendKey: '_ref_driver', collection: 'UnknownCollection', frontendKey: 'driver' }];

      collection.get('myId', { populate: true })
        .then(foundModel => {
          expect(foundModel._id).toBe('myId');
          expect(foundModel.wheels).toBe(4);
          expect(foundModel._ref_driver).toBe('fakeId');
          expect(foundModel.driver).toBeUndefined();
          done();
        });
    });

    it('Should populate the child and its grand child when using recursive and populate options', done => {
      collection.get('myId', { populate: true, recursive: true })
        .then(foundModel => {
          expect(foundModel._id).toBe('myId');
          expect(foundModel.wheels).toBe(4);
          expect(foundModel.driver._id).toBe('fakeId');
          expect(foundModel.driver.name).toBe('Fake Name');
          expect(foundModel.driver.phones).toContain(phone);
          done();
        });
    });

    it('Should leave the reference key unmodified when no backendKey has been defined', done => {
      collection.refKeys = () => [{ collection: 'Drivers', frontendKey: 'driver' }];

      collection.get('myId', { populate: true })
        .then(foundModel => {
          expect(foundModel._id).toBe('myId');
          expect(foundModel.wheels).toBe(4);
          expect(foundModel._ref_driver).toEqual('fakeId');
          done();
        });
    });

    it('Should not modyfing the key used for references when no frontendKey has been defined', done => {
      collection.refKeys = () => [{ backendKey: '_ref_driver', collection: 'Drivers' }];

      collection.get('myId', { populate: true })
        .then(foundModel => {
          expect(foundModel._id).toBe('myId');
          expect(foundModel.wheels).toBe(4);
          expect(foundModel._ref_driver).toEqual({ _id: 'fakeId', name: 'Fake Name', _ref_phones: ['phone1'] });
          done();
        });
    });

    it('Should keep the JSON data when no collection has been set', done => {
      collection.refKeys = () => [{ backendKey: '_ref_driver', frontendKey: 'driver' }];

      collection.get('myId', { populate: true })
        .then(foundModel => {
          expect(foundModel._id).toBe('myId');
          expect(foundModel.wheels).toBe(4);
          expect(foundModel.driver).toEqual('fakeId');
          done();
        });
    });

    it('Should populate the child when forcing it', done => {
      collection.refKeys = () => [{ backendKey: '_ref_driver', collection: 'Drivers', frontendKey: 'driver', backendKeyDeletion: false }];

      collection.get('myId', { populate: true })
        .then(foundModel => {
          expect(foundModel._id).toBe('myId');
          expect(foundModel.wheels).toBe(4);
          expect(foundModel._ref_driver).toBe('fakeId');
          expect(foundModel.driver).toEqual({ _id: 'fakeId', name: 'Fake Name', _ref_phones: ['phone1'] });
          done();
        });
    });

    it('Should create all the models accoordingly', done => {
      fakeFetch.respondWith('{ "_id": "myId", "wheels": 4, "_ref_driver" : { "_id" : "fakeId", "name" : "Updated Fake Name", "_ref_phones" : [{ "_id" : "phone1", "battery": "4h"}] } }');
      collection.collection = [];
      collection2.collection = [];
      collection3.collection = [];

      collection.get('myId')
        .then(foundModel => {
          expect(foundModel._id).toBe('myId');
          expect(foundModel.wheels).toBe(4);
          expect(foundModel.driver._id).toBe('fakeId');
          expect(foundModel.driver.name).toBe('Updated Fake Name');
          expect(foundModel.driver.phones).toContain({ _id: 'phone1', battery: '4h' });
          expect(collection.collection).toContain(foundModel);
          expect(collection2.collection).toContain(foundModel.driver);
          expect(collection3.collection).toContain(foundModel.driver.phones[0]);
          done();
        });
    });
  });

  describe('.update()', () => {
    let creator;
    let model;
    let collection;

    beforeEach(() => {
      creator = (data) => data;
      model = { _id: 'myId', wheels: 4 };
      collection = new Collection();
      config.registerCollection('myKey', collection, '/default/route/', creator);
      collection.collection.push(model);
    });

    it('Should modify the model according to the attribute values', done => {
      fakeFetch.respondWith('{ "_id": "myId", "wheels": 5 }');
      spyOn(collection._httpClient, 'fetch').and.callThrough();

      collection.update(model, { wheels: 5 })
        .then(updatedModel => {
          expect(updatedModel).toBe(model);
          expect(updatedModel.wheels).toBe(5);
          expect(collection._httpClient.fetch).toHaveBeenCalledWith('/default/route/myId', jasmine.objectContaining({ method: 'put' }));
          done();
        });
    });
  });

  describe('._frontToBackend()', () => {
    let creator;
    let driver;
    let collection;

    beforeEach(() => {
      creator = (data) => data;
      collection = new Collection;
      config.registerCollection('myKey', collection, 'default/route/', creator);
      driver = { _id: 'fakeId', name: 'Fake Name' };
      collection.refKeys = () => [{ backendKey: '_ref_driver', collection: 'Drivers', frontendKey: 'driver' }];
    });

    it('Should not convert anything when no refkeys have been overloaded', done => {
      collection.refKeys = () => [];

      collection._frontToBackend({ wheels: 5, driver: driver })
        .then(attributes => {
          expect(attributes).toEqual({ wheels: 5, driver: driver });
          done();
        });
    });

    it('Should replace a refkey\'d attribute by its id', done => {
      collection._frontToBackend({ wheels: 5, driver: driver })
        .then(attributes => {
          expect(attributes.wheels).toBe(5);
          expect(attributes.driver).toBeUndefined();
          expect(attributes._ref_driver).toBe(driver._id);
          done();
        });
    });

    it('Should not delete the frontendKey if backendKeyDeletion is true', done => {
      collection.refKeys = () => [{ backendKey: '_ref_driver', collection: 'Drivers', frontendKey: 'driver', backendKeyDeletion: false }];

      collection._frontToBackend({ wheels: 5, driver: driver })
        .then(attributes => {
          expect(attributes.wheels).toBe(5);
          expect(attributes.driver).toBe(driver);
          expect(attributes._ref_driver).toBe(driver._id);
          done();
        });
    });

    it('Should support the use of an array of references', done => {
      let driver2 = { _id: 'fakeDriver2', name: 'Frank' };

      collection._frontToBackend({ wheels: 5, driver: [driver, driver2] })
        .then(attributes => {
          expect(attributes.wheels).toBe(5);
          expect(attributes.driver).toBeUndefined();
          expect(attributes._ref_driver).toContain(driver._id);
          expect(attributes._ref_driver).toContain(driver2._id);
          done();
        });
    });

    it('Should support the use of an id for reference', done => {
      collection._frontToBackend({ wheels: 5, driver: driver._id })
        .then(attributes => {
          expect(attributes.wheels).toBe(5);
          expect(attributes.driver).toBeUndefined();
          expect(attributes._ref_driver).toBe(driver._id);
          done();
        });
    });

    it('Should convert the backend key to null if the frontend key is not of supported type', done => {
      collection._frontToBackend({ wheels: 5, driver: 42 })
        .then(attributes => {
          expect(attributes.wheels).toBe(5);
          expect(attributes.driver).toBeUndefined();
          expect(attributes._ref_driver).toBeNull();
          done();
        });
    });

    it('Should convert the backend key to null if the value is an object without its id value', done => {
      collection._frontToBackend({ wheels: 5, driver: { name: 'Unknown name' } })
        .then(attributes => {
          expect(attributes.wheels).toBe(5);
          expect(attributes.driver).toBeUndefined();
          expect(attributes._ref_driver).toBeNull();
          done();
        });
    });
  });

  describe('._backToFrontend()', () => {
    let creator;
    let model;
    let driver;
    let collection;
    let collection2;
    let backEndAttrs;

    beforeEach(() => {
      creator = (data) => data;
      model = { _id: 'myId', wheels: 4 };
      collection = new Collection;
      config.registerCollection('myKey', collection, 'default/route/', creator);
      collection.collection.push(model);

      collection2 = new Collection();
      driver = { _id: 'fakeId', name: 'Fake Name' };
      model.driver = 'fakeId';
      config.registerCollection('Drivers', collection2, 'api/drivers/', creator);
      collection2.collection.push(driver);
      collection.refKeys = () => [{ backendKey: '_ref_driver', collection: 'Drivers', frontendKey: 'driver' }];

      backEndAttrs = { wheels: 5, _ref_driver: driver, doors: 4, purchasedOn: new Date() };
    });

    it('Should not convert any key when no refkeys have been overloaded', done => {
      collection.refKeys = () => [];

      collection._backToFrontend(backEndAttrs, { wheels: 5, _ref_driver: driver }, model)
        .then(attributes => {
          expect(model.wheels).toBe(5);
          expect(model._ref_driver).toBe(driver);
          expect(model.purchasedOn).toBeUndefined();
          expect(model.doors).toBeUndefined();
          expect(model.driver).toBe(driver._id);
          done();
        });
    });

    it('Should not convert any key when no collection have been specified', done => {
      collection.refKeys = () => [{ backendKey: '_ref_driver', frontendKey: 'driver' }];

      collection._backToFrontend(backEndAttrs, { wheels: 5, _ref_driver: driver }, model)
        .then(attributes => {
          expect(model.wheels).toBe(5);
          expect(model._ref_driver).toBeUndefined();
          expect(model.purchasedOn).toBeUndefined();
          expect(model.doors).toBeUndefined();
          expect(model.driver).toBe(driver);
          done();
        });
    });

    it('Should replace a refkey\'d attribute by its value', done => {
      collection._backToFrontend(backEndAttrs, { wheels: 5, _ref_driver: driver }, model)
        .then(attributes => {
          expect(model.wheels).toBe(5);
          expect(model.driver).toBe(driver);
          expect(model.purchasedOn).toBeUndefined();
          expect(model.doors).toBeUndefined();
          expect(model._ref_driver).toBeUndefined();
          done();
        });
    });
  });
});
