import { Aurelia } from 'aurelia-framework';
import { Collection } from './collection'
import { Service } from './service'
import { Config } from './config';

export function configure(aurelia, configCallback) {
  let config = aurelia.container.get(Config);

  configCallback(config);
}

export {
  Collection,
  Service,
  Config
};
