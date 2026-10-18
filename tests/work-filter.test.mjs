import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { CATEGORIES, parseHash, matches, toggle } = require('../assets/js/work-filter.js');

test('categories are the four tile keys', () => {
  assert.deepEqual(CATEGORIES, ['shaders', 'rendering', 'techanim', 'games']);
});

test('parseHash reads known categories and ignores anything else', () => {
  assert.equal(parseHash('#rendering'), 'rendering');
  assert.equal(parseHash('#games'), 'games');
  assert.equal(parseHash('#GAMES'), 'games');
  assert.equal(parseHash('#bogus'), null);
  assert.equal(parseHash(''), null);
  assert.equal(parseHash('#'), null);
});

test('matches checks whole category tokens', () => {
  assert.equal(matches('rendering shaders', 'shaders'), true);
  assert.equal(matches('games', 'shaders'), false);
  assert.equal(matches('games', null), true);
  assert.equal(matches('techanim', 'tech'), false);
});

test('toggle selects, switches and clears', () => {
  assert.equal(toggle(null, 'games'), 'games');
  assert.equal(toggle('games', 'games'), null);
  assert.equal(toggle('games', 'shaders'), 'shaders');
});

test('cardState only forces cards visible when a filter shows them', () => {
  const { cardState } = require('../assets/js/work-filter.js');
  assert.deepEqual(cardState('games', null), { hidden: false, forceVisible: false });
  assert.deepEqual(cardState('games', 'games'), { hidden: false, forceVisible: true });
  assert.deepEqual(cardState('games', 'shaders'), { hidden: true, forceVisible: false });
});
