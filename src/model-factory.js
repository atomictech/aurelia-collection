import _ from 'lodash';

export class ModelFactory {
  create(data) {
    return _.cloneDeep(data);
  }
}
