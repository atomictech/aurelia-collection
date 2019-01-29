import { Container } from 'aurelia-dependency-injection';
import { Store } from 'aurelia-store';

import { IConstructor } from './helpers';
import { ITransporter } from './transporters/transporter';
import { FetchTransporter } from './transporters/fetch-transporter';
import { Model } from './entities/model';
import { ISchema, SchemaBase } from './entities/schema';

// export interface ICollection<S extends ISchema> {
export interface ICollection {
  // configure(key: string, SchemaClass: IConstructor<S>, baseUrl?: string, modelid?: string): void;
  fromJSON(data: any): any;
  toJSON(model: Model): any;
  flush(): void;
  isComplete(): boolean;
  setTransporter(transporter: ITransporter): void;
}

export class Collection<S extends SchemaBase> implements ICollection {
  //----------------------------------------------------------------------------
  //#region members
  /**
   *
   *
   * @protected
   * @type {ITransporter}
   * @memberof Collection
   */
  protected transporter?: ITransporter;

  /**
   *
   *
   * @protected
   * @type {S}
   * @memberof Collection
   */
  protected schema: S;

  /**
   *
   *
   * @protected
   * @type {string}
   * @memberof Collection
   */
  protected baseUrl: string;

  /**
   *
   *
   * @protected
   * @type {string}
   * @memberof Collection
   */
  protected modelid: string;

  /**
   *
   *
   * @protected
   * @type {Model[]}
   * @memberof Collection
   */
  protected models: Model[];
  //#endregion
  //----------------------------------------------------------------------------

  //----------------------------------------------------------------------------
  //#region public-api
  constructor() {
  }

  /**
   * This is sparta
   *
   * @param {string} key
   * @param {IConstructor<S>} SchemaClass
   * @param {string} [baseUrl]
   * @param {string} [modelid]
   * @memberof Collection
   */
  configure(key: string, SchemaClass: IConstructor<S>, baseUrl?: string, modelid?: string) {
    if (!this.transporter) {
      this.setTransporter(Container.instance.get(FetchTransporter));
    }

    if (!baseUrl) {
      baseUrl = `/api/${key}/`;
    }

    this.schema = Container.instance.invoke(SchemaClass);
    this.baseUrl = baseUrl;
    this.modelid = modelid ? modelid : '_id';
    this.models = [];
  }

  /**
   *
   *
   * @param {ITransporter} transporter
   * @memberof Collection
   */
  setTransporter(transporter: ITransporter): void {
    this.transporter = transporter;
  }

  /**
   *
   *
   * @memberof Collection
   */
  flush(): void {
    this.models = [];
  }

  /**
   *
   *
   * @param {*} data
   * @returns {Model}
   * @memberof Collection
   */
  // fromJSON(data: any): Promise<Model> {
  //   let model = Container.instance.invoke(Model, data);
  //   return model;
  // }

  // toJSON(model: Model) {}

  // isComplete(): boolean {
  //   return true;
  // }
  //#endregion
  //----------------------------------------------------------------------------
}
