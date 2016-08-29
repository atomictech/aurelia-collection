import _ from 'lodash';

export let ModelFactory = class ModelFactory {
  create(data) {
    return _.cloneDeep(data);
  }
};