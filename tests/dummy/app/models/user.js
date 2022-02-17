import Model from '@ember-data/model';
import { attr } from '@ember-data/model';
import { modelAction } from '@naeka/ember-custom-actions';

export default class Bike extends Model {
  @attr() name;

  profile = modelAction('profile', {
    responseType: 'object',
    method: 'get',
  });
}
