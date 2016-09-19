import { configure } from '../../src/aurelia-collection';

describe('testing aurelia configure routine', () => {
  let frameworkConfig;

  beforeEach(() => {
    frameworkConfig = {
      globalResources: () => {

      },
      container: {
        registerInstance: (type, instance) => {

        },
        get: (type) => {
          return new type();
        }
      }
    };
  });

  it('should export configure function', () => {
    expect(typeof configure).toBe('function');
  });

  it('should accept a setup callback passing back the instance', done => {
    let foo = {
      bar: instance => {
        expect(typeof instance).toBe('object');
        done();
      }
    };
    spyOn(foo, 'bar').and.callThrough();

    configure(frameworkConfig, foo.bar);
    expect(callback).toHaveBeenCalledOnce();
  });

  it('should throw custom error message if no callback is provided', () => {
    expect(() => { configure(frameworkConfig); })
      .toThrow('You need to provide a callback method to properly configure the library');
  });
});
