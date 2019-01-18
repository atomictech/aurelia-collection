import { normalize, schema } from 'normalizr';

interface NormalizedData {
  entities: any;
  result: any;
}

export abstract class SchemaBase {
  private normalizrEntity: schema.Entity;

  constructor() {
    this.normalizrEntity = this.buildSchema();
  }

  // ---------------------------------------------------------------------------
  // PUBLIC API (to implement)
  // ---------------------------------------------------------------------------
  declare(): any {
    return undefined;
  }
  abstract identifier(): string;

  // ---------------------------------------------------------------------------
  // PUBLIC API
  // ---------------------------------------------------------------------------
  normalize(data: any): NormalizedData {
    return normalize(data, this.normalizrEntity);
  }

  // ---------------------------------------------------------------------------
  // PRIVATE API
  // ---------------------------------------------------------------------------
  private buildSchema(): schema.Entity {
    return new schema.Entity(this.identifier(), this.declare());
  }
}
