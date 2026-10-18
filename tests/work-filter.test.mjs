import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { CATEGORIES, parseHash, matches, toggle } = require('../assets/js/work-filter.js');

test('categories are the two tile keys', () => {
  assert.deepEqual(CATEGORIES, ['work', 'games']);
});

test('parseHash reads known categories and ignores anything else', () => {
  assert.equal(parseHash('#work'), 'work');
  assert.equal(parseHash('#shaders'), null);
  assert.equal(parseHash('#games'), 'games');
  assert.equal(parseHash('#GAMES'), 'games');
  assert.equal(parseHash('#bogus'), null);
  assert.equal(parseHash(''), null);
  assert.equal(parseHash('#'), null);
});

test('matches checks whole category tokens', () => {
  assert.equal(matches('work games', 'games'), true);
  assert.equal(matches('games', 'work'), false);
  assert.equal(matches('games', null), true);
  assert.equal(matches('games', 'game'), false);
});

test('toggle selects, switches and clears', () => {
  assert.equal(toggle(null, 'games'), 'games');
  assert.equal(toggle('games', 'games'), null);
  assert.equal(toggle('games', 'work'), 'work');
});

test('cardState only forces cards visible when a filter shows them', () => {
  const { cardState } = require('../assets/js/work-filter.js');
  assert.deepEqual(cardState('games', null), { hidden: false, forceVisible: false });
  assert.deepEqual(cardState('games', 'games'), { hidden: false, forceVisible: true });
  assert.deepEqual(cardState('games', 'work'), { hidden: true, forceVisible: false });
});
