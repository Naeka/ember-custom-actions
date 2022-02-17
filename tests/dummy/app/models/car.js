import Model from '@ember-data/model';
import { customAction } from '@naeka/ember-custom-actions';

export default class Car extends Model {
  drive = customAction('drive');
  clean = customAction('clean');
  fix = customAction('fix');

  moveAll = customAction('move-all');
  cleanAll = customAction('clean-all');
  fixAll = customAction('fixAll');
}
