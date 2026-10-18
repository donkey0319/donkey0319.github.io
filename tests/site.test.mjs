import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { ROOT, read } from './helpers.mjs';

const require = createRequire(import.meta.url);

test('resume exists at fixed name', () => {
  const dir = path.join(ROOT, 'assets/resume');
  assert.ok(existsSync(path.join(dir, 'Victor_Lu_Resume.pdf')));
  const pdfs = readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.pdf'));
  assert.deepEqual(pdfs, ['Victor_Lu_Resume.pdf']);
});

test('reveal never hides content without JS', () => {
  const css = read('assets/css/style.css');
  assert.match(css, /html\.js\s+\.reveal/);
  // No rule whose whole selector is a bare `.reveal` may set opacity: 0.
  const bare = /(^|[}\s,])\.reveal\s*\{[^}]*opacity:\s*0/m;
  const rules = css.replace(/html\.js\s+\.reveal/g, 'X');
  assert.doesNotMatch(rules, bare);
});

test('reduced motion disables reveal', () => {
  const css = read('assets/css/style.css');
  const block = css.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\n\}/g) || [];
  assert.ok(block.some((b) => b.includes('.reveal')));
});

test('shouldUseHistoryBack only for same-origin home referrers', () => {
  const { shouldUseHistoryBack } = require('../assets/js/site.js');
  const o = 'https://donkey0319.github.io';
  assert.equal(shouldUseHistoryBack('https://donkey0319.github.io/#games', o), true);
  assert.equal(shouldUseHistoryBack('https://donkey0319.github.io/', o), true);
  assert.equal(shouldUseHistoryBack('https://www.google.com/', o), false);
  assert.equal(shouldUseHistoryBack('', o), false);
  assert.equal(shouldUseHistoryBack('https://donkey0319.github.io/games/4-kungfu-penguin/', o), false);
});
