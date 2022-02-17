# ember-custom-actions

Ember Custom Actions is a package for defining custom API actions on models, dedicated for Ember 3.24 (and higher) applications.

## Compatibility

- Ember.js v3.24 or above
- Ember CLI v3.24 or above
- Node.js v12 or above

## Installation

```
ember install @naeka/ember-custom-actions
```

## Usage

### Model actions

To define custom action like: `posts/1/publish` you can use
`modelAction(path, options)` method with arguments:

- `path` - url of the action scoped to our api (in our case it's `publish`)
- `options` - optional parameter which will overwrite the configuration options

```js
import Model from '@ember-data/model';
import { customAction } from '@naeka/ember-custom-actions';

export class Book extends Model {
  publish = modelAction('publish', { pushToStore: false });
}
```

#### Usage

```js
let user = this.currentUser;
let postToPublish = this.store.findRecord('post', 1);
let payload = { publisher: user };

postToPublish
  .publish(payload /*{ custom options }*/)
  .then((status) => {
    alert(`Post has been: ${status}`);
  })
  .catch((error) => {
    console.log(
      'Here are your serialized model errors',
      error.serializedErrors
    );
  });
```

### Resource actions

To a define custom action like: `posts/favorites` you can use
`resourceAction(actionId/path, options)` method with arguments:

- `path` - url of the action scoped to our api (in our case it's `favorites`)
- `options` - optional parameter which will overwrite the configuration options

```js
import Model from '@ember-data/model';
import { resourceAction } from '@naeka/ember-custom-actions';

export class Book extends Model {
  favorites = resourceAction('favorites', { method: 'GET' });
}
```

#### Usage

```js
let user = this.currentUser;
let emptyPost = this.store.findRecord('post', 1);
let payload = { user };

emptyPost
  .favorites(payload /*{ custom options }*/)
  .then((favoritesPosts) => {
    console.log(favoritesPosts);
  })
  .finally(() => {
    emptyPost.deleteRecord();
  });
```

### Custom actions

To define `customAction` and customize it by using ember-data flow, adapters and serializer you can use `customAction(actionId, options)` method with arguments:

- `actionId` - id of the action which can be handled later on in adpaters and serializers
- `options` - optional parameter which will overwrite the configuration options

If you want to customize your request in your adapter please, implement our adapter decorator:

```js
import JSONAPIAdapter from '@ember-data/adapter/json-api';
import { withCustomActions } from '@naeka/ember-custom-actions';

@withCustomActions
export default class BookAdapter extends JSONAPIAdapter {}
```

Now you can customize following methods in the adpater:

- [urlForCustomAction](#urlForCustomAction)
- [dataForCustomAction](#dataForCustomAction)
- [methodForCustomAction](#methodForCustomAction)
- [headersForCustomAction](#headersForCustomAction)

#### urlForCustomAction

You can define your custom path for every `customAction` by adding a conditional:

```js
@withCustomActions
export default class BookAdapter extends JSONAPIAdapter {
  urlForCustomAction(modelName, id, snapshot, actionId, queryParams) {
    if (actionId === 'myPublishAction') {
      return 'https://my-custom-api.com/publish';
    }

    return super.urlForCustomAction(...arguments);
  }
}
```

If you would like to build custom `modelAction` you can do it by:

```js
@withCustomActions
export default class BookAdapter extends JSONAPIAdapter {
  urlForCustomAction(modelName, id, snapshot, actionId, queryParams) {
    if (requestType === 'myPublishAction') {
      return `${this._buildURL(modelName, id)}/publish`;
    }

    return super.urlForCustomAction(...arguments);
  }
});
```

#### methodForCustomAction

You can define your custom method for every `customAction` by adding a conditional:

```js
@withCustomActions
export default class BookAdapter extends JSONAPIAdapter {
  methodForCustomAction(params) {
    if (params.actionId === 'myPublishAction') {
      return 'PUT';
    }

    return super.methodForCustomAction(...arguments);
  }
}
```

#### headersForCustomAction

You can define your custom headers for every `customAction` by adding a conditional:

```js
@withCustomActions
export default class BookAdapter extends JSONAPIAdapter {
  headersForCustomAction(params) {
    if (params.actionId === 'myPublishAction') {
      return {
        'Authorization-For-Custom-Action': 'mySuperToken123',
      };
    }

    return super.headersForCustomAction(...arguments);
  }
}
```

#### dataForCustomAction

You can define your custom data for every `customAction` by adding a conditional:

```js
@withCustomActions
export default class BookAdapter extends JSONAPIAdapter {
  dataForCustomAction(params) {
    if (params.actionId === 'myPublishAction') {
      return {
        myParam: 'send it to the server',
      };
    }

    return super.dataForCustomAction(...arguments);
  }
}
```

`params` contains following data: `data`, `actionId`, `modelId`, `model`

### Configuration

You can define your custom options in your `config/environment.js` file

```js
module.exports = function (environment) {
  var ENV = {
    emberCustomActions: {
      method: 'POST',
      data: {},
      headers: {},
      queryParams: {},
      ajaxOptions: {},
      adapterOptions: {},
      pushToStore: false,
      responseType: null,
      normalizeOperation: '',
    },
  };

  return ENV;
};
```

#### `method`

Default method of the request (GET, PUT, POST, DELETE, etc..)

#### `headers`

An object `{}` of custom headers. Eg:

```js
{
  'my-custom-auth': 'mySuperToken123'
}
```

#### `ajaxOptions`

Your own ajax options.
** USE ONLY IF YOU KNOW WHAT YOU ARE DOING! **
Those properties will be overwritten by ECU.

#### `pushToStore`

If you want to push the received data to the store, set this option to `true`

#### `normalizeOperation`

You can define how your outgoing data should be serialized

````

Exemplary data:
```js
{
  firstParam: 'My Name',
  colors: { rubyRed: 1, blueFish: 3 }
}
````

After using a `dasherize` transformer our request data will turn into:

```js
{
  first-param: 'My Name',
  colors: { ruby-red: 1, blue-fish: 3 }
}
```

It's great for API with request data format restrictions

**Available transformers:**

- camelize
- capitalize
- classify
- dasherize
- decamelize
- underscore

#### `adapterOptions`

Pass custom adapter options to handle them in `urlForCustomAction` in case of using `customAction`. Required usage of mixin: `AdpaterMixin`

#### `responseType`

You can easily observe the returned model by changing `responseType` to `array` or `object` according to what type of data
your server will return.

When `array`:

```js
model.customAction({}, { responseType: 'array' }); // returns DS.PromiseArray
```

When `object`:

```js
model.customAction({}, { responseType: 'object' }); // returns DS.PromiseObject
```

When `null` (default):

```js
model.customAction({}, { responseType: null }); // returns Promise
```

`null` is useful if you don't care about the response or just want to use `then` on the promise without using `binding` or display it in the template.

#### `queryParams`

You can pass a query params for a request by passing an `{}` with properties, eg: `{ include: 'owner' }`
** Remember: Query params are not normalized! You have to pass it in the correct format. **

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

## License

This project is licensed under the [MIT License](LICENSE.md).
