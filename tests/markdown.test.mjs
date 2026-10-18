import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderBody, renderAbout, renderMedia, youtubeId } from '../tools/lib/markdown.mjs';

const VIDEO = '<video controls playsinline preload="metadata"><source src="/v/a.mp4" type="video/mp4"></video>';
const squash = (html) => html.replace(/>\s+</g, '><').trim();

test('a video link becomes a video with its alt text as caption', () => {
  assert.equal(squash(renderBody('![Caption](/v/a.mp4)')), `${VIDEO}<p class="caption">Caption</p>`);
});

test('a "loop" video autoplays muted with an optional poster', () => {
  assert.equal(
    squash(renderBody('![Cap](/v/a.mp4 "loop poster=/i/p.jpg")')),
    '<video autoplay muted loop playsinline poster="/i/p.jpg"><source src="/v/a.mp4" type="video/mp4"></video><p class="caption">Cap</p>',
  );
});

test('a video with no alt text has no caption', () => {
  assert.equal(squash(renderBody('![](/v/a.mp4)')), VIDEO);
});

test('an image keeps alt text and gets no caption by itself', () => {
  assert.equal(squash(renderBody('![alt text](/i/a.png)')), '<img src="/i/a.png" alt="alt text" loading="lazy">');
});

test('an italic line right after an image becomes its caption', () => {
  const expected = '<img src="/i/a.png" alt="x" loading="lazy"><p class="caption">A caption</p>';
  assert.equal(squash(renderBody('![x](/i/a.png)\n*A caption*')), expected);
  assert.equal(squash(renderBody('![x](/i/a.png)\n\n*A caption*')), expected);
});

test('italic text elsewhere stays a normal paragraph', () => {
  assert.equal(squash(renderBody('*Just emphasis*')), '<p><em>Just emphasis</em></p>');
});

test('YouTube links become embeds', () => {
  const embed = '<div class="embed"><iframe src="https://www.youtube-nocookie.com/embed/KlP4yi8pVPE" title="Video" allow="fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>';
  assert.equal(squash(renderBody('![](https://www.youtube.com/watch?v=KlP4yi8pVPE)')), embed);
  assert.equal(squash(renderBody('![](https://youtu.be/KlP4yi8pVPE)')), embed);
  assert.equal(youtubeId('https://example.com/watch?v=abc'), null);
});

test('consecutive media are not wrapped in a paragraph', () => {
  const html = squash(renderBody('![a](/i/a.png)\n![b](/i/b.png)'));
  assert.equal(html, '<img src="/i/a.png" alt="a" loading="lazy"><img src="/i/b.png" alt="b" loading="lazy">');
});

test('headings get the same ids the old pages used', () => {
  assert.match(renderBody('### Custom Normal Map'), /<h3 id="custom-normal-map">Custom Normal Map<\/h3>/);
  assert.match(renderBody('### Egyptian Map (Dug Site)'), /<h3 id="egyptian-map-dug-site">/);
  assert.match(renderBody('## In-person Showcase'), /<h2 id="in-person-showcase">/);
});

test('plain paragraphs and links render normally', () => {
  assert.equal(
    squash(renderBody('See it [here](https://github.com/x).')),
    '<p>See it <a href="https://github.com/x">here</a>.</p>',
  );
});

test('renderMedia is reused for heroes', () => {
  assert.equal(
    squash(renderMedia('/v/a.mp4', { poster: '/i/p.jpg', caption: 'Hi' })),
    '<video controls playsinline preload="metadata" poster="/i/p.jpg"><source src="/v/a.mp4" type="video/mp4"></video><p class="caption">Hi</p>',
  );
});

test('About bold text is orange', () => {
  assert.match(renderAbout('I am a **Technical Artist**.'), /<strong class="accent">Technical Artist<\/strong>/);
});
