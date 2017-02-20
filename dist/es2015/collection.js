import _ from 'lodash';

import { Container } from 'aurelia-dependency-injection';
import { json } from 'aurelia-fetch-client';

import { Config } from './config';

export let Collection = class Collection {
  configure(key, modelClass, defaultRoute, modelid = '_id') {
    this.container = Container.instance;

    if (_.isUndefined(defaultRoute)) {
      defaultRoute = '/api/' + key + '/';
    }

    this.modelid = modelid;
    this.defaultRoute = defaultRoute;
    this.modelClass = modelClass;
    this.collection = [];

    this._httpClient = null;
  }

  fromJSON(data, options) {
    if (_.isNil(data)) {
      return Promise.resolve(null);
    }

    options = _.defaults(options, {
      ignoreCollection: false,
      force: false
    });

    let model = this._getFromCollection(data[this.modelid]);

    if (_.isUndefined(model)) {
      model = this.container.invoke(this.modelClass, data);

      if (!options.ignoreCollection) {
        this.collection.push(model);
      }
    } else if (!this.isComplete(model) || options.force) {
      this._syncFrom(model, data);
    }
    return Promise.resolve(model);
  }

  toJSON(model, options) {
    return _.isFunction(model.toJSON) ? model.toJSON() : model;
  }

  flush() {
    this.collection = [];
  }

  isComplete(model) {
    return true;
  }

  sync(model, options) {
    return this.get(_.isString(model) ? model : model[this.modelid], _.merge({}, options, { force: true }));
  }

  refKeys() {
    return [];
  }

  _setHttpClient(httpClient) {
    this._httpClient = httpClient;
  }

  _syncFrom(model, data) {
    _.merge(model, data);
  }

  _getFromCollection(id) {
    let obj = {};
    obj[this.modelid] = id;
    return _.find(this.collection, obj);
  }

  _removeFromCollection(id) {
    let obj = {};
    obj[this.modelid] = id;
    _.remove(this.collection, obj);
  }

  _getById(id, options) {
    const opts = options || {};
    const apiRoute = opts.route || this.defaultRoute + id;
    let model = this._getFromCollection(id);

    if (_.isUndefined(model) || !this.isComplete(model) || opts.force) {
      return this._httpClient.fetch(apiRoute).then(response => response.json()).then(data => {
        return this.fromJSON(data, { force: opts.force });
      });
    }

    return Promise.resolve(model);
  }

  create(jsonModel, options) {
    const opts = options || {};
    const apiRoute = opts.route || this.defaultRoute.slice(0, -1);

    return this._httpClient.fetch(apiRoute, {
      method: 'post',
      body: json(jsonModel)
    }).then(response => response.json()).then(data => this.get(data));
  }

  destroy(id, options) {
    const opts = options || {};
    const apiRoute = opts.route || this.defaultRoute + id;

    this._removeFromCollection(id);
    return this._httpClient.fetch(apiRoute, {
      method: 'delete'
    }).then(response => response.json());
  }

  get(data, options) {
    options = _.defaults(options, {
      _child: false,
      force: false,
      recursive: false,
      populate: false
    });

    let modelPromise = null;

    if (_.isEmpty(data) || _.isUndefined(data)) {
      return Promise.resolve(data);
    } else if (_.isArray(data)) {
      return modelPromise = Promise.all(_.map(data, item => this.get(item, options)));
    } else if (_.isObject(data)) {
      modelPromise = this.fromJSON(data);
    } else {
      if (!options._child) {
        modelPromise = this._getById(data, options);
      } else {
        if (options.populate === true) {
          modelPromise = this._getById(data, options);
        } else {
          modelPromise = Promise.resolve(null);
        }
      }
    }

    return modelPromise.then(model => {
      if (_.isNil(model)) {
        return model;
      }

      let childOpt = _.cloneDeep(options);

      delete childOpt.route;

      if (childOpt._child) {
        childOpt.populate = childOpt.recursive = childOpt.recursive === true;
      }
      childOpt._child = true;

      return Promise.all(_.map(this.refKeys(model), item => {
        item = _.defaults(item, {
          backendKey: null,
          collection: null,
          frontendKey: null,
          backendKeyDeletion: true
        });

        let collection = this.container.get(Config).getCollection(item.collection);
        if (_.isNil(item.backendKey)) {
          return;
        }

        if (_.isNil(item.frontendKey)) {
          item.frontendKey = item.backendKey;
        }

        let itemData = model[item.backendKey];

        let itemDataPromise = Promise.resolve(null);

        if (_.isNull(item.collection)) {
          itemDataPromise = Promise.resolve(itemData);
        } else if (!_.isNil(collection)) {
          itemDataPromise = collection.get(itemData, childOpt);
        }

        return itemDataPromise.then(childrenItems => {
          if (!_.isNil(childrenItems) && isNotNullArray(childrenItems)) {
            if (item.backendKeyDeletion === true) {
              delete model[item.backendKey];
            }

            return model[item.frontendKey] = _.pull(childrenItems, null, undefined);
          }
        });
      })).then(() => model);
    });
  }

  update(model, attr, options) {
    const opts = options || {};
    const apiRoute = opts.route || this.defaultRoute + model[this.modelid];

    return this._frontToBackend(attr, opts).then(backAttr => {
      return this._httpClient.fetch(apiRoute, {
        method: 'put',
        headers: { 'Content-Type': 'application/json' },
        body: json(backAttr)
      }).then(response => response.json()).then(attributes => this._backToFrontend(attributes, backAttr, model, opts));
    }).then(() => model);
  }

  _frontToBackend(attributes, options) {
    const refKeys = this.refKeys();

    let _getIdFromData = data => {
      if (_.isString(data)) {
        return data;
      } else if (_.isArray(data)) {
        return _.map(data, _getIdFromData);
      } else if (_.isObject(data)) {
        return data[this.modelid];
      }
      return null;
    };

    _.each(attributes, (value, field) => {
      let item = _.find(refKeys, { frontendKey: field });

      if (_.isUndefined(item)) {
        return;
      }

      item = _.defaults(item, {
        backendKey: null,
        frontendKey: null,
        backendKeyDeletion: true
      });

      if (item.backendKeyDeletion) {
        delete attributes[item.frontendKey];
      }

      let id = _getIdFromData(value);
      attributes[item.backendKey] = _.isUndefined(id) ? null : id;
    });

    return Promise.resolve(attributes);
  }

  _backToFrontend(attributes, backAttr, model, options) {
    const opts = options || {};
    const refKeys = this.refKeys();

    return Promise.all(_.map(backAttr, (value, field) => {
      let frontendKey = field;
      let backendKey = field;
      let frontendValue = Promise.resolve(attributes[backendKey]);

      let item = _.find(refKeys, { backendKey: field });
      if (!_.isUndefined(item)) {
        item = _.defaults(item, {
          backendKey: null,
          frontendKey: null,
          collection: null,
          backendKeyDeletion: true
        });

        frontendKey = item.frontendKey;
        backendKey = item.backendKey;

        if (!_.isNull(item.collection)) {
          frontendValue = this.container.get(Config).getCollection(item.collection).get(attributes[backendKey]);
        }
      }

      return frontendValue.then(result => {
        if (!_.has(opts, 'mergeStrategy') || opts.mergeStrategy === 'replace') {
          model[frontendKey] = result;
        } else if (opts.mergeStrategy === 'ignore') {
          return Promise.resolve(model);
        } else if (opts.mergeStrategy === 'array') {
          if (_.isArray(model[frontendKey])) {
            model[frontendKey] = _.union(model[frontendKey], result);
          } else {
            model[frontendKey] = result;
          }
        } else {
          model[frontendKey] = _.merge(model[frontendKey], result);
        }
        return Promise.resolve(model);
      });
    }));
  }

};

function isNotNullArray(arr) {
  return !_.isArray(arr) || _.isEmpty(arr) || _.some(arr, _.negate(_.isNil));
}