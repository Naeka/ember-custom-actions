import Model from '@ember-data/model';
import { attr } from '@ember-data/model';
import { modelAction, resourceAction } from '@naeka/ember-custom-actions';

export default class Post extends Model {
  @attr() name;
  @attr('boolean', { defaultValue: false }) published;

  publish = modelAction('publish', {
    responseType: 'object',
  });

  list = resourceAction('list');

  search = resourceAction('search', {
    method: 'GET',
    normalizeOperation: 'dasherize',
    queryParams: { showAll: true },
    headers: { testHeader: 'ok' },
  });
}
