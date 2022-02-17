import Model from '@ember-data/model';
import { attr } from '@ember-data/model';
import { resourceAction } from '@naeka/ember-custom-actions';

export default class Bridge extends Model {
  @attr() name;

  burnAll = resourceAction('burn', {
    method: 'GET',
  });
}
