import JSONAPIAdapter from '@ember-data/adapter/json-api';
import { withCustomActions } from '@naeka/ember-custom-actions';

@withCustomActions
class CustomActionsJSONAPIAdapter extends JSONAPIAdapter {}

export default class BikeAdapter extends CustomActionsJSONAPIAdapter {}
