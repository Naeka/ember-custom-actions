import urlBuilder from '../utils/url-builder';

export default function (target) {
  /**
   * @public
   * @method urlForCustomAction
   * @param {String} modelName
   * @param {(String|Null)} id single id null
   * @param {DS.Snapshot} snapshot single snapshot
   * @param {String} actionId name or relative path of the action
   * @param {Object} queryParams object of query parameters to send for query requests
   * @return {String} Full URL of custom action
   */
  target.prototype.urlForCustomAction = function (
    modelName,
    id,
    snapshot,
    actionId,
    queryParams
  ) {
    let url = this._buildURL(modelName, id);

    return urlBuilder(url, actionId, queryParams);
  };

  /**
   * @public
   * @method methodForCustomAction
   * @param {Object} params Contains method, modelId, actionId
   * @return {String} Full URL of custom action
   */
  target.prototype.methodForCustomAction = function ({ method }) {
    return method;
  };

  /**
   * @public
   * @method headersForCustomAction
   * @param {Object} params Contains headers, modelId, actionId
   * @return {Object} Custom action headers
   */
  target.prototype.headersForCustomAction = function ({ headers }) {
    return headers;
  };

  /**
   * @public
   * @method dataForCustomAction
   * @param {Object} params Contains data, modelId, actionId
   * @return {Object} Payload for custom action
   */
  target.prototype.dataForCustomAction = function ({ data }) {
    return data;
  };

  /**
   * @public
   * @method customRequest
   * @param {String} method Method of the request, eg: 'GET', 'POST' etc
   * @param {String} path Path of the request, eg. 'my/custom/endpoint'
   * @return {Promise} Response promise of the request
   */
  target.prototype.customRequest = function (method, path, options = {}) {
    let queryParams = options.queryParams || {};
    let ajaxOptions = options.ajaxOptions || {};

    let url = urlBuilder(this._buildURL(), path, queryParams);
    return this.ajax(url, method, ajaxOptions);
  };
}
