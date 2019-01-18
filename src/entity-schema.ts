import { SchemaBase } from './schema';

export class EntitySchema extends SchemaBase {
  declare(): any {
    return {};
  }

  identifier(): string {
    return 'Entity';
  }
}
