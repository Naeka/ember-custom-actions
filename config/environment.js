'use strict';

module.exports = function (_environment, appConfig) {
  appConfig.emberCustomActions = {
    method: 'POST',
    data: {},
    headers: {},
    queryParams: {},
    ajaxOptions: {},
    adapterOptions: {},
    pushToStore: false,
    responseType: null,
    normalizeOperation: '',
  };
  return {};
};
