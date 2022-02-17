import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import ArrayProxy from '@ember/array/proxy';
import ObjectProxy from '@ember/object/proxy';
import { setupStore, setupServer } from 'dummy/tests/test-support';

module('Unit | Model | post', function (hooks) {
  setupTest(hooks);
  setupStore(hooks);
  setupServer(hooks);

  hooks.beforeEach(function () {
    this.model = this.store.createRecord('post');
  });

  test('model action', async function (assert) {
    assert.expect(3);

    this.server.post('/posts/:id/publish', (request) => {
      let data = JSON.parse(request.requestBody);
      assert.deepEqual(data, { myParam: 'My first param' });
      assert.strictEqual(request.url, '/posts/1/publish');

      return [200, {}, 'true'];
    });

    this.model.id = 1;
    let payload = { myParam: 'My first param' };
    const response = await this.model.publish(payload);
    assert.ok(response, true);
  });

  test('model action pushes to store an object', async function (assert) {
    assert.expect(5);

    this.server.post('/posts/:id/publish', (request) => {
      let data = JSON.parse(request.requestBody);
      assert.deepEqual(data, { myParam: 'My first param' });
      assert.strictEqual(request.url, '/posts/1/publish');

      return [200, {}, '{"data": {"id": 2, "type": "Post"}}'];
    });

    this.model.id = 1;
    assert.strictEqual(this.store.peekAll('post').length, 1);

    let payload = { myParam: 'My first param' };
    const response = await this.model.publish(payload);
    assert.strictEqual(response.id, '2');
    assert.strictEqual(this.store.peekAll('post').length, 2);
  });

  test('model action pushes to store an array of objects', async function (assert) {
    assert.expect(6);

    this.server.post('/posts/:id/publish', (request) => {
      let data = JSON.parse(request.requestBody);
      assert.deepEqual(data, { myParam: 'My first param' });
      assert.strictEqual(request.url, '/posts/1/publish');

      return [
        200,
        {},
        '{"data": [{"id": 2, "type": "posts"}, {"id": 3, "type": "posts"}] }',
      ];
    });

    this.model.id = 1;
    assert.strictEqual(this.store.peekAll('post').length, 1);

    let payload = { myParam: 'My first param' };
    const response = await this.model.publish(payload);
    assert.strictEqual(response[0].id, '2');
    assert.strictEqual(response[1].id, '3');
    assert.strictEqual(this.store.peekAll('post').length, 3);
  });

  test('resource action', async function (assert) {
    assert.expect(3);

    this.server.post('/posts/list', (request) => {
      let data = JSON.parse(request.requestBody);
      assert.deepEqual(data, { myParam: 'My first param' });
      assert.strictEqual(request.url, '/posts/list');

      return [200, {}, 'true'];
    });

    this.model.id = 1;

    let payload = { myParam: 'My first param' };
    const response = await this.model.list(payload);
    assert.ok(response, true);
  });

  test('resource action with params in GET', async function (assert) {
    assert.expect(4);

    this.server.get('/posts/search', (request) => {
      assert.strictEqual(
        request.url,
        '/posts/search?showAll=true&my-param=My+first+param'
      );
      assert.strictEqual(request.requestHeaders.test, 'Custom header');
      assert.deepEqual(request.queryParams, {
        'my-param': 'My first param',
        showAll: 'true',
      });

      return [200, {}, 'true'];
    });

    this.model.id = 1;
    let payload = { myParam: 'My first param' };
    const response = await this.model.search(payload, {
      ajaxOptions: { headers: { test: 'Custom header' } },
    });
    assert.ok(response, true);
  });

  test('resource action pushes to store', async function (assert) {
    assert.expect(5);

    this.server.post('/posts/list', (request) => {
      let data = JSON.parse(request.requestBody);
      assert.deepEqual(data, { myParam: 'My first param' });
      assert.strictEqual(request.url, '/posts/list');

      return [
        200,
        {},
        '{"data": [{"id": "2", "type": "post"},{"id": "3", "type": "post"}]}',
      ];
    });

    this.model.id = 1;
    assert.strictEqual(this.store.peekAll('post').length, 1);

    let payload = { myParam: 'My first param' };
    const response = await this.model.list(payload);
    assert.strictEqual(response.length, 2);
    assert.strictEqual(this.store.peekAll('post').length, 3);
  });

  test('responseTypes', async function (assert) {
    assert.expect(6);

    this.server.post('/posts/list', (request) => {
      assert.strictEqual(request.url, '/posts/list');

      return [
        200,
        {},
        '{"data": [{"id": "2", "type": "post"},{"id": "3", "type": "post"}]}',
      ];
    });

    const promise = this.model.list();
    const promiseArray = this.model.list(null, { responseType: 'array' });
    const promiseObject = this.model.list(null, {
      responseType: 'object',
    });

    assert.strictEqual(promise.constructor, Promise);
    assert.strictEqual(promiseArray.constructor.superclass, ArrayProxy);
    assert.strictEqual(promiseObject.constructor.superclass, ObjectProxy);

    await promise;
    await promiseArray;
    await promiseObject;
  });

  test('model action set serialized errors in error object', async function (assert) {
    assert.expect(1);

    let errorText = 'This name is taken';
    let error = {
      detail: errorText,
      source: { pointer: 'data/attributes/name' },
    };

    this.server.post('/posts/:id/publish', () => {
      let payload = JSON.stringify({ errors: [error] });
      return [422, {}, payload];
    });

    this.model.id = 1;
    this.model.name = 'Mikael';

    try {
      await this.model.publish({ name: 'new-name' });
    } catch (error) {
      assert.deepEqual(error.serializedErrors, { name: [errorText] });
    }
  });

  test('custom headers in non-customAction', async function (assert) {
    assert.expect(2);

    this.server.get('/posts/search', (request) => {
      assert.strictEqual(request.requestHeaders.testHeader, 'ok');
      return [200, {}, 'true'];
    });

    const response = await this.model.search();
    assert.ok(response, true);
  });
});
