import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupStore, setupServer } from 'dummy/tests/test-support';

module('Unit | Model | bike', function (hooks) {
  setupTest(hooks);
  setupStore(hooks);
  setupServer(hooks);

  hooks.beforeEach(function () {
    this.model = this.store.createRecord('bike');
  });

  test('model action with default and custom data', async function (assert) {
    assert.expect(4);

    this.server.put('/bikes/:id/ride', (request) => {
      let data = JSON.parse(request.requestBody);

      assert.deepEqual(data, { myParam: 'My first param', defaultParam: 'ok' });
      assert.deepEqual(request.queryParams, {
        enduro: 'true',
        include: 'owner',
      });
      assert.strictEqual(
        request.url,
        '/bikes/1/ride?enduro=true&include=owner'
      );

      return [200, {}, 'true'];
    });

    this.model.id = 1;

    const payload = { myParam: 'My first param' };
    const response = await this.model.ride(payload, {
      queryParams: { enduro: true, include: 'owner' },
    });

    assert.ok(response, true);
  });

  test('model action pushes to store an object', async function (assert) {
    assert.expect(5);

    this.server.put('/bikes/:id/ride', (request) => {
      let data = JSON.parse(request.requestBody);
      assert.deepEqual(data, { myParam: 'My first param', defaultParam: 'ok' });
      assert.strictEqual(request.url, '/bikes/1/ride');

      return [
        200,
        {},
        '{ "data": { "type": "bike", "id": 2, "attributes": {} } }',
      ];
    });

    this.model.id = 1;
    assert.strictEqual(this.store.peekAll('bike').length, 1);

    const response = await this.model.ride({ myParam: 'My first param' });
    assert.strictEqual(response.id, '2');
    assert.strictEqual(this.store.peekAll('bike').length, 2);
  });

  test('model action pushes to store an array of objects', async function (assert) {
    assert.expect(6);

    this.server.put('/bikes/:id/ride', (request) => {
      let data = JSON.parse(request.requestBody);
      assert.deepEqual(data, { myParam: 'My first param', defaultParam: 'ok' });
      assert.strictEqual(request.url, '/bikes/1/ride');

      return [
        200,
        {},
        '{ "data": [{ "type": "bike", "id": 2, "attributes": {} }, { "type": "bike", "id": 3, "attributes": {} }] }',
      ];
    });

    this.model.id = 1;
    assert.strictEqual(this.store.peekAll('bike').length, 1);

    const response = await this.model.ride({ myParam: 'My first param' });
    assert.strictEqual(response[0].id, '2');
    assert.strictEqual(response[1].id, '3');
    assert.strictEqual(this.store.peekAll('bike').length, 3);
  });

  test('model action set serialized errors in error object', async function (assert) {
    assert.expect(1);

    const errorText = 'This name is taken';
    const error = {
      detail: errorText,
      source: { pointer: 'data/attributes/name' },
    };

    this.server.put('/bikes/:id/ride', () => {
      let payload = JSON.stringify({ errors: [error] });
      return [422, {}, payload];
    });

    this.model.id = 1;
    this.model.name = 'Mikael';

    try {
      await this.model.ride({ name: 'new-name' });
    } catch (error) {
      assert.deepEqual(error.serializedErrors, { name: [errorText] });
    }
  });
});
