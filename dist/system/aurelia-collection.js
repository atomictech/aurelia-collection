'use strict';

System.register(['aurelia-framework', './collection', './service', './config'], function (_export, _context) {
  "use strict";

  var Aurelia, Collection, Service, Config;
  function configure(aurelia, configCallback) {
    var config = aurelia.container.get(Config);

    if (configCallback !== undefined && typeof configCallback === 'function') {
      configCallback(config);
    }
  }

  _export('configure', configure);

  return {
    setters: [function (_aureliaFramework) {
      Aurelia = _aureliaFramework.Aurelia;
    }, function (_collection) {
      Collection = _collection.Collection;
    }, function (_service) {
      Service = _service.Service;
    }, function (_config) {
      Config = _config.Config;
    }],
    execute: function () {
      _export('Collection', Collection);

      _export('Service', Service);

      _export('Config', Config);
    }
  };
});