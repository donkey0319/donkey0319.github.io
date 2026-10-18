import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { parseHash, matches, toggle, cardState } = require('../assets/js/work-filter.js');

// The filter keys come from the page's buttons, so adding a button adds a filter.
const KEYS = ['shaders', 'techanim', 'environment'];

test('parseHash reads known filters and ignores anything else', () => {
  assert.equal(parseHash('#shaders', KEYS), 'shaders');
  assert.equal(parseHash('#ENVIRONMENT', KEYS), 'environment');
  assert.equal(parseHash('#games', KEYS), null);
  assert.equal(parseHash('', KEYS), null);
  assert.equal(parseHash('#', KEYS), null);
});

test('matches checks whole label tokens', () => {
  assert.equal(matches('shaders environment', 'environment'), true);
  assert.equal(matches('techanim', 'shaders'), false);
  assert.equal(matches('techanim', null), true);
  assert.equal(matches('techanim', 'tech'), false);
  assert.equal(matches('', 'shaders'), false);
});

test('toggle selects, switches and clears', () => {
  assert.equal(toggle(null, 'shaders'), 'shaders');
  assert.equal(toggle('shaders', 'shaders'), null);
  assert.equal(toggle('shaders', 'techanim'), 'techanim');
  assert.equal(toggle('shaders', ''), null);
});

test('cardState only forces cards visible when a filter shows them', () => {
  assert.deepEqual(cardState('environment', null), { hidden: false, forceVisible: false });
  assert.deepEqual(cardState('environment', 'environment'), { hidden: false, forceVisible: true });
  assert.deepEqual(cardState('environment', 'shaders'), { hidden: true, forceVisible: false });
});
