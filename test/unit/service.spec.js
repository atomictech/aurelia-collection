import { _ } from 'lodash';
import fakeFetch from 'fake-fetch';
import { Container } from 'aurelia-dependency-injection';
import { StageComponent } from 'aurelia-testing';
import { bootstrap } from 'aurelia-bootstrapper';

import { Config } from '../../src/config';
import { Service } from '../../src/service';

describe('Service', () => {
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
    it('Should properly initialize the service', () => {
      let service = new Service();
      service.configure('myKey');

      expect(service.container).toBe(container);
      expect(service.modelid).toBe('_id');
      expect(service.modelClass).toBeUndefined();
      expect(service.defaultRoute).toBe('/api/myKey/');
      expect(service.collection instanceof Array).toBe(true);
      expect(service.refKeys()).toEqual([]);
      expect(service.isComplete()).toBeTruthy();
    });
  });

  describe('.fromJSON', () => {
    let service;

    beforeEach(() => {
      let creator = (data) => data;
      service = new Service();
      config.registerService('myKey', service, 'default/route', creator);
    });

    it('Should return null when data is undefined or null', () => {
      service.fromJSON().then(res => {
        expect(res).toEqual(null);
      });
    });

    it('Should return a new model when data has an id not found in the collection', () => {
      service.fromJSON({ _id: 'myId', foo: 21 }).then(res => {
        expect(res).toEqual({ _id: 'myId', foo: 21 });
      });
    });

    it('Should return a existing model, _syncFrom depending on isComplete, if data id is found in the collection', () => {
      let model = {
        _id: 'myId',
        foo: 42
      };
      service.collection.push(model);

      service.fromJSON({ _id: 'myId' }).then(res => {
        expect(res).toEqual(model);
      });
    });
  });

  describe('.toJSON()', () => {
    let model;
    let service;

    beforeEach(() => {
      let creator = (data) => data;
      model = { _id: 'fakeId', other: 'field' };
      service = new Service();
      config.registerService('myKey', service, 'default/route', creator);
    });

    it('Should return the model when the model doesn\'t have a toJSON method', () => {
      let result = service.toJSON(model);
      expect(result).toEqual(model);
    });

    it('Should call the toJSON method of a model', () => {
      model.toJSON = () => 'myFakeJSON';

      let result = service.toJSON(model);
      expect(result).toBe('myFakeJSON');
    });
  });

  describe('.flush()', () => {
    it('Should clear the collection from the created models', done => {
      fakeFetch.respondWith('{ "_id": "myId" }');

      let service = new Service();
      config.registerService('myKey', service);

      expect(service.collection).toEqual([]);

      service.get('myId')
        .then(res => {
          expect(res._id).toBe('myId');
          service.flush();
          expect(service.collection).toEqual([]);
          done();
        });
    });
  });

  describe('.isComplete', () => {
    it('Should return a boolean', () => {
      let service = new Service();
      expect(service.isComplete({})).toBeTruthy();
    });
  });

  describe('.sync', () => {
    let model;
    let service;
    beforeEach(() => {
      fakeFetch.respondWith('{ "_id": "myId", "foo": "bar" }');
      let creator = (data) => data;
      model = { _id: 'myId' };
      service = new Service();
      config.registerService('myKey', service, 'default/route', creator);
    });

    it('Should return the synced model when given an id', done => {
      service.collection.push(model);
      service.sync('myId').then(res => {
        expect(res).toEqual({ _id: 'myId', foo: 'bar' });
        done();
      });
    });

    it('Should return the synced model when given json data of the model', done => {
      service.collection.push(model);
      service.sync({ _id: 'myId' }).then(res => {
        expect(res).toEqual({ _id: 'myId', foo: 'bar' });
        done();
      });
    });
  });

  describe('.refKeys', () => {
    it('Should return an empty Array', () => {
      let service = new Service();
      expect(service.refKeys()).toEqual([]);
    });
  });

  describe('._setHttpClient', () => {
    it('Should return the same httpClient object', () => {
      let service = new Service();
      service._setHttpClient({ dummy: true });
      expect(service._httpClient).toEqual({ dummy: true });
    });
  });

  describe('._syncFrom', () => {
    it('Should merge two literal objects', () => {
      let foo = { f1: 1 };
      let bar = { f2: 2 };
      let service = new Service();

      service._syncFrom(foo, bar);
      expect(foo).toEqual({ f1: 1, f2: 2 });
    });
  });

  describe('._getFromCollection', () => {
    it('Should find a model with default _id property value', () => {
      let creator = (data) => data;
      let model = { _id: 'myId' };
      let service = new Service();
      config.registerService('myKey', service, 'default/route', creator);

      service.collection.push(model);
      expect(service._getFromCollection('myId')).toEqual(model);
      expect(service._getFromCollection('noId')).toBeUndefined();
    });

    it('Should find a model with custom id property value', () => {
      let creator = (data) => data;
      let model = { idField: 'myId' };
      let service = new Service();
      config.registerService('myKey', service, 'default/route', creator, 'idField');

      service.collection.push(model);
      expect(service._getFromCollection('myId')).toEqual(model);
      expect(service._getFromCollection('noId')).toBeUndefined();
    });
  });

  describe('._removeFromCollection', () => {
    let creator;
    let service;

    beforeEach(() => {
      creator = (data) => data;
      service = new Service();
    });

    it('Should remove a model with default _id property value', () => {
      let model = { _id: 'myId' };
      let anotherModel = { idField: 'myOtherId' };
      config.registerService('myKey', service, 'default/route', creator);

      service.collection.push(model);
      service.collection.push(anotherModel);

      service._removeFromCollection('myId');
      expect(service.collection).toEqual([anotherModel]);

      // We can try to remove it  again, and it still works.
      service._removeFromCollection('myId');
      expect(service.collection).toEqual([anotherModel]);
    });

    it('Should remove a model with default _id property value', () => {
      let model = { idField: 'myId' };
      let anotherModel = { idField: 'myOtherId' };
      config.registerService('myKey', service, 'default/route', creator, 'idField');

      service.collection.push(model);
      service.collection.push(anotherModel);

      service._removeFromCollection('myId');
      expect(service.collection).toEqual([anotherModel]);

      // We can try to remove it  again, and it still works.
      service._removeFromCollection('myId');
      expect(service.collection).toEqual([anotherModel]);
    });
  });

  describe('._getById', () => {
    let creator;
    let model;
    let service;

    beforeEach(() => {
      creator = (data) => data;
      model = { _id: 'myId', wheels: 4 };
      service = new Service();
      config.registerService('myKey', service, 'default/route', creator);
    });

    it('Should return an already known model', done => {
      service.collection.push(model);

      service._getById('myId')
        .then(foundModel => {
          expect(foundModel).toBe(model);
          done();
        });
    });

    it('Should return a model when it is not already a known model', done => {
      fakeFetch.respondWith(JSON.stringify(model));

      spyOn(service._httpClient, 'fetch').and.callThrough();

      service._getById('myId')
        .then(foundModel => {
          expect(foundModel).toEqual(model);
          expect(service._httpClient.fetch).toHaveBeenCalled();
          done();
        });
    });

    it('Should return the model by calling the fetch method when forcing it', done => {
      service.collection.push(model);
      fakeFetch.respondWith(JSON.stringify(model));

      spyOn(service._httpClient, 'fetch').and.callThrough();

      service._getById('myId', true)
        .then(foundModel => {
          expect(foundModel).toEqual(model);
          expect(service._httpClient.fetch).toHaveBeenCalled();
          done();
        });
    });

    it('Should return the model by calling the fetch method is the model is not complete', done => {
      service.isComplete = m => _.has(m, ['_id', 'wheels', 'doors']);

      service.collection.push(model);
      fakeFetch.respondWith(JSON.stringify(model));

      spyOn(service._httpClient, 'fetch').and.callThrough();
      service._getById('myId', true)
        .then(foundModel => {
          expect(foundModel).toEqual(model);
          expect(service._httpClient.fetch).toHaveBeenCalled();
          done();
        });
    });
  });

  describe('.create', () => {
    let creator;
    let model;
    let service;

    beforeEach(() => {
      creator = (data) => data;
      model = { _id: 'myId', wheels: 4 };
      service = new Service();
      config.registerService('myKey', service, 'default/route', creator);
    });

    it('Should return the created model', done => {
      model = { _id: 'myId', wheels: 4 };
      fakeFetch.respondWith(JSON.stringify(model));

      spyOn(service._httpClient, 'fetch').and.callThrough();

      service.create(model)
        .then(createdModel => {
          expect(createdModel).toEqual(model);
          expect(service._httpClient.fetch).toHaveBeenCalled();
          done();
        });
    });

    it('Should return the created model on a dedicated route', done => {
      model = { _id: 'myId', wheels: 4 };
      fakeFetch.respondWith(JSON.stringify(model));

      spyOn(service._httpClient, 'fetch').and.callThrough();

      service.create(model, 'creation')
        .then(createdModel => {
          expect(createdModel).toEqual(model);
          expect(service._httpClient.fetch).toHaveBeenCalled();
          done();
        });
    });

    it('Should return the model and leave the submodel id', done => {
      let service2 = new Service();
      let driver = { _id: 'fakeId', name: 'Fake Name' };
      model._ref_driver = 'fakeId';
      config.registerService('Drivers', service2, 'api/drivers', creator);
      service2.collection.push(driver);
      service.refKeys = () => [{ backendKey: '_ref_driver', collection: 'Drivers', frontendKey: 'driver' }];

      fakeFetch.respondWith('{ "_id": "myId", "wheels": 4, "_ref_driver": "fakeId"}');

      service.create(model)
        .then(createdModel => {
          expect(createdModel._id).toEqual('myId');
          expect(createdModel.wheels).toEqual(4);
          expect(createdModel._ref_driver).toEqual(driver._id);
          done();
        });
    });

    it('Should return the model and replace the submodel id by its model when the backend populate its data', done => {
      let service2 = new Service();
      let driver = { _id: 'fakeId', name: 'Fake Name' };
      model._ref_driver = 'fakeId';
      config.registerService('Drivers', service2, 'api/drivers', creator);
      service2.collection.push(driver);
      service.refKeys = () => [{ backendKey: '_ref_driver', collection: 'Drivers', frontendKey: 'driver' }];

      fakeFetch.respondWith('{ "_id": "myId", "wheels": 4, "_ref_driver": { "_id": "fakeId", "name": "Fake Name" } }');

      service.create(model)
        .then(createdModel => {
          expect(createdModel._id).toEqual('myId');
          expect(createdModel.wheels).toEqual(4);
          expect(createdModel.driver).toBe(driver);
          done();
        });
    });
  });
});
