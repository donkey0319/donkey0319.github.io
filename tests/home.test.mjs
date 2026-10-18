import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { read } from './helpers.mjs';

const require = createRequire(import.meta.url);
const { dimFor } = require('../assets/js/home.js');

test('background dims from 0 at the top to 1 at the bottom', () => {
  assert.equal(dimFor(0, 2000), 0);
  assert.equal(dimFor(1000, 2000), 0.5);
  assert.equal(dimFor(2000, 2000), 1);
});

test('dimming stays in range when the page overscrolls or cannot scroll', () => {
  assert.equal(dimFor(-50, 2000), 0); // iOS rubber-band at the top
  assert.equal(dimFor(2100, 2000), 1); // ...and at the bottom
  assert.equal(dimFor(0, 0), 0); // page shorter than the screen
});

test('the background video brightness follows the --dim variable', () => {
  const css = read('assets/css/style.css');
  const rule = css.match(/\.title__video\s*\{([^}]*)\}/)[1];
  assert.match(rule, /opacity:\s*calc\([^;]*var\(--dim/);
});
