import { FrameworkConfiguration } from 'aurelia-framework';
import { Repository } from './repository';

export function configure(
  aurelia: FrameworkConfiguration,
  configurationFunction: (repository: Repository) => void
) {
  let repo: Repository = aurelia.container.get(Repository);
  configurationFunction(repo);
}

export * from './use-collection';
export * from './collection';
export * from './repository';
