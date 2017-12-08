<p align="center">
    <a href="https://travis-ci.org/atomictech/aurelia-collection" align="center"><img src="https://travis-ci.org/atomictech/aurelia-collection.svg?branch=master"></a>&nbsp;&nbsp;
    <a href="https://coveralls.io/github/atomictech/aurelia-collection?branch=master"><img src="https://coveralls.io/repos/github/atomictech/aurelia-collection/badge.svg?branch=master"></a>&nbsp;&nbsp;
    <a href="https://www.npmjs.com/package/aurelia-collection"><img src="https://img.shields.io/npm/v/aurelia-collection.svg"></a>&nbsp;&nbsp;
    <a href="https://raw.githubusercontent.com/atomictech/aurelia-collection/master/LICENSE" alt="License"><img src="https://img.shields.io/badge/license-MIT-blue.svg"></a>&nbsp;&nbsp;
</p>

# aurelia-collection

> This library is a plugin for the [Aurelia](http://www.aurelia.io/) platform and provide a simple way to store multiple set of models that can be retrieved (or pushed) to a backend collections and its REST api.

Have you ever felt that you were writting the exact same code in your view-models to fetch objects from your backend ?

aurelia-collection aims to avoid this, by providing both a REST service-like functionnality that can wrap your backend API, and a repository collection functionnality that will store and sync the objects (or model instances) you fetch from your backend. This will also reduce the number of HTTP requests your application use when changing route and activating new view-models, since object fetched are stored outside of your model-views scopes.

aurelia-collection provide a standard service behavior that can be used for most of the classic use-cases, but this behavior can simply be enriched with custom service behavior through inheritance.

The pluing itself can handle multiple collections at the same time, that themselves handle object literals or custom Model classes instances. It provide a Collection resolver to simply inject your different collections instances where you need them.

## Documentation

You can find the complete API documentation at [aurelia-collection-doc](https://aurelia-collection.readme.io).

There also is a sample repository that show how to use aurelia-collection plugin in advanced use cases at [aurelia-collection-sample](http://github.com/atomictech/aurelia-collection-sample/).

## Installation

Run `jspm install aurelia-collection`

Add `aurelia-collection` to your desired bundle, in its section includes of `build/bundles.js`

## Usage

### Configuration

Collections must be registred and configured at plugin loading time. 
You can configure each collection to:
* Give it a unique key that is used to inject the collection where you need it (see Using a Collection)
* Address a specific api on your endpoint
* Specify the type of model class your collection is going to handle
* the unique id property name of your model object

#### Basic configuration

```js
aurelia.use
   /* Your other plugins and init code */
   .plugin('aurelia-collection', config => {
    // will handle object literals with a provided Collection class instance, 
    // that use '/api/SomeBasic/' as API default route.
    config.registerCollection('SomeBasic');
   });
```

#### Configuration with custom Collection implementation and custom Model class

```js
import {SomeModel} from '/path/to/your/implementation.model';
import {SomeCollection} from '/path/to/your/implementation.collection';

aurelia.use
   /* Your other plugins and init code */
   .plugin('aurelia-collection', config => {
     const someCollection = aurelia.container.get(SomeCollection);
     
     config.registerCollection('Some', someCollection, 'api/some/', SomeModel);
   });
```

### Using a Collection

Collections can be injected where you need them.

```js
import {inject} from 'aurelia-framework';
import {UseCollection} from 'aurelia-collection';

@inject(UseCollection.of('Some'))
export class MyClass {
  constructor(someCollection) {
    this.someCollection = someCollection;
  }
  
  activate() {
    this.someCollection.get('modelUniqueID')
    .then(model => {
      // do something with your model.
    })
    .catch(console.error);
  }
```

### Implementing your own Collection

If you need to go beyond our classic Collection implementation that get|update|sync your models, you simply can declare your own Collection class that inherits the plugin class. You only need to implement these interfaces :

```js
class MyCollection extends Collection {
  isComplete(model) {
    // optionnaly return a boolean, to tell if the provided model has all its field populated.
  }
  
  refKeys() {
    // optionnaly return an array that describe the mapping between model backend attribute names and frontend attribute names.
  }
  
  /* your methods that do specific collection manipulations here */
  
}
```

## Collection API overview 

Here is a quick api overview of the Collection class. More can be found in the complete [documentation](https://aurelia-collection.readme.io).

```js
Collection
  .fromJSON(data, options)
  .toJSON(model, options)
  .isComplete(model)
  .flush
  .refKeys
  .create
  .destroy
  .get
  .sync
  .update
```
