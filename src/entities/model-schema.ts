import { SchemaBase } from './schema';

export class ModelSchema extends SchemaBase {
  declare(): any {
    return {};
  }

  identifier(): string {
    return 'Model';
  }
}
