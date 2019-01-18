import { normalize, schema } from 'normalizr';

export class Entity {
  public static getSchema() {
    return Entity.schema;
  }

  normalize(): any {
    return normalize();
  }
}
