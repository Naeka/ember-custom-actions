import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupStore, setupServer } from 'dummy/tests/test-support';

module('Unit | Model | car', function (hooks) {
  setupTest(hooks);
  setupStore(hooks);
  setupServer(hooks);

  hooks.beforeEach(function () {
    this.model = this.store.createRecord('car');
  });

  test('creates default url for model action', async function (assert) {
    assert.expect(3);

    this.server.post('/cars/:id/drive', (request) => {
      assert.deepEqual(request.queryParams, { include: 'owner' });
      assert.strictEqual(request.url, '/cars/1/drive?include=owner');
      return [200, {}, 'true'];
    });

    this.model.id = 1;
    const response = await this.model.drive(
      {},
      { queryParams: { include: 'owner' } }
    );
    assert.ok(response, true);
  });

  test('creates custom url with base url and custom request method for model action', async function (assert) {
    assert.expect(2);

    this.server.patch('/cars/:id/custom-clean', () => {
      assert.ok(true);
      return [200, {}, 'true'];
    });

    this.model.id = 1;
    const response = await this.model.clean();
    assert.ok(response, true);
  });

  test('custom headers', async function (assert) {
    assert.expect(2);

    this.server.patch('/cars/:id/custom-clean', (request) => {
      assert.strictEqual(request.requestHeaders.myHeader, 'custom header');
      return [200, {}, 'true'];
    });

    this.model.id = 1;
    const response = await this.model.clean();
    assert.ok(response, true);
  });

  test('creates custom url for model action', async function (assert) {
    assert.expect(2);

    this.server.post('/custom-cars/:id/custom-fix', () => {
      assert.ok(true);
      return [200, {}, 'true'];
    });

    this.model.id = 1;
    const response = await this.model.fix();
    assert.ok(response, true);
  });

  // eslint-disable-next-line qunit/no-commented-tests
  // test('creates custom url for model action and passes adapterOptions', async function (assert) {
  //   assert.expect(2);

  //   this.server.post('/custom-cars/:id/custom-fix/with-hammer', () => {
  //     assert.ok(true);
  //     return [200, {}, 'true'];
  //   });

  //   this.model.id = 1;
  //   const adapterOptions = { suffix: '/with-hammer' };
  //   const response = await this.model.fix({}, { adapterOptions });
  //   assert.ok(response, true);
  // });

  test('creates default url for resource action', async function (assert) {
    assert.expect(3);

    this.server.post('/cars/move-all', (request) => {
      assert.deepEqual(request.queryParams, { include: 'owner' });
      assert.strictEqual(request.url, '/cars/move-all?include=owner');

      return [200, {}, 'true'];
    });

    const response = await this.model.moveAll(
      {},
      { queryParams: { include: 'owner' } }
    );
    assert.ok(response, true);
  });

  test('creates custom url with base url for resource action', async function (assert) {
    assert.expect(2);

    this.server.post('/cars/custom-clean-all', () => {
      assert.ok(true);
      return [200, {}, 'true'];
    });

    const response = await this.model.cleanAll();
    assert.ok(response, true);
  });

  test('creates custom url for resource action', async function (assert) {
    assert.expect(2);

    this.server.post('/custom-cars/custom-fix-all', () => {
      assert.ok(true);
      return [200, {}, 'true'];
    });

    const response = await this.model.fixAll();
    assert.ok(response, true);
  });

  // eslint-disable-next-line qunit/no-commented-tests
  // test('creates custom url for resource action and passes adapterOptions', async function (assert) {
  //   assert.expect(2);

  //   this.server.post('/custom-cars/custom-fix-all/with-hammer', () => {
  //     assert.ok(true);
  //     return [200, {}, 'true'];
  //   });

  //   const adapterOptions = { suffix: '/with-hammer' };
  //   const response = await this.model.fixAll({}, { adapterOptions });
  //   assert.ok(response, true);
  // });

  test('custom data from adapter', async function (assert) {
    assert.expect(2);

    this.server.patch('/cars/:id/custom-clean', (request) => {
      let data = JSON.parse(request.requestBody);
      assert.deepEqual(data, { 'custom-param': 'custom param' });
      return [200, {}, 'true'];
    });

    this.model.id = 1;

    const response = await this.model.clean(
      {},
      { normalizeOperation: 'dasherize' }
    );
    assert.ok(response, true);
  });
});
