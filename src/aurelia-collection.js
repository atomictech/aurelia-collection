import 'fetch';
import { Collection } from './collection';
import { Service } from './service';
import { Config } from './config';

/**
 * Function called automatically by aurelia
 * @param  {Aurelia} aurelia : The aurelia object.
 * @param  {Function} configCallback : the function provided when using aurelia.plugin()
 */
export function configure(aurelia, configCallback) {
  let config = aurelia.container.get(Config);

  if (configCallback !== undefined && typeof(configCallback) === 'function') {
    configCallback(config);
  }
}

export {
  Collection,
  Service,
  Config
};
