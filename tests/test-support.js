import Pretender from 'pretender';

/**
 * Helper to quickly setup a store service.
 *
 * @param {Object} hooks The hooks to prepare fixtures, or run other setup and teardown logic
 * @param {String || undefined} as The property name to retrieve the store from the test instance
 */
export function setupStore(hooks, as) {
  hooks.beforeEach(function () {
    if (!this.owner) {
      throw new Error(
        `You must call one of the ember-qunit setupTest(), setupRenderingTest()
         or setupApplicationTest() methods before calling setupStore()`
      );
    }
    this[as ?? 'store'] = this.owner.lookup('service:store');
  });
}

/**
 * Helper to quickly setup a store service.
 *
 * @param {Object} hooks The hooks to prepare fixtures, or run other setup and teardown logic
 * @param {String || undefined} as The property name to retrieve the store from the test instance
 */
export function setupServer(hooks, as) {
  hooks.beforeEach(function () {
    this[as ?? 'server'] = new Pretender();
  });

  hooks.afterEach(function () {
    this[as ?? 'server'].shutdown();
  });
}
