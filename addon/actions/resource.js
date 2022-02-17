import Action from './action';
import deepMerge from '../utils/deep-merge';

export default function (path, options = {}) {
  return function (payload = {}, actionOptions = {}) {
    actionOptions.data = payload;

    return new Action({
      id: path,
      model: this,
      options: deepMerge({}, options, actionOptions),
    }).callAction();
  };
}
