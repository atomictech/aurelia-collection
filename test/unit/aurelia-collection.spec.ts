import { Aurelia, Container, FrameworkConfiguration } from 'aurelia-framework';

import { configure, Repository } from '../../src/aurelia-collection';
import { TestSchema } from './helpers';

describe('aurelia setup', () => {
  it('should throw an exception if configurationFunction is not a function provided via options', () => {
    const cont = new Container();
    const aurelia: FrameworkConfiguration = cont.get(Aurelia);

    expect(aurelia.container.hasResolver(Repository)).toBe(true);
    expect(() => configure(aurelia, {})).toThrowError();
  });

  it('should configure the repository with a collection that are provided in the configuration function', () => {
    const cont = new Container();
    const aurelia: FrameworkConfiguration = cont.get(Aurelia);

    expect(aurelia.container.hasResolver(Repository)).toBe(true);

    configure(aurelia, repo => {
      repo.createCollection<TestSchema>('test');
    });

    let repo = aurelia.container.get(Repository);
    expect(repo).toBeDefined();
    expect(repo.collections.test).toBeDefined();
  });
});
