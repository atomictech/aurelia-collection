import { inject } from 'aurelia-dependency-injection';
import { Collection } from '../../../src/collection';

@inject(Collection.of('fake'))
export class InjectTest {
  constructor(myService) {
    this.myService = myService;
  }
}
