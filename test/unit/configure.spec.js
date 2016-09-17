import {Aurelia} from 'aurelia-framework';

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

  configure(func) {
  }
}

describe('Config', function() {
  describe('.registerService()', function() {
    it('Should properly register a service.', function() {
      let config = new Config(Aurelia, new HttpStub());
      let service = new Service();
      let result = config.registerService('myService', '/api/myservice', service);

      expect(config.services.myService).toEqual(service);
      expect(result).toBe(config);
    });
  });
});
