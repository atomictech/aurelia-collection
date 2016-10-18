import { inject } from 'aurelia-dependency-injection';
import { UseCollection } from '../../../src/use-collection';

@inject(UseCollection.of('fake'))
export class InjectTest {
  constructor(myCollection) {
    this.myCollection = myCollection;
  }
}
