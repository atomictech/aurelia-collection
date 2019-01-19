import { normalize, schema } from 'normalizr';

export class Model {
  public static getSchema() {
    return Model.schema;
  }

  normalize(): any {
    return normalize();
  }
}
