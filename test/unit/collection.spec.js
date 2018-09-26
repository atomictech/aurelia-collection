import _ from 'lodash';
import fakeFetch from 'fake-fetch';
import { Container } from 'aurelia-dependency-injection';
import { StageComponent } from 'aurelia-testing';
import { bootstrap } from 'aurelia-bootstrapper';

import { Config } from '../../src/config';
import { Collection } from '../../src/collection';

function initializeCollections(car, carCollection, config, driver, driverCollection, phone, phoneCollection, screen, app, screenCollection, appCollection) {
  let creator = (data) => data;

  car = { _id: 'carId', wheels: 4, driver: '' };
  driver = { _id: 'driverId', name: 'Fake Name', phones: [] };
  phone = { _id: 'phone1', battery: '3h', screens: [{ screen: '', apps: [] }] };
  screen = { _id: 'screen1', index: 1 };
  app = { _id: 'app1', 'name': 'Makerz' };

  car.driver = driver;
  driver.phones = [phone];
  phone.screens = [{ screen: screen, apps: [app] }];

  carCollection = config.registerCollection('myKey', 'default/route/', Collection, creator);
  carCollection.collection.push(car);
  carCollection.refKeys = () => [{ backendKey: '_ref_driver', collection: 'Drivers', frontendKey: 'driver' }];

  driverCollection = config.registerCollection('Drivers', 'api/drivers/', Collection, creator);
  driverCollection.collection.push(driver);
  driverCollection.refKeys = () => [{ backendKey: '_ref_phones', collection: 'Phones', frontendKey: 'phones' }];


  phoneCollection = config.registerCollection('Phones', 'api/phones/', Collection, creator);
  phoneCollection.collection.push(phone);
  phoneCollection.refKeys = () => [
    { backendKey: 'screens._ref_screen', collection: 'Screens', frontendKey: 'screen' },
    { backendKey: 'screens._ref_apps', collection: 'Apps', frontendKey: 'apps' }];

  screenCollection = config.registerCollection('Screens', 'api/screens/', Collection, creator);
  screenCollection.collection.push(screen);

  appCollection = config.registerCollection('Apps', 'api/apps/', Collection, creator);
  appCollection.collection.push(app);

  return { car, carCollection, driver, driverCollection, phone, phoneCollection, screen, app, screenCollection, appCollection };
}

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
      collection = config.registerCollection('myKey', 'default/route/', Collection, creator);
    });

    it('Should return null when data is undefined or null', done => {
      collection.fromJSON().then(res => {
        expect(res).toEqual(null);
        done();
      });
    });

    it('Should return a new model when data has an id not found in the collection', done => {
      collection.fromJSON({ _id: 'carId', foo: 21 }).then(res => {
        expect(res).toEqual({ _id: 'carId', foo: 21 });
        done();
      });
    });

    it('Should return a new model when data has an id not found in the collection', done => {
      collection.fromJSON({ _id: 'carId', foo: 21 }, { ignoreCollection: true })
        .then(res => {
          expect(res).toEqual({ _id: 'carId', foo: 21 });
          expect(collection.collection).toEqual([]);
          done();
        });
    });

    it('Should return a existing model, _syncFrom depending on isComplete, if data id is found in the collection', done => {
      let model = {
        _id: 'carId',
        foo: 42
      };
      collection.collection.push(model);

      collection.fromJSON({ _id: 'carId' }).then(res => {
        expect(res).toEqual(model);
        done();
      });
    });
  });

  describe('.toJSON()', () => {
    let model;
    let collection;

    beforeEach(() => {
      let creator = (data) => data;
      model = { _id: 'fakeId', other: 'field' };
      collection = config.registerCollection('myKey', 'default/route/', Collection, creator);
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
      fakeFetch.respondWith('{ "_id": "carId" }');

      let collection = config.registerCollection('myKey');

      expect(collection.collection).toEqual([]);

      collection.get('carId')
        .then(res => {
          expect(res._id).toBe('carId');
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
      fakeFetch.respondWith('{ "_id": "carId", "foo": "bar" }');
      let creator = (data) => data;
      model = { _id: 'carId' };
      collection = config.registerCollection('myKey', 'default/route/', Collection, creator);
    });

    it('Should return the synced model when given an id', done => {
      collection.collection.push(model);
      collection.sync('carId').then(res => {
        expect(res).toEqual({ _id: 'carId', foo: 'bar' });
        done();
      });
    });

    it('Should return the synced model when given json data of the model', done => {
      collection.collection.push(model);
      collection.sync({ _id: 'carId' }).then(res => {
        expect(res).toEqual({ _id: 'carId', foo: 'bar' });
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
    it('Should merge two literal objects', done => {
      let foo = { f1: 1 };
      let bar = { f2: 2 };
      let collection = new Collection();

      collection
        ._syncFrom(foo, bar)
        .then(model => {
          expect(model).toBe(foo);
          expect(model).toEqual({ f1: 1, f2: 2 });
          done();
        });
    });

    it('Should not update model with backendKey attributes', done => {
      let car;
      let carCollection;
      let driver;
      let driverCollection;
      let phone;
      let phoneCollection;
      let screen;
      let screenCollection;
      let app;
      let appCollection;

      ({ car, carCollection, driver, driverCollection, phone, phoneCollection, screen, app, screenCollection, appCollection } = initializeCollections(car, carCollection, config, driver, driverCollection, phone, phoneCollection, screen, app, screenCollection, appCollection));

      // We want to change only battery in order to check synchronization too
      let phoneCopy = _.cloneDeep(phone);
      phoneCopy.battery = '5h';

      phoneCollection._syncFrom(phone, { battery: '5h', screens: [{ _ref_screen: 'screen1', _ref_apps: ['app1'] }] })
        .then(model => {
          expect(model).toBe(phone);
          expect(model).not.toBe(phoneCopy);
          expect(model).toEqual(phoneCopy);
          expect(model.screens[0].screen).toBe(screen);
          expect(model.screens[0].apps[0]).toBe(app);
          done();
        });
    });
  });

  describe('._getFromCollection', () => {
    it('Should find a model with default _id property value', () => {
      let creator = (data) => data;
      let model = { _id: 'carId' };
      let collection = config.registerCollection('myKey', 'default/route/', Collection, creator);

      collection.collection.push(model);
      expect(collection._getFromCollection('carId')).toEqual(model);
      expect(collection._getFromCollection('noId')).toBeUndefined();
    });

    it('Should find a model with custom id property value', () => {
      let creator = (data) => data;
      let model = { idField: 'carId' };
      let collection = config.registerCollection('myKey', 'default/route/', Collection, creator, 'idField');

      collection.collection.push(model);
      expect(collection._getFromCollection('carId')).toEqual(model);
      expect(collection._getFromCollection('noId')).toBeUndefined();
    });
  });

  describe('._removeFromCollection', () => {
    let creator;
    let collection;

    beforeEach(() => {
      creator = (data) => data;
    });

    it('Should remove a model with default _id property value', () => {
      let model = { _id: 'carId' };
      let anotherModel = { idField: 'myOtherId' };
      collection = config.registerCollection('myKey', 'default/route/', Collection, creator);

      collection.collection.push(model);
      collection.collection.push(anotherModel);

      collection._removeFromCollection('carId');
      expect(collection.collection).toEqual([anotherModel]);

      // We can try to remove it  again, and it still works.
      collection._removeFromCollection('carId');
      expect(collection.collection).toEqual([anotherModel]);
    });

    it('Should remove a model with default _id property value', () => {
      let model = { idField: 'carId' };
      let anotherModel = { idField: 'myOtherId' };
      collection = config.registerCollection('myKey', 'default/route/', Collection, creator, 'idField');

      collection.collection.push(model);
      collection.collection.push(anotherModel);

      collection._removeFromCollection('carId');
      expect(collection.collection).toEqual([anotherModel]);

      // We can try to remove it  again, and it still works.
      collection._removeFromCollection('carId');
      expect(collection.collection).toEqual([anotherModel]);
    });
  });

  describe('._getById', () => {
    let creator;
    let model;
    let collection;

    beforeEach(() => {
      creator = (data) => data;
      model = { _id: 'carId', wheels: 4 };
      collection = config.registerCollection('myKey', 'default/route/', Collection, creator);
    });

    it('Should return an already known model', done => {
      collection.collection.push(model);

      collection._getById('carId')
        .then(foundModel => {
          expect(foundModel).toBe(model);
          done();
        });
    });

    it('Should return a model when it is not already a known model', done => {
      fakeFetch.respondWith(JSON.stringify(model));

      spyOn(collection._httpClient, 'fetch').and.callThrough();

      collection._getById('carId', {
        force: false,
        route: collection.defaultRoute + 'carId/myOther/path'
      }).then(foundModel => {
        expect(foundModel).toEqual(model);
        expect(collection._httpClient.fetch).toHaveBeenCalledWith('default/route/carId/myOther/path');
        done();
      });
    });

    it('Should return the model by calling the fetch method when forcing it', done => {
      collection.collection.push(model);
      fakeFetch.respondWith(JSON.stringify(model));

      spyOn(collection._httpClient, 'fetch').and.callThrough();

      collection._getById('carId', { force: true })
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
      collection._getById('carId', { force: true })
        .then(foundModel => {
          expect(foundModel).toEqual(model);
          expect(collection._httpClient.fetch).toHaveBeenCalled();
          done();
        });
    });
  });

  describe('.create', () => {
    let creator;
    let car;
    let carCollection;

    beforeEach(() => {
      creator = (data) => data;
      car = { _id: 'carId', wheels: 4 };
      carCollection = config.registerCollection('myKey', 'default/route/', Collection, creator);
    });

    it('Should return the created model', done => {
      car = { _id: 'carId', wheels: 4 };
      fakeFetch.respondWith(JSON.stringify(car));

      spyOn(carCollection._httpClient, 'fetch').and.callThrough();

      carCollection.create(car)
        .then(createdModel => {
          expect(createdModel).toEqual(car);
          expect(carCollection._httpClient.fetch).toHaveBeenCalledWith('default/route', jasmine.objectContaining({ method: 'post' }));
          done();
        });
    });

    it('Should return the created model on a dedicated route', done => {
      car = { _id: 'carId', wheels: 4 };
      fakeFetch.respondWith(JSON.stringify(car));

      spyOn(carCollection._httpClient, 'fetch').and.callThrough();

      carCollection.create(car, { route: 'default/route/creation' })
        .then(createdModel => {
          expect(createdModel).toEqual(car);
          expect(carCollection._httpClient.fetch).toHaveBeenCalledWith(('default/route/creation'), jasmine.objectContaining({ method: 'post' }));
          done();
        });
    });

    it('Should return the model and leave the submodel id', done => {
      let driver = { _id: 'driverId', name: 'Fake Name' };
      car._ref_driver = 'driverId';
      let driverCollection = config.registerCollection('Drivers', 'api/drivers/', Collection, creator);
      driverCollection.collection.push(driver);
      carCollection.refKeys = () => [{ backendKey: '_ref_driver', collection: 'Drivers', frontendKey: 'driver' }];

      fakeFetch.respondWith('{ "_id": "carId", "wheels": 4, "_ref_driver": "driverId"}');

      carCollection.create(car)
        .then(createdModel => {
          expect(createdModel._id).toEqual('carId');
          expect(createdModel.wheels).toEqual(4);
          expect(createdModel._ref_driver).toEqual(driver._id);
          done();
        });
    });

    it('Should return the model and replace the submodel id by its model when the backend populate its data', done => {
      let driver = { _id: 'driverId', name: 'Fake Name' };
      car._ref_driver = 'driverId';
      let driverCollection = config.registerCollection('Drivers', 'api/drivers/', Collection, creator);
      driverCollection.collection.push(driver);
      carCollection.refKeys = () => [{ backendKey: '_ref_driver', collection: 'Drivers', frontendKey: 'driver' }];

      fakeFetch.respondWith('{ "_id": "carId", "wheels": 4, "_ref_driver": { "_id": "driverId", "name": "Fake Name" } }');

      carCollection.create(car)
        .then(createdModel => {
          expect(createdModel._id).toEqual('carId');
          expect(createdModel.wheels).toEqual(4);
          expect(createdModel.driver).toBe(driver);
          done();
        });
    });
  });

  describe('.destroy()', () => {
    let creator;
    let car;
    let carCollection;

    beforeEach(() => {
      creator = (data) => data;
      car = { _id: 'carId', wheels: 4 };
      carCollection = config.registerCollection('myKey', 'default/route/', Collection, creator);
      carCollection.collection.push(car);
      fakeFetch.respondWith('{ "response": "ok" }');
      spyOn(carCollection._httpClient, 'fetch').and.callThrough();
    });

    it('Should remove the model from the collection and call the fetch method', done => {
      carCollection.destroy(car._id)
        .then(answer => {
          expect(carCollection.collection).toEqual([]);
          expect(carCollection._httpClient.fetch).toHaveBeenCalledWith('default/route/' + car._id, { method: 'delete' });
          done();
        });
    });

    it('Should remove the model and call the fetch method on a dedicated route', done => {
      carCollection.destroy(car._id, { route: 'destroy/' + car._id })
        .then(answer => {
          expect(carCollection.collection).toEqual([]);
          expect(carCollection._httpClient.fetch).toHaveBeenCalledWith('destroy/' + car._id, { method: 'delete' });
          done();
        });
    });
  });

  describe('.all', () => {
    let creator;
    let cars;
    let carCollection;

    beforeEach(() => {
      creator = (data) => data;
      cars = [{ _id: 'carId', wheels: 4 }, { _id: 'carId2', wheels: 2 }];
      carCollection = config.registerCollection('myKey', '/default/route', Collection, creator);
      carCollection.collection = carCollection.collection.concat(cars);
    });

    it('Should return a promise with all the collection models', done => {
      fakeFetch.respondWith(JSON.stringify(cars));
      spyOn(carCollection._httpClient, 'fetch').and.callThrough();

      carCollection.all()
        .then(listModels => {
          expect(listModels).toEqual(cars);
          expect(carCollection._httpClient.fetch).toHaveBeenCalledWith('/default/route');
          done();
        });
    });
  });

  describe('.get()', () => {
    let car;
    let driver;
    let phone;
    let screen;
    let app;
    let carCollection;
    let driverCollection;
    let phoneCollection;
    let screenCollection;
    let appCollection;

    beforeEach(() => {
      ({ car, carCollection, driver, driverCollection, phone, phoneCollection, screen, app, screenCollection, appCollection } = initializeCollections(car, carCollection, config, driver, driverCollection, phone, phoneCollection, screen, app, screenCollection, appCollection));
    });

    it('Should return the parameters when calling with undefined', done => {
      carCollection.get()
        .then(data => {
          expect(data).toBeUndefined();
          done();
        });
    });

    it('Should return the parameters when calling with null', done => {
      carCollection.get(null)
        .then(data => {
          expect(data).toBeNull();
          done();
        });
    });

    it('Should return a model according to its id.', done => {
      carCollection.get('carId')
        .then(foundModel => {
          expect(foundModel).toBe(car);
          done();
        });
    });

    it('Should return a model according to its attributes containg an id.', done => {
      carCollection.get({ _id: 'carId' })
        .then(foundModel => {
          expect(foundModel).toBe(car);
          done();
        });
    });

    it('Should return the models according to the ids array.', done => {
      let model2 = { _id: 'id2', wheels: 2, _ref_driver: undefined };
      carCollection.collection.push(model2);

      carCollection.get(['carId', 'id2'])
        .then(modelArray => {
          expect(modelArray).toContain(car);
          expect(modelArray).toContain(model2);
          done();
        });
    });

    it('Should return a model by calling the fetch api when using force parameter', done => {
      let carCopy = _.clone(car);
      carCopy._ref_driver = carCopy.driver._id;
      delete carCopy.driver;

      fakeFetch.respondWith(JSON.stringify(carCopy));
      spyOn(carCollection._httpClient, 'fetch').and.callThrough();

      carCollection.get(carCopy._id, { force: true })
        .then(foundModel => {
          expect(foundModel).toEqual(car);
          expect(carCollection._httpClient.fetch).toHaveBeenCalledWith(jasmine.stringMatching('default/route/' + carCopy._id));
          done();
        });
    });

    it('Should populate the child when forcing it', done => {
      _.unset(car, 'driver');
      car._ref_driver = driver._id;

      carCollection.get('carId', { populate: true })
        .then(foundModel => {
          expect(foundModel._id).toBe('carId');
          expect(foundModel.wheels).toBe(4);
          expect(foundModel.driver).toEqual({ _id: 'driverId', name: 'Fake Name', phones: [phone] });
          done();
        });
    });

    it('Should leave the reference key unmodified when the collection has not been registered', done => {
      carCollection.refKeys = () => [{ backendKey: '_ref_driver', collection: 'UnknownCollection', frontendKey: 'driver' }];

      _.unset(car, 'driver');
      car._ref_driver = driver._id;

      carCollection.get('carId', { populate: true })
        .then(foundModel => {
          expect(foundModel._id).toBe('carId');
          expect(foundModel.wheels).toBe(4);
          expect(foundModel._ref_driver).toBe('driverId');
          expect(foundModel.driver).toBeUndefined();
          done();
        });
    });

    it('Should populate the child and its grand child when using recursive and populate options', done => {
      carCollection.get('carId', { populate: true, recursive: true })
        .then(foundModel => {
          expect(foundModel._id).toBe('carId');
          expect(foundModel.wheels).toBe(4);
          expect(foundModel.driver._id).toBe('driverId');
          expect(foundModel.driver.name).toBe('Fake Name');
          expect(foundModel.driver.phones).toContain(phone);
          done();
        });
    });

    it('Should leave the reference key unmodified when no backendKey has been defined', done => {
      carCollection.refKeys = () => [{ collection: 'Drivers', frontendKey: 'driver' }];

      _.unset(car, 'driver');
      car._ref_driver = driver._id;

      carCollection.get('carId', { populate: true })
        .then(foundModel => {
          expect(foundModel._id).toBe('carId');
          expect(foundModel.wheels).toBe(4);
          expect(foundModel._ref_driver).toEqual('driverId');
          done();
        });
    });

    it('Should not modyfing the key used for references when no frontendKey has been defined', done => {
      carCollection.refKeys = () => [{ backendKey: '_ref_driver', collection: 'Drivers' }];

      _.unset(car, 'driver');
      car._ref_driver = driver._id;

      carCollection.get('carId', { populate: true })
        .then(foundModel => {
          expect(foundModel._id).toBe('carId');
          expect(foundModel.wheels).toBe(4);
          expect(foundModel._ref_driver).toEqual({ _id: 'driverId', name: 'Fake Name', phones: [phone] });
          done();
        });
    });

    it('Should keep the JSON data when no collection has been set', done => {
      carCollection.refKeys = () => [{ backendKey: '_ref_driver', frontendKey: 'driver' }];

      _.unset(car, 'driver');
      car._ref_driver = driver._id;

      carCollection.get('carId', { populate: true })
        .then(foundModel => {
          expect(foundModel._id).toBe('carId');
          expect(foundModel.wheels).toBe(4);
          expect(foundModel.driver).toEqual('driverId');
          done();
        });
    });

    it('Should populate the child when forcing it (backendKeyDeletion: false)', done => {
      carCollection.refKeys = () => [{ backendKey: '_ref_driver', collection: 'Drivers', frontendKey: 'driver', backendKeyDeletion: false }];

      _.unset(car, 'driver');
      car._ref_driver = driver._id;

      carCollection.get('carId', { populate: true })
        .then(foundModel => {
          expect(foundModel._id).toBe('carId');
          expect(foundModel.wheels).toBe(4);
          expect(foundModel._ref_driver).toBe('driverId');
          expect(foundModel.driver).toEqual({ _id: 'driverId', name: 'Fake Name', phones: [phone] });
          done();
        });
    });

    it('Should create all the models accordingly', done => {
      fakeFetch.respondWith('{ "_id": "carId", "wheels": 4, "_ref_driver" : { "_id" : "driverId", "name" : "Updated Fake Name", "_ref_phones" : [{ "_id" : "phone1", "battery": "4h"}] } }');
      carCollection.collection = [];
      driverCollection.collection = [];
      phoneCollection.collection = [];

      carCollection.get('carId')
        .then(foundModel => {
          expect(foundModel._id).toBe('carId');
          expect(foundModel.wheels).toBe(4);
          expect(foundModel.driver._id).toBe('driverId');
          expect(foundModel.driver.name).toBe('Updated Fake Name');
          expect(foundModel.driver.phones).toContain({ _id: 'phone1', battery: '4h' });
          expect(carCollection.collection).toContain(foundModel);
          expect(driverCollection.collection).toContain(foundModel.driver);
          expect(phoneCollection.collection).toContain(foundModel.driver.phones[0]);
          done();
        });
    });

    it('Should create all the models accordingly with refKey path containing array', done => {
      fakeFetch.respondWith('{ "_id": "carId", "wheels": 4, "_ref_driver" : { "_id" : "driverId", "name" : "Updated Fake Name", "_ref_phones" : [{ "_id" : "phone1", "battery": "4h", "screens": [{ "_ref_screen": {"_id": "screen1", "index": 1}, "_ref_apps": [{"_id": "app1", "name": "Makerz"}] }]}] } }');
      carCollection.collection = [];
      driverCollection.collection = [];
      phoneCollection.collection = [];
      screenCollection.collection = [];
      appCollection.collection = [];

      carCollection.get('carId')
        .then(foundModel => {
          expect(foundModel._id).toBe('carId');
          expect(foundModel.wheels).toBe(4);
          expect(foundModel.driver._id).toBe('driverId');
          expect(foundModel.driver.name).toBe('Updated Fake Name');
          expect(foundModel.driver.phones).toContain({ _id: 'phone1', battery: '4h', screens: [{ screen: { _id: 'screen1', index: 1 }, apps: [{ _id: 'app1', name: 'Makerz' }] }] });
          expect(carCollection.collection).toContain(foundModel);
          expect(driverCollection.collection).toContain(foundModel.driver);
          expect(phoneCollection.collection).toContain(foundModel.driver.phones[0]);
          expect(screenCollection.collection).toContain(foundModel.driver.phones[0].screens[0].screen);
          expect(appCollection.collection).toContain(foundModel.driver.phones[0].screens[0].apps[0]);
          done();
        });
    });
  });

  describe('.find()', () => {
    let creator;
    let modelCached;
    let modelFetched;
    let collection;

    beforeEach(() => {
      creator = (data) => data;
      modelCached = { _id: 'carId', wheels: 42, predicate: 'foo' };
      modelFetched = { _id: 'carId2', wheels: 2, predicate: 'bar' };
      collection = config.registerCollection('myKey', '/default/route', Collection, creator);
      collection.collection.push(modelCached);
    });

    it('Should return undefined if no model correspond to predicate and no fallback url', done => {
      collection.find({ predicate: 'jumbo' })
        .then(foundModel => {
          expect(foundModel).toBeUndefined();
          done();
        });
    });

    it('Should return local cached model that match predicate if model is already in collection', done => {
      collection.find({ predicate: 'foo' })
        .then(foundModel => {
          expect(foundModel).toBe(modelCached);
          done();
        });
    });

    it('Should return fetched model(s)', done => {
      fakeFetch.respondWith(JSON.stringify(modelFetched));
      spyOn(collection._httpClient, 'fetch').and.callThrough();

      collection.find({ predicate: 'whatever' }, '/fallback/route/id')
        .then(foundModel => {
          expect(foundModel).toEqual(modelFetched);
          expect(collection._httpClient.fetch).toHaveBeenCalledWith('/fallback/route/id');
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
      model = { _id: 'carId', wheels: 4 };
      collection = config.registerCollection('myKey', '/default/route/', Collection, creator);
      collection.collection.push(model);
    });

    it('Should modify the model according to the attribute values', done => {
      fakeFetch.respondWith('{ "_id": "carId", "wheels": 5 }');
      spyOn(collection._httpClient, 'fetch').and.callThrough();

      collection.update(model, { wheels: 5 })
        .then(updatedModel => {
          expect(updatedModel).toBe(model);
          expect(updatedModel.wheels).toBe(5);
          expect(collection._httpClient.fetch).toHaveBeenCalledWith('/default/route/carId', jasmine.objectContaining({ method: 'put' }));
          done();
        });
    });

    it('Should call the overload route when route parameter is specified', done => {
      fakeFetch.respondWith('{ "_id": "carId", "wheels": 5 }');
      spyOn(collection._httpClient, 'fetch').and.callThrough();

      collection.update(model, { wheels: 5 }, { route: collection.defaultRoute + model._id + '/other/path' })
        .then(updatedModel => {
          expect(updatedModel).toBe(model);
          expect(updatedModel.wheels).toBe(5);
          expect(collection._httpClient.fetch).toHaveBeenCalledWith('/default/route/carId/other/path', jasmine.objectContaining({ method: 'put' }));
          done();
        });
    });
  });

  describe('._frontToBackend()', () => {
    let car;
    let driver;
    let phone;
    let screen;
    let app;
    let carCollection;
    let driverCollection;
    let phoneCollection;
    let screenCollection;
    let appCollection;

    beforeEach(() => {
      ({ car, carCollection, driver, driverCollection, phone, phoneCollection, screen, app, screenCollection, appCollection } = initializeCollections(car, carCollection, config, driver, driverCollection, phone, phoneCollection, screen, app, screenCollection, appCollection));
    });

    it('Should not convert anything when no refkeys have been overloaded', done => {
      carCollection.refKeys = () => [];

      carCollection._frontToBackend({ wheels: 5, driver: driver })
        .then(attributes => {
          expect(attributes).toEqual({ wheels: 5, driver: driver });
          done();
        });
    });

    it('Should replace a refkey\'d attribute by its id', done => {
      carCollection._frontToBackend({ wheels: 5, driver: driver })
        .then(attributes => {
          expect(attributes.wheels).toBe(5);
          expect(attributes.driver).toBeUndefined();
          expect(attributes._ref_driver).toBe(driver._id);
          done();
        });
    });

    it('Should replace a deep refkey\'d attribute by its id', done => {
      phoneCollection._frontToBackend({ _id: 'phone1', battery: '5h', screens: [{ screen: screen, apps: [app] }] })
        .then(attributes => {
          expect(attributes.battery).toBe('5h');
          expect(attributes.screens[0].screen).toBeUndefined();
          expect(attributes.screens[0].apps).toBeUndefined();
          expect(attributes.screens[0]._ref_screen).toBe(screen._id);
          expect(attributes.screens[0]._ref_apps).toBeArray();
          if (attributes.screens[0]._ref_apps instanceof Array) {
            expect(attributes.screens[0]._ref_apps[0]).toBe(app._id);
          }
          done();
        });
    });

    it('Should not delete the frontendKey if backendKeyDeletion is true', done => {
      carCollection.refKeys = () => [{ backendKey: '_ref_driver', collection: 'Drivers', frontendKey: 'driver', backendKeyDeletion: false }];

      carCollection._frontToBackend({ wheels: 5, driver: driver })
        .then(attributes => {
          expect(attributes.wheels).toBe(5);
          expect(attributes.driver).toBe(driver);
          expect(attributes._ref_driver).toBe(driver._id);
          done();
        });
    });

    it('Should support the use of an array of references', done => {
      let driver2 = { _id: 'fakeDriver2', name: 'Frank' };

      carCollection._frontToBackend({ wheels: 5, driver: [driver, driver2] })
        .then(attributes => {
          expect(attributes.wheels).toBe(5);
          expect(attributes.driver).toBeUndefined();
          expect(attributes._ref_driver).toContain(driver._id);
          expect(attributes._ref_driver).toContain(driver2._id);
          done();
        });
    });

    it('Should support the use of an id for reference', done => {
      carCollection._frontToBackend({ wheels: 5, driver: driver._id })
        .then(attributes => {
          expect(attributes.wheels).toBe(5);
          expect(attributes.driver).toBeUndefined();
          expect(attributes._ref_driver).toBe(driver._id);
          done();
        });
    });

    it('Should convert the backend key to null if the frontend key is not of supported type', done => {
      carCollection._frontToBackend({ wheels: 5, driver: 42 })
        .then(attributes => {
          expect(attributes.wheels).toBe(5);
          expect(attributes.driver).toBeUndefined();
          expect(attributes._ref_driver).toBeNull();
          done();
        });
    });

    it('Should convert the backend key to null if the value is an object without its id value', done => {
      carCollection._frontToBackend({ wheels: 5, driver: { name: 'Unknown name' } })
        .then(attributes => {
          expect(attributes.wheels).toBe(5);
          expect(attributes.driver).toBeUndefined();
          expect(attributes._ref_driver).toBeNull();
          done();
        });
    });

    it('Should not add frontendKeys if they are not present in the attributes', done => {
      carCollection._frontToBackend({ wheels: 5 })
        .then(attributes => {
          expect(attributes.wheels).toBe(5);
          expect(attributes.driver).toBeUndefined();
          expect(attributes._ref_driver).toBeUndefined();
          done();
        });
    });
  });

  describe('._backToFrontend()', () => {
    let car;
    let driver;
    let driver2;
    let phone;
    let screen;
    let app;
    let carCollection;
    let driverCollection;
    let phoneCollection;
    let screenCollection;
    let appCollection;
    let backEndAttrs;

    beforeEach(() => {
      ({ car, carCollection, driver, driverCollection, phone, phoneCollection, screen, app, screenCollection, appCollection } = initializeCollections(car, carCollection, config, driver, driverCollection, phone, phoneCollection, screen, app, screenCollection, appCollection));

      // The returned backend attributes
      // (different from backend converted attributes previously sended to the backend)
      backEndAttrs = { wheels: 5, _ref_driver: { _id: 'driver2', name: 'Fake Name', phones: ['phone2'] }, doors: 4, purchasedOn: new Date() };

      driver2 = { _id: 'driver2', name: 'Fake Name' };
      driverCollection.collection.push(driver2);
    });

    it('Should not convert any key when no refkeys have been overloaded', done => {
      carCollection.refKeys = () => [];

      _.unset(car, 'driver');

      carCollection._backToFrontend(backEndAttrs, car, { attributeFilter: ['wheels', '_ref_driver'] })
        .then(attributes => {
          expect(car.wheels).toBe(5);
          expect(car._ref_driver).toEqual(backEndAttrs._ref_driver);
          expect(car.purchasedOn).toBeUndefined();
          expect(car.doors).toBeUndefined();
          expect(car.driver).toBeUndefined();
          done();
        });
    });

    it('Should not convert any key when no collection have been specified', done => {
      carCollection.refKeys = () => [{ backendKey: '_ref_driver', frontendKey: 'driver' }];

      _.unset(car, 'driver');

      carCollection._backToFrontend(backEndAttrs, car, { attributeFilter: ['wheels', '_ref_driver'] })
        .then(attributes => {
          expect(car.wheels).toBe(5);
          expect(car._ref_driver).toEqual(backEndAttrs._ref_driver);
          expect(car.purchasedOn).toBeUndefined();
          expect(car.doors).toBeUndefined();
          expect(car.driver).toBeUndefined();
          done();
        });
    });

    it('Should replace a refkey\'d attribute by its value', done => {
      _.unset(car, 'driver');

      carCollection._backToFrontend(backEndAttrs, car, { attributeFilter: ['wheels', '_ref_driver'] })
        .then(attributes => {
          expect(car.wheels).toBe(5);
          expect(car.driver).toBe(driver2);
          expect(car.purchasedOn).toBeUndefined();
          expect(car.doors).toBeUndefined();
          expect(car._ref_driver).toBeUndefined();
          done();
        });
    });

    it('Should replace a deep refkey\'d attribute by its value', done => {
      let screen2 = { _id: 'screen2', index: 2 };
      screenCollection.collection.push(screen2);
      let app2 = { _id: 'app2', name: 'Crocks' };
      appCollection.collection.push(app2);

      let backendResAttr = { _id: 'phone1', battery: '5h', screens: [{ _ref_screen: 'screen2', _ref_apps: ['app2'] }], color: 'pink' };

      phoneCollection._backToFrontend(backendResAttr, phone, { attributeFilter: ['battery', 'screens'] })
        .then(attributes => {
          expect(phone.battery).toBe('5h');
          expect(phone.color).toBeUndefined();
          expect(phone.screens[0].screen).toBe(screen2);
          expect(phone.screens[0].apps[0]).toBe(app2);
          done();
        });
    });
  });
});
