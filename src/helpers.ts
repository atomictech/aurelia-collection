export interface IConstructor<T> {
  new (...args: any[]): T;

  // Or enforce default constructor
  // new (): T;
}
