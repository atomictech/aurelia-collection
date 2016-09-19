import { Service } from '../../src/service';
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
  describe('.registerService()', () => {
    it('Should properly register a service.', () => {
      let config = new Config(new HttpStub());
      let service = new Service();
      let result = config.registerService('myService', service, '/api/myservice');

      expect(config.services.myService).toEqual(service);
      expect(result).toBe(config);
    });
  });

  describe('.getService()', () => {
    it('Should return the registred service, or null.', () => {
      let config = new Config(new HttpStub());
      let service = new Service();
      config.registerService('myService', service, '/api/myservice');

      let myService = config.getService('myService');
      let nullService = config.getService('none');
      let defaultService = config.getService();

      expect(myService instanceof Service).toBe(true);
      expect(myService._httpClient instanceof HttpStub).toBe(true);
      expect(nullService).toBe(null);
      expect(defaultService).toBe(null);

      config.setDefaultService('myService');
      defaultService = config.getService();

      expect(defaultService instanceof Service).toBe(true);
      expect(defaultService._httpClient instanceof HttpStub).toBe(true);
    });
  });

  describe('.serviceExists()', () => {
    it('Should true when a service is registered', () => {
      let config = new Config(new HttpStub());
      let service = new Service();

      config.registerService('service', service, '/api/service');

      let exists = config.serviceExists('service');
      let unknownExist = config.serviceExists('unknownService');

      expect(exists).toBe(true);
      expect(unknownExist).toBe(false);
    });
  });
});
