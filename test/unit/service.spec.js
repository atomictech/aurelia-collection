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
  beforeEach(done => {
    fakeFetch.install();
    component = StageComponent.withResources();
    component.create(bootstrap)
      .then(() => {
        container = new Container();
        config = container.get(Config);
        done();
      });
  });

  afterEach(() => {
    fakeFetch.restore();
    component.dispose();
  });

  describe('.configure()', () => {
    it('Should properly initialize the service', () => {
      let service = new Service();
      service.configure('myKey');

      expect(service.modelid).toBe('_id');
      expect(service.modelClass).toBeUndefined();
      expect(service.defaultRoute).toBe('/api/myKey/');
      expect(service.collection instanceof Array).toBe(true);
      expect(service.refKeys()).toEqual([]);
      expect(service.isComplete()).toBeTruthy();
    });
  });

  describe('.toJSON()', () => {
    let model;
    let service;
    beforeEach(() => {
      let creator = (data) => data;
      model = { _id: 'fakeId', other: 'field' };
      service = new Service();
      config.registerService('myKey', service, creator);
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
});
