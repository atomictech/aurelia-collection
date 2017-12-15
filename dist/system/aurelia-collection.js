System.register(["whatwg-fetch", "./use-collection", "./collection", "./config"], function (_export, _context) {
  "use strict";

  var UseCollection, Collection, Config;

  function configure(aurelia, configCallback) {
    var config = aurelia.container.get(Config);

    if (configCallback === undefined || typeof configCallback !== 'function') {
      var error = 'You need to provide a callback method to properly configure the library';
      throw error;
    }

    configCallback(config);
  }

  _export("configure", configure);

  return {
    setters: [function (_whatwgFetch) {}, function (_useCollection) {
      UseCollection = _useCollection.UseCollection;
    }, function (_collection) {
      Collection = _collection.Collection;
    }, function (_config) {
      Config = _config.Config;
    }],
    execute: function () {
      _export("UseCollection", UseCollection);

      _export("Collection", Collection);

      _export("Config", Config);
    }
  };
});