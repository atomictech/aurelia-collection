# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.6.1](https://github.com/atomictech/aurelia-collection/compare/v0.6.0...v0.6.1) (2020-03-16)


### Bug Fixes

* **collection:** Converting a key should use the key’s modelid, not the model’s. ([991ea77](https://github.com/atomictech/aurelia-collection/commit/991ea77b8c32573c2afddb9c8e1958b4abf68868))

# [0.6.0](https://github.com/atomictech/aurelia-collection/compare/v0.5.6...v0.6.0) (2019-03-22)


### Bug Fixes

* **CI:** A little spelling mistake in the istanbul usage of the plugin. ([ec2d67d](https://github.com/atomictech/aurelia-collection/commit/ec2d67d))
* **CI:** set the minimal version of node to 8 (due to karma 4) ([5dbf321](https://github.com/atomictech/aurelia-collection/commit/5dbf321))
* **CI:** set the minimal version of node to lts/carbon because NVM doesn’t know ‘8’ ([d32feb0](https://github.com/atomictech/aurelia-collection/commit/d32feb0))


### Features

* **collection:** opt-out option for attributes being set after a model has been instancied. ([c050856](https://github.com/atomictech/aurelia-collection/commit/c050856))



<a name="0.5.6"></a>
## [0.5.6](https://github.com/atomictech/aurelia-collection/compare/v0.5.5...v0.5.6) (2018-11-19)


### Bug Fixes

* **package:** Fix package main target. ([867466e](https://github.com/atomictech/aurelia-collection/commit/867466e))



<a name="0.5.5"></a>
## [0.5.5](https://github.com/atomictech/aurelia-collection/compare/v0.5.4...v0.5.5) (2018-09-26)


### Bug Fixes

* **collection:** Fix null conversion _backToFrontend when a backendKey is missing in the attributes. ([49a1182](https://github.com/atomictech/aurelia-collection/commit/49a1182))



<a name="0.5.4"></a>
## [0.5.4](https://github.com/atomictech/aurelia-collection/compare/v0.5.3...v0.5.4) (2018-09-26)


### Bug Fixes

* **collection:** Fix null conversion _frontToBack when a frontKey is missing in the attribute. ([7a096ce](https://github.com/atomictech/aurelia-collection/commit/7a096ce))



<a name="0.5.3"></a>
## [0.5.3](https://github.com/atomictech/aurelia-collection/compare/v0.5.2...v0.5.3) (2018-09-25)


### Bug Fixes

* **collection:** Change _syncFrom behavior in order to not pollute model with temporary backendKeys. Allow users to observe models correctly. ([ae80a4b](https://github.com/atomictech/aurelia-collection/commit/ae80a4b))
* **test:** Creator declaration. ([c2d4761](https://github.com/atomictech/aurelia-collection/commit/c2d4761))



<a name="0.5.2"></a>
## [0.5.2](https://github.com/atomictech/aurelia-collection/compare/v0.5.1...v0.5.2) (2018-09-18)


### Bug Fixes

* **collection:** Fix deep referencing update issue (rewrite of update code and tests). ([92673ac](https://github.com/atomictech/aurelia-collection/commit/92673ac))



<a name="0.5.0"></a>
# [0.5.0](https://github.com/atomictech/aurelia-collection/compare/v0.4.10...v0.5.0) (2018-04-25)


### Bug Fixes

* **tests:** Switch from phantomjs to headless chrome. ([b489972](https://github.com/atomictech/aurelia-collection/commit/b489972))



<a name="0.4.10"></a>
## [0.4.10](https://github.com/atomictech/aurelia-collection/compare/v0.4.9...v0.4.10) (2018-03-20)


### Bug Fixes

* **tests:** Fix tests. ([0d57392](https://github.com/atomictech/aurelia-collection/commit/0d57392))


### Features

* **build:** Build new package. ([5655e6c](https://github.com/atomictech/aurelia-collection/commit/5655e6c))
* **lint:** Update lint task and lint code. ([79fa2bb](https://github.com/atomictech/aurelia-collection/commit/79fa2bb))
* **references:** Add capability to handle a property path for refKeys instead of just a root property key. ([1cfd1ff](https://github.com/atomictech/aurelia-collection/commit/1cfd1ff))
* **syncFrom:** Change merge strategy for arrays, now replace all array with the new one. ([bf0caa6](https://github.com/atomictech/aurelia-collection/commit/bf0caa6))



<a name="0.4.9"></a>
## [0.4.9](https://github.com/atomictech/aurelia-collection/compare/v0.4.8...v0.4.9) (2018-01-30)


### Bug Fixes

* **collection:** added important option arg to fromJson call. was causing model to not update on a collection.all({force: true}) for example. ([6a51ffb](https://github.com/atomictech/aurelia-collection/commit/6a51ffb))



<a name="0.4.8"></a>
## [0.4.8](https://github.com/atomictech/aurelia-collection/compare/v0.4.7...v0.4.8) (2018-01-24)


### Features

* **collection:** added support for non json creation methods, like formData ([3e55896](https://github.com/atomictech/aurelia-collection/commit/3e55896))



<a name="0.4.7"></a>
## [0.4.7](https://github.com/atomictech/aurelia-collection/compare/v0.4.6...v0.4.7) (2017-12-18)


### Bug Fixes

* **collection:** added options to all() ([943df75](https://github.com/atomictech/aurelia-collection/commit/943df75))
* **lint:** Fix lint issues and eslint warning in vscode. ([2dcd5cd](https://github.com/atomictech/aurelia-collection/commit/2dcd5cd))
* **readme:** Fix documentation link. ([510961c](https://github.com/atomictech/aurelia-collection/commit/510961c))
* **test:** fixed coveralls task gulpfile path ([491418a](https://github.com/atomictech/aurelia-collection/commit/491418a))


### Features

* **collection:** Add `find()` method upon custom fields with a get url fallback mechanism. ([#11](https://github.com/atomictech/aurelia-collection/issues/11)) ([9a891e5](https://github.com/atomictech/aurelia-collection/commit/9a891e5))
* **collection:** added all method that force fetch all models of a collection ([5c5d902](https://github.com/atomictech/aurelia-collection/commit/5c5d902))



<a name="0.4.6"></a>
## [0.4.6](https://github.com/atomictech/aurelia-collection/compare/v0.4.5...v0.4.6) (2017-02-20)


### Bug Fixes

* **test:** Use of StageComponent to ensure aurelia’s framework is loaded as expected. ([1ee3427](https://github.com/atomictech/aurelia-collection/commit/1ee3427))
* **update:** Fix mergeStrategy detection. ([ab6dbdb](https://github.com/atomictech/aurelia-collection/commit/ab6dbdb))
* **update:** remove useless fire&forget snippet ([526e77e](https://github.com/atomictech/aurelia-collection/commit/526e77e))


### Features

* **yarn:** added yarn lock file ([35b7c3c](https://github.com/atomictech/aurelia-collection/commit/35b7c3c))



<a name="0.4.5"></a>
## [0.4.5](https://github.com/atomictech/aurelia-collection/compare/v0.4.4...v0.4.5) (2017-02-19)


### Bug Fixes

* **update:** fixed update strategy and remove fireandforget, prefer strategy ignore ([7d06629](https://github.com/atomictech/aurelia-collection/commit/7d06629))



<a name="0.4.4"></a>
## [0.4.4](https://github.com/atomictech/aurelia-collection/compare/v0.4.3...v0.4.4) (2017-02-19)


### Features

* **update:** added merge strategy to handle merge from server ([9f1e61c](https://github.com/atomictech/aurelia-collection/commit/9f1e61c))
* **version:** release 0.4.4 ([ff2c5ac](https://github.com/atomictech/aurelia-collection/commit/ff2c5ac))



<a name="0.4.3"></a>
## [0.4.3](https://github.com/atomictech/aurelia-collection/compare/0.4.2...v0.4.3) (2017-02-11)


### Bug Fixes

* **collection:** replace _.omit with a delete to prevent crash. ([202274c](https://github.com/atomictech/aurelia-collection/commit/202274c))
* **test:** Removal of the ‘catch’ methods since it prevents tests from failing. ([fc7d386](https://github.com/atomictech/aurelia-collection/commit/fc7d386))



<a name="0.4.2"></a>
## [0.4.2](https://github.com/atomictech/aurelia-collection/compare/afebac8...0.4.2) (2017-02-09)


### Bug Fixes

* **#8:** fixed sync with merge instead of defaults. ([85a26b5](https://github.com/atomictech/aurelia-collection/commit/85a26b5))
* **all:** Addition of the fetch polyfill to fix issue in Safari. ([a51c028](https://github.com/atomictech/aurelia-collection/commit/a51c028))
* **all:** changed the way we use containers for invoke and plugin resolving. ([f80f152](https://github.com/atomictech/aurelia-collection/commit/f80f152))
* **all:** I forgot to add the built versions. ([a4df160](https://github.com/atomictech/aurelia-collection/commit/a4df160))
* **all:** Replace the ‘collection’ naming to service ([45c445c](https://github.com/atomictech/aurelia-collection/commit/45c445c)), closes [#5](https://github.com/atomictech/aurelia-collection/issues/5)
* **all:** Update of the built files. ([60da0e5](https://github.com/atomictech/aurelia-collection/commit/60da0e5))
* **build:** Addition of the updated built files. ([bf6d029](https://github.com/atomictech/aurelia-collection/commit/bf6d029))
* **collection:** When a ‘get’ is done, do not propagate the route option for children. We need to find a proper solution to provide specific routes for children. ([dd59a5c](https://github.com/atomictech/aurelia-collection/commit/dd59a5c))
* **config:** Fixed renaming problem in registerService, and made test works. ([d8ed12d](https://github.com/atomictech/aurelia-collection/commit/d8ed12d))
* **config:** invert the defaultRoute and the service parameter since the latter is not optional unlike defaultRoute. ([b7ee127](https://github.com/atomictech/aurelia-collection/commit/b7ee127))
* **package:** jspmPackage was removed by accident. still not a true npm package yet. ([e1a1a94](https://github.com/atomictech/aurelia-collection/commit/e1a1a94))
* **package:** removed fetch github dependency ([719bdb4](https://github.com/atomictech/aurelia-collection/commit/719bdb4))
* **package:** setting jspm registry to npm ([9323666](https://github.com/atomictech/aurelia-collection/commit/9323666))
* **package.json:** added jspmPackage flag back again. ([1417516](https://github.com/atomictech/aurelia-collection/commit/1417516))
* **package.json:** added jspmPackage flag back again. ([42510f1](https://github.com/atomictech/aurelia-collection/commit/42510f1))
* **package.json:** fixed repo migration and jspmPackage flag ([c03bb4a](https://github.com/atomictech/aurelia-collection/commit/c03bb4a))
* **package.json:** jspmPackage was removed by error. ([55d774f](https://github.com/atomictech/aurelia-collection/commit/55d774f))
* **readme:** warn work in progress in readme ([76a4c49](https://github.com/atomictech/aurelia-collection/commit/76a4c49))
* **service:** added missing import from fetch-client ([f012527](https://github.com/atomictech/aurelia-collection/commit/f012527))
* **service:** added optional additional route for create and destroy url ([48d7eef](https://github.com/atomictech/aurelia-collection/commit/48d7eef))
* **service:** added options to sync, to allow populated sync ([378b762](https://github.com/atomictech/aurelia-collection/commit/378b762))
* **service:** destroy route should contain the id of the model to delete. ([0e425b5](https://github.com/atomictech/aurelia-collection/commit/0e425b5))
* **service:** Do not add the id when the route additional parameter is provided. ([e5d40e0](https://github.com/atomictech/aurelia-collection/commit/e5d40e0))
* **service:** don’t do the item key replacement if backend key and frontend key are the same. ([4730912](https://github.com/atomictech/aurelia-collection/commit/4730912))
* **service:** fixed collection key in Service.get() ([ecca4c3](https://github.com/atomictech/aurelia-collection/commit/ecca4c3))
* **service:** fixed exist test in get() ([09cc226](https://github.com/atomictech/aurelia-collection/commit/09cc226))
* **service:** fixed refKeys() typo ([d8516af](https://github.com/atomictech/aurelia-collection/commit/d8516af))
* **service:** Fixed update method, we need to explitely set resetd attribute to null for them to be transfered to the backend, otherwise undefined values are filtered in HTTP PUT. ([f6fe4f9](https://github.com/atomictech/aurelia-collection/commit/f6fe4f9))
* **service:** Fixes the previous commit (where childrenItems would not be set if keys are equal). ([b7d8cdc](https://github.com/atomictech/aurelia-collection/commit/b7d8cdc))
* **service:** FromJSON return null instead of crashing if no data passed, and get trim null or undefined value from it's child list ([16fb4dd](https://github.com/atomictech/aurelia-collection/commit/16fb4dd))
* **service:** Having an empty array is not considered as an error or an unwanted value but a settable value. ([2a7df49](https://github.com/atomictech/aurelia-collection/commit/2a7df49))
* **service:** Invert the modelClass and defaultRoute parameters since the first one is not optional, unlike the second one. ([80a3843](https://github.com/atomictech/aurelia-collection/commit/80a3843))
* **service:** missing params in create ([fcc1919](https://github.com/atomictech/aurelia-collection/commit/fcc1919))
* **service:** removed model argument from refKey method and changed return type ([892093b](https://github.com/atomictech/aurelia-collection/commit/892093b))
* **service:** sync method can now handle id or model ([66def66](https://github.com/atomictech/aurelia-collection/commit/66def66))
* **service:** trim null value from child array was not working ([c12e443](https://github.com/atomictech/aurelia-collection/commit/c12e443))
* **service:** use of the APi instead of using the members directly. ([3975739](https://github.com/atomictech/aurelia-collection/commit/3975739))
* **test:** fixed test, and included aurelia in config to ensure DI is instancied. ([251d10b](https://github.com/atomictech/aurelia-collection/commit/251d10b))
* **test:** updated dependencies and package json to fix test, passing on windows/node 6.9.0 ([41b656b](https://github.com/atomictech/aurelia-collection/commit/41b656b))


### Features

* **all:** Added Collection resolver, Service and Config classes for a basic implementation ([afebac8](https://github.com/atomictech/aurelia-collection/commit/afebac8))
* **all:** Added dependency injection availability in services and model classes by using aurelia container for instanciation ([82e7795](https://github.com/atomictech/aurelia-collection/commit/82e7795))
* **all:** Fixed collection for proper initialization ([48b35bc](https://github.com/atomictech/aurelia-collection/commit/48b35bc))
* **all:** renamed Service into Collection, and Collection resolver into UseCollection resolver ([0e6364d](https://github.com/atomictech/aurelia-collection/commit/0e6364d))
* **all:** renaming files due to classname changes. ([d50a822](https://github.com/atomictech/aurelia-collection/commit/d50a822))
* **all:** WIP. broken tests, changed registerCollection API and started to work on multiple Collection class instanciation with invoke(). ([5df0f96](https://github.com/atomictech/aurelia-collection/commit/5df0f96))
* **collection:** ‘get’ method can have an optional route parameter to overload the default’s. ([833b486](https://github.com/atomictech/aurelia-collection/commit/833b486))
* **collection:** Changed create() route argument behavior, it is now overriding defaultRoute insteand of appending route fragment to defaultRoute. ([943d503](https://github.com/atomictech/aurelia-collection/commit/943d503))
* **collection:** renamed service file into collection. ([08d464b](https://github.com/atomictech/aurelia-collection/commit/08d464b))
* **collection:** Update can take an optional parameter, the route. ([94093f4](https://github.com/atomictech/aurelia-collection/commit/94093f4))
* **collection:** Use of an ‘options’ object for optional parameters of main functions (get, update, destroy, create). ([cf75da9](https://github.com/atomictech/aurelia-collection/commit/cf75da9))
* **models:** Added factory creation of the models, to allow inject in the models classes ([8629064](https://github.com/atomictech/aurelia-collection/commit/8629064))
* **renaming:** renamed all files and api according to class name changes. ([84e9813](https://github.com/atomictech/aurelia-collection/commit/84e9813))
* **resolver:** renamed resolver class file. ([b5d44e0](https://github.com/atomictech/aurelia-collection/commit/b5d44e0))
* **service:** It is now possible to not have a dedicated model class, and use literal object instead (without collection). It is useful for backend to frontend key conversion. ([8c29650](https://github.com/atomictech/aurelia-collection/commit/8c29650))
