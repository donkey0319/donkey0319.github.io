// Markdown → HTML for project write-ups and the About text.
//
// Plain markdown renders as usual. Media extras (see README):
//   ![Caption](/clip.mp4)                          video with controls + caption
//   ![Caption](/clip.mp4 "loop poster=/p.jpg")     muted looping video
//   ![](https://youtu.be/ID)                       YouTube embed
//   ![alt](/image.png)  then  *caption*            image + caption
import { Marked } from 'marked';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// marked hands us already-escaped alt/title text; undo that before re-escaping.
const unesc = (s) =>
  String(s ?? '').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

export function youtubeId(url) {
  const m = /^https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/|youtube(?:-nocookie)?\.com\/embed\/)([\w-]{6,})/.exec(String(url));
  return m ? m[1] : null;
}

const isVideo = (src) => /\.(mp4|webm|mov)(\?.*)?$/i.test(src);

export function renderMedia(src, { caption, loop, poster, alt } = {}) {
  const cap = caption ? `\n<p class="caption">${esc(caption)}</p>` : '';
  const yt = youtubeId(src);
  if (yt) {
    return `<div class="embed"><iframe src="https://www.youtube-nocookie.com/embed/${yt}" title="${esc(alt || 'Video')}" allow="fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>${cap}`;
  }
  if (isVideo(src)) {
    const p = poster ? ` poster="${esc(poster)}"` : '';
    const attrs = loop ? `autoplay muted loop playsinline${p}` : `controls playsinline preload="metadata"${p}`;
    return `<video ${attrs}>\n  <source src="${esc(src)}" type="video/mp4">\n</video>${cap}`;
  }
  return `<img src="${esc(src)}" alt="${esc(alt ?? '')}" loading="lazy">${cap}`;
}

// "loop poster=/x.jpg" → { loop: true, poster: '/x.jpg' }
function parseHints(title) {
  const hints = {};
  for (const part of unesc(title).split(/\s+/).filter(Boolean)) {
    const [k, v] = part.split('=');
    hints[k] = v === undefined ? true : v;
  }
  return hints;
}

export function slugify(text) {
  return unesc(text)
    .replace(/<[^>]+>/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const MEDIA_START = '<!--media-->';
const MEDIA_END = '<!--/media-->';
const ONLY_MEDIA = new RegExp(`^(?:\\s*${MEDIA_START}[\\s\\S]*?${MEDIA_END})+\\s*$`);
const MEDIA_THEN_EM = new RegExp(`^((?:\\s*${MEDIA_START}[\\s\\S]*?${MEDIA_END})+)\\s*<em>([\\s\\S]*)</em>\\s*$`);

function makeMarked({ accentStrong = false } = {}) {
  const marked = new Marked({ gfm: true });
  marked.use({
    renderer: {
      image(href, title, text) {
        const hints = parseHints(title);
        const alt = unesc(text);
        const video = isVideo(href);
        const html = renderMedia(href, {
          alt,
          caption: video && alt ? alt : undefined,
          loop: Boolean(hints.loop),
          poster: typeof hints.poster === 'string' ? hints.poster : undefined,
        });
        return `${MEDIA_START}${html}${MEDIA_END}`;
      },
      paragraph(text) {
        if (ONLY_MEDIA.test(text)) return `${text.trim()}\n`;
        const m = MEDIA_THEN_EM.exec(text);
        if (m) return `${m[1].trim()}\n<p class="caption">${m[2]}</p>\n`;
        const em = /^\s*<em>([\s\S]*)<\/em>\s*$/.exec(text);
        if (em) return `<p data-em-only><em>${em[1]}</em></p>\n`;
        return `<p>${text}</p>\n`;
      },
      heading(text, level) {
        return `<h${level} id="${slugify(text)}">${text}</h${level}>\n`;
      },
      ...(accentStrong ? { strong: (text) => `<strong class="accent">${text}</strong>` } : {}),
    },
  });
  return marked;
}

// Tidy blank lines, but never inside <pre> (code keeps its exact spacing).
const tidyOutsidePre = (html) =>
  html
    .split(/(<pre[\s\S]*?<\/pre>)/)
    .map((part, i) => (i % 2 ? part : part.replace(/\n{3,}/g, '\n\n')))
    .join('');

function finish(html) {
  return tidyOutsidePre(html
    // An italic-only paragraph right after media is that media's caption.
    .replace(new RegExp(`${MEDIA_END}\\s*<p data-em-only><em>([\\s\\S]*?)</em></p>`, 'g'), `${MEDIA_END}\n<p class="caption">$1</p>`)
    .replace(/<p data-em-only>/g, '<p>')
    .replace(new RegExp(MEDIA_START, 'g'), '')
    .replace(new RegExp(MEDIA_END, 'g'), '\n'))
    .trim();
}

const bodyMarked = makeMarked();
const aboutMarked = makeMarked({ accentStrong: true });

export function renderBody(markdown) {
  return finish(bodyMarked.parse(markdown ?? ''));
}

export function renderAbout(markdown) {
  return finish(aboutMarked.parse(markdown ?? ''));
}
