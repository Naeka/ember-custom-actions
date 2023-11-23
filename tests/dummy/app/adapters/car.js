import JSONAPIAdapter from '@ember-data/adapter/json-api';
import { withCustomActions } from '@naeka/ember-custom-actions';

@withCustomActions
class CustomActionsJSONAPIAdapter extends JSONAPIAdapter {}

export default class CarAdapter extends CustomActionsJSONAPIAdapter {
  urlForCustomAction(modelName, id, requestType) {
    const suffix = '';
    if (requestType === 'clean') {
      let baseUrl = this.buildURL(modelName, id, requestType);
      return `${baseUrl}/custom-clean`;
    } else if (requestType === 'fix') {
      return `/custom-cars/${id}/custom-fix${suffix}`;
    } else if (requestType === 'clean-all') {
      let baseUrl = this.buildURL(modelName, id, requestType);
      return `${baseUrl}/custom-clean-all`;
    } else if (requestType === 'fixAll') {
      return `/custom-cars/custom-fix-all${suffix}`;
    }

    return super.urlForCustomAction(...arguments);
  }

  methodForCustomAction({ actionId }) {
    if (actionId === 'clean') {
      return 'PATCH';
    }
    return super.methodForCustomAction(...arguments);
  }

  headersForCustomAction({ actionId }) {
    if (actionId === 'clean') {
      return {
        myHeader: 'custom header',
      };
    }
    return super.headersForCustomAction(...arguments);
  }

  dataForCustomAction({ actionId }) {
    if (actionId === 'clean') {
      return {
        customParam: 'custom param',
      };
    }
    return super.dataForCustomAction(...arguments);
  }
}
