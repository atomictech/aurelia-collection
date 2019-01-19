import { normalize, schema } from 'normalizr';

export interface ISchema {
  declare(): any;
  identifier(): string;
}

interface NormalizedData {
  entities: any;
  result: any;
}

/**
 *
 *
 * @export
 * @abstract
 * @class SchemaBase
 */
export abstract class SchemaBase implements ISchema {
  private normalizrEntity: schema.Entity;

  constructor() {
    this.normalizrEntity = this.buildSchema();
  }

  // ---------------------------------------------------------------------------
  // PUBLIC API (to implement)
  // ---------------------------------------------------------------------------
  /**
   * declare the types of nested schema attributes
   *
   * @returns {*}
   * @memberof SchemaBase
   */
  declare(): any {
    return undefined;
  }

  /**
   * Unique schema name and identifier
   *
   * @abstract
   * @returns {string}
   * @memberof SchemaBase
   */
  abstract identifier(): string;

  // ---------------------------------------------------------------------------
  // PUBLIC API
  // ---------------------------------------------------------------------------
  /**
   * Normalize raw json data
   *
   * @param {*} data
   * @returns {NormalizedData}
   * @memberof SchemaBase
   */
  normalize(data: any): NormalizedData {
    return normalize(data, this.normalizrEntity);
  }

  // ---------------------------------------------------------------------------
  // PRIVATE API
  // ---------------------------------------------------------------------------
  /**
   * Build the normalizr entity from this schema structure
   *
   * @private
   * @returns {schema.Entity}
   * @memberof SchemaBase
   */
  private buildSchema(): schema.Entity {
    return new schema.Entity(this.identifier(), this.declare());
  }
}
