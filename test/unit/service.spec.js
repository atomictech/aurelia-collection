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
      config.registerService('myKey', service, 'default/route/', creator);
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
      config.registerService('myKey', service, 'default/route/', creator);
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
      config.registerService('myKey', service, 'default/route/', creator);
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
      config.registerService('myKey', service, 'default/route/', creator);

      service.collection.push(model);
      expect(service._getFromCollection('myId')).toEqual(model);
      expect(service._getFromCollection('noId')).toBeUndefined();
    });

    it('Should find a model with custom id property value', () => {
      let creator = (data) => data;
      let model = { idField: 'myId' };
      let service = new Service();
      config.registerService('myKey', service, 'default/route/', creator, 'idField');

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
      config.registerService('myKey', service, 'default/route/', creator);

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
      config.registerService('myKey', service, 'default/route/', creator, 'idField');

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
      config.registerService('myKey', service, 'default/route/', creator);
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
      config.registerService('myKey', service, 'default/route/', creator);
    });

    it('Should return the created model', done => {
      model = { _id: 'myId', wheels: 4 };
      fakeFetch.respondWith(JSON.stringify(model));

      spyOn(service._httpClient, 'fetch').and.callThrough();

      service.create(model)
        .then(createdModel => {
          expect(createdModel).toEqual(model);
          expect(service._httpClient.fetch).toHaveBeenCalledWith('default/route', jasmine.objectContaining({ method: 'post' }));
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
          expect(service._httpClient.fetch).toHaveBeenCalledWith(('default/route/creation'), jasmine.objectContaining({ method: 'post' }));
          done();
        });
    });

    it('Should return the model and leave the submodel id', done => {
      let service2 = new Service();
      let driver = { _id: 'fakeId', name: 'Fake Name' };
      model._ref_driver = 'fakeId';
      config.registerService('Drivers', service2, 'api/drivers/', creator);
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
      config.registerService('Drivers', service2, 'api/drivers/', creator);
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

  describe('.destroy()', () => {
    let creator;
    let model;
    let service;

    beforeEach(() => {
      creator = (data) => data;
      model = { _id: 'myId', wheels: 4 };
      service = new Service();
      config.registerService('myKey', service, 'default/route/', creator);
      service.collection.push(model);
      fakeFetch.respondWith('{ "response": "ok" }');
      spyOn(service._httpClient, 'fetch').and.callThrough();
    });

    it('Should remove the model from the collection and call the fetch method', done => {
      service.destroy(model._id)
        .then(answer => {
          expect(service.collection).toEqual([]);
          expect(service._httpClient.fetch).toHaveBeenCalledWith('default/route/' + model._id, { method: 'delete' });
          done();
        });
    });

    it('Should remove the model and call the fetch method on a dedicated route', done => {
      service.destroy(model._id, 'destroy/' + model._id)
        .then(answer => {
          expect(service.collection).toEqual([]);
          expect(service._httpClient.fetch).toHaveBeenCalledWith('default/route/destroy/' + model._id, { method: 'delete' });
          done();
        });
    });
  });

  describe('.get()', () => {
    let creator;
    let model;
    let driver;
    let phone;
    let service;
    let service2;
    let service3;

    beforeEach(() => {
      creator = (data) => data;
      model = { _id: 'myId', wheels: 4 };
      service = new Service;
      config.registerService('myKey', service, 'default/route/', creator);
      service.collection.push(model);

      service2 = new Service();
      driver = { _id: 'fakeId', name: 'Fake Name' };
      model._ref_driver = 'fakeId';
      config.registerService('Drivers', service2, 'api/drivers/', creator);
      service2.collection.push(driver);
      service.refKeys = () => [{ backendKey: '_ref_driver', collection: 'Drivers', frontendKey: 'driver' }];

      service3 = new Service();
      phone = { _id: 'phone1', battery: '3h' };
      driver._ref_phones = ['phone1'];
      config.registerService('Phones', service3, 'api/phones/', creator);
      service3.collection.push(phone);
      service2.refKeys = () => [{ backendKey: '_ref_phones', collection: 'Phones', frontendKey: 'phones' }];
    });

    it('Should return the parameters when calling with undefined', done => {
      service.get()
        .then(data => {
          expect(data).toBeUndefined();
          done();
        });
    });

    it('Should return the parameters when calling with null', done => {
      service.get(null)
        .then(data => {
          expect(data).toBeNull();
          done();
        });
    });

    it('Should return a model according to its id.', done => {
      service.get('myId')
        .then(foundModel => {
          expect(foundModel).toBe(model);
          done();
        });
    });

    it('Should return a model according to its attributes containg an id.', done => {
      service.get({ _id: 'myId' })
        .then(foundModel => {
          expect(foundModel).toBe(model);
          done();
        });
    });

    it('Should return the models according to the ids array.', done => {
      let model2 = { _id: 'id2', wheels: 2, _ref_driver: undefined };
      service.collection.push(model2);

      service.get(['myId', 'id2'])
        .then(modelArray => {
          expect(modelArray).toContain(model);
          expect(modelArray).toContain(model2);
          done();
        });
    });

    it('Should return a model by calling the fetch api when using force parameter', done => {
      fakeFetch.respondWith('{ "_id": "myId", "wheels": 4, "_ref_driver": "fakeId" }');
      spyOn(service._httpClient, 'fetch').and.callThrough();

      service.get('myId', { force: true })
        .then(foundModel => {
          expect(foundModel).toEqual(model);
          expect(service._httpClient.fetch).toHaveBeenCalledWith(jasmine.stringMatching('default/route/' + model._id));
          done();
        });
    });

    it('Should populate the child when forcing it', done => {
      service.get('myId', { populate: true })
        .then(foundModel => {
          expect(foundModel._id).toBe('myId');
          expect(foundModel.wheels).toBe(4);
          expect(foundModel.driver).toEqual({ _id: 'fakeId', name: 'Fake Name', _ref_phones: ['phone1'] });
          done();
        });
    });

    it('Should populate the child and its grand child when using recursive and populate options', done => {
      service.get('myId', { populate: true, recursive: true })
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
      service.refKeys = () => [{ collection: 'Drivers', frontendKey: 'driver' }];

      service.get('myId', { populate: true })
        .then(foundModel => {
          expect(foundModel._id).toBe('myId');
          expect(foundModel.wheels).toBe(4);
          expect(foundModel._ref_driver).toEqual('fakeId');
          done();
        });
    });

    it('Should not modyfing the key used for references when no frontendKey has been defined', done => {
      service.refKeys = () => [{ backendKey: '_ref_driver', collection: 'Drivers' }];

      service.get('myId', { populate: true })
        .then(foundModel => {
          expect(foundModel._id).toBe('myId');
          expect(foundModel.wheels).toBe(4);
          expect(foundModel._ref_driver).toEqual({ _id: 'fakeId', name: 'Fake Name', _ref_phones: ['phone1'] });
          done();
        });
    });

    it('Should keep the JSON data when no collection has been set', done => {
      service.refKeys = () => [{ backendKey: '_ref_driver', frontendKey: 'driver' }];

      service.get('myId', { populate: true })
        .then(foundModel => {
          expect(foundModel._id).toBe('myId');
          expect(foundModel.wheels).toBe(4);
          expect(foundModel.driver).toEqual('fakeId');
          done();
        });
    });

    it('Should populate the child when forcing it', done => {
      service.refKeys = () => [{ backendKey: '_ref_driver', collection: 'Drivers', frontendKey: 'driver', backendKeyDeletion: false }];

      service.get('myId', { populate: true })
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
      service.collection = [];
      service2.collection = [];
      service3.collection = [];

      service.get('myId')
        .then(foundModel => {
          expect(foundModel._id).toBe('myId');
          expect(foundModel.wheels).toBe(4);
          expect(foundModel.driver._id).toBe('fakeId');
          expect(foundModel.driver.name).toBe('Updated Fake Name');
          expect(foundModel.driver.phones).toContain({ _id: 'phone1', battery: '4h' });
          expect(service.collection).toContain(foundModel);
          expect(service2.collection).toContain(foundModel.driver);
          expect(service3.collection).toContain(foundModel.driver.phones[0]);
          done();
        });
    });
  });
});
