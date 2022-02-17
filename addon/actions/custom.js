import Action from './action';
import deepMerge from '../utils/deep-merge';

export default function (id, options = {}) {
  return function (payload = {}, actionOptions = {}) {
    actionOptions.data = payload;

    return new Action({
      id,
      model: this,
      integrated: true,
      options: deepMerge({}, options, actionOptions),
    }).callAction();
  };
}
