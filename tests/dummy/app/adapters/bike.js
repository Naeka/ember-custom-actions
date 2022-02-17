import JSONAPIAdapter from '@ember-data/adapter/json-api';
import { AdapterMixin } from '@naeka/ember-custom-actions';

export default class BikeAdapter extends JSONAPIAdapter.extend(AdapterMixin) {}
