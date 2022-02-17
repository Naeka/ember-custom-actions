import { assert } from '@ember/debug';
import { isArray } from '@ember/array';
import { camelize } from '@ember/string';
import ArrayProxy from '@ember/array/proxy';
import ObjectProxy from '@ember/object/proxy';
import { getOwner } from '@ember/application';
import { typeOf as emberTypeOf } from '@ember/utils';
import PromiseProxyMixin from '@ember/object/promise-proxy-mixin';
import { cached } from '@glimmer/tracking';

import deepMerge from '../utils/deep-merge';
import normalizePayload from '../utils/normalize-payload';
import urlBuilder from '../utils/url-builder';

const promiseProxiesMapping = {
  array: ArrayProxy.extend(PromiseProxyMixin),
  object: ObjectProxy.extend(PromiseProxyMixin),
};

export default class Action {
  constructor(config) {
    assert(
      'Custom actions require model property to be passed !',
      config.model
    );
    assert(
      'Custom action model has to be persisted !',
      !(config.instance && !config.model.id)
    );

    this.id = config.id ?? '';
    this.model = config.model;
    this.instance = config.instance ?? false;
    this.integrated = config.integrated ?? false;
    this.options = config.options ?? {};
  }

  /**
   * @private
   * @return {DS.Store}
   */
  @cached
  get store() {
    return this.model.store;
  }

  /**
   * @private
   * @return {String}
   */
  @cached
  get modelName() {
    let { constructor } = this.model;
    return constructor.modelName || constructor.typeKey;
  }

  /**
   * @private
   * @return {DS.Adapter}
   */
  @cached
  get adapter() {
    return this.store.adapterFor(this.modelName);
  }

  /**
   * @private
   * @return {DS.Adapter}
   */
  @cached
  get serializer() {
    return this.store.serializerFor(this.modelName);
  }

  /**
   * @private
   * @return {Object}
   */
  @cached
  get config() {
    let appConfig =
      getOwner(this.model).resolveRegistration('config:environment')
        .emberCustomActions ?? {};
    return deepMerge({}, appConfig, this.options);
  }

  /**
   * @public
   * @method callAction
   * @return {Promise}
   */
  callAction() {
    let promise = this._promise();
    let responseType = camelize(this.config.responseType ?? '');
    let promiseProxy = promiseProxiesMapping[responseType];

    return promiseProxy ? promiseProxy.create({ promise }) : promise;
  }

  /**
   * @private
   * @method queryParams
   * @return {Object}
   */
  queryParams() {
    let queryParams = this.config.queryParams;

    assert(
      'Custom action queryParams option has to be an object',
      emberTypeOf(queryParams) === 'object'
    );
    return this.adapter.sortQueryParams(queryParams);
  }

  /**
   * @private
   * @method requestMethod
   * @return {String}
   */
  requestMethod() {
    let integrated = this.integrated && this.adapter.methodForCustomAction;
    let method = this.config.method.toUpperCase();

    return integrated ? this._methodForCustomAction(method) : method;
  }

  /**
   * @private
   * @method requestUrl
   * @return {String}
   */
  requestUrl() {
    let integrated = this.integrated && this.adapter.urlForCustomAction;
    return integrated ? this._urlForCustomAction() : this._urlFromBuilder();
  }

  /**
   * @private
   * @method requestHeaders
   * @return {String}
   */
  requestHeaders() {
    let integrated = this.integrated && this.adapter.headersForCustomAction;
    let configHeaders = this.config.headers;
    let headers = integrated
      ? this._headersForCustomAction(configHeaders)
      : configHeaders;
    assert(
      'Custom action headers option has to be an object',
      emberTypeOf(headers) === 'object'
    );
    return headers;
  }

  /**
   * @private
   * @method requestData
   * @return {Object}
   */
  requestData() {
    let integrated = this.integrated && this.adapter.dataForCustomAction;
    let payload = this.config.data;
    let data =
      (integrated ? this._dataForCustomAction(payload) : payload) || {};

    assert(
      'Custom action payload has to be an object',
      emberTypeOf(data) === 'object'
    );

    return normalizePayload(data, this.config.normalizeOperation);
  }

  /**
   * @private
   * @method ajaxOptions
   * @return {Object}
   */
  ajaxOptions() {
    return deepMerge({}, this.config.ajaxOptions, {
      data: this.requestData(),
      headers: this.requestHeaders(),
    });
  }

  // Internals

  _promise() {
    return this.adapter
      .ajax(this.requestUrl(), this.requestMethod(), this.ajaxOptions())
      .then(this._onSuccess.bind(this), this._onError.bind(this));
  }

  _onSuccess(response) {
    if (this.config.pushToStore && this._validResponse(response)) {
      let store = this.store;
      let modelClass = this.model.constructor;
      let modelId = this.model.id;
      let actionId = this.id;

      let documentHash = this.serializer.normalizeArrayResponse(
        store,
        modelClass,
        response,
        modelId,
        actionId
      );
      return this.store.push(documentHash);
    }

    return response;
  }

  _onError(error) {
    if (this.config.pushToStore && isArray(error.errors)) {
      let id = this.model.id;
      let typeClass = this.model.constructor;

      error.serializedErrors = this.serializer.extractErrors(
        this.store,
        typeClass,
        error,
        id
      );
    }

    return Promise.reject(error);
  }

  _validResponse(object) {
    return emberTypeOf(object) === 'object' && Object.keys(object).length > 0;
  }

  _urlFromBuilder() {
    let path = this.id;
    let queryParams = this.queryParams();
    let modelName = this.modelName;
    let id = this.instance ? this.model.id : null;
    let url = this.adapter._buildURL(modelName, id);

    return urlBuilder(url, path, queryParams);
  }

  // Adapter integration API

  _urlForCustomAction() {
    let id = this.model.id;
    let actionId = this.id;
    let queryParams = this.queryParams();
    let modelName = this.modelName;
    let adapterOptions = this.config.adapterOptions;
    let snapshot = this.model._internalModel.createSnapshot({
      adapterOptions,
    });

    return this.adapter.urlForCustomAction(
      modelName,
      id,
      snapshot,
      actionId,
      queryParams
    );
  }

  _methodForCustomAction(method) {
    let actionId = this.id;
    let modelId = this.model.id;

    return this.adapter.methodForCustomAction({
      method,
      actionId,
      modelId,
    });
  }

  _headersForCustomAction(headers) {
    let actionId = this.id;
    let modelId = this.model.id;

    return this.adapter.headersForCustomAction({
      headers,
      actionId,
      modelId,
    });
  }

  _dataForCustomAction(data) {
    let actionId = this.id;
    let modelId = this.model.id;
    let model = this.model;

    return this.adapter.dataForCustomAction({
      data,
      actionId,
      modelId,
      model,
    });
  }
}
