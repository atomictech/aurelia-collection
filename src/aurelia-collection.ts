import { FrameworkConfiguration } from 'aurelia-framework';
import { Repository } from './repository';

export function configure(
  aurelia: FrameworkConfiguration,
  configurationFunction: (repository: Repository) => void
) {
  if (!configurationFunction || {}.toString.call(configurationFunction) !== '[object Function]') {
    throw new Error('configurationFunction must be provided and be a fucntion');
  }

  let repo: Repository = aurelia.container.get(Repository);
  configurationFunction(repo);
}

export * from './use-collection';
export * from './collection';
export * from './repository';
export * from './entities/model';
export * from './entities/schema';
export * from './transporters/transporter';
export * from './transporters/fetch-transporter';
