<p align="center">
    <a href="https://travis-ci.org/atomictech/aurelia-collection" align="center"><img src="https://travis-ci.org/atomictech/aurelia-collection.svg?branch=master"></a>&nbsp;&nbsp;
    <a href="https://coveralls.io/github/atomictech/aurelia-collection?branch=master"><img src="https://coveralls.io/repos/github/atomictech/aurelia-collection/badge.svg?branch=master"></a>&nbsp;&nbsp;
    <a href="https://www.npmjs.com/package/aurelia-collection"><img src="https://img.shields.io/npm/v/npm.svg"></a>&nbsp;&nbsp;
    <a href="https://raw.githubusercontent.com/atomictech/aurelia-collection/master/LICENSE" alt="License"><img src="https://img.shields.io/badge/license-MIT-blue.svg"></a>&nbsp;&nbsp;
</p>

# aurelia-collection

> This library is a plugin for the [Aurelia](http://www.aurelia.io/) platform and provide a simple way to store multiple set of models that can be retrieved (or pushed) to a backend collections and its REST api.

Have you ever felt that you were writting the exact same code in your view-models to fetch objects from your backend ?

aurelia-collection aims to avoid this, by providing both a Service functionnality that can wrap your backend API, and a repository collection functionnality that will store and sync the objects (or model classes) you fetch from your backend. This will also reduce the number of HTTP requests you need to do when changing route and activating new view-models, since object fetched are stored outside of your model-views scopes.

aurelia-collection provide a generic Service that can be used for standard use-cases, but that can simply be inherited to add your custom service behavior. It can also handle object literal or your custom Model classes.

The pluing itself can handle unlimited number of different collections that themselves handle differents types of objects.

## Documentation

You can find the complete API documentation at [aurelia-collection-doc](http://aurelia-collection-doc.atomictech.io).

There also is a sample repository that show how to use aurelia-collection plugin in advanced use cases at [aurelia-collection-sample](http://github.com/atomictech/aurelia-collection-sample/).

## Instalattion

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

```js
import {SomeModel} from '/path/to/your/implementation.model';
import {SomeService} from '/path/to/your/implementation.service';

aurelia.use
   /* Your other plugins and init code */
   .plugin('aurelia-collection', config => {
     const someService = aurelia.container.get(SomeService);
     
     config.registerService('Some', someService, 'api/some/', SomeModel);
   });
```

### Using a Collection

Collections can be injected where you need them.

```js
import {inject} from 'aurelia-framework';
import {Collection} from 'aurelia-collection';

@inject(Collection.of('Some'))
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

## Collection API overview 
