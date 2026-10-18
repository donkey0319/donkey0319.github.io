# donkey0319.github.io

Victor Lu's portfolio site — plain static HTML/CSS/JS, served as-is by GitHub Pages
(`.nojekyll` disables the Jekyll build).

## Layout

```
index.html                     Home: level-select title screen with 4 highlights
work/index.html                Work: every project, with label filters
games/index.html               Games: the games you've worked on
about/index.html               About: photo, background, contact, resume
artwork/<project>/index.html   Individual art piece pages
games/<project>/index.html     Game pages
artwork/index.html             Old grid URL — redirects to /work/
posts/, welcome-to-my-site/    Old blog (not linked from the nav, still uses theme.css)

assets/css/style.css     All site styles (colors are the --tokens at the top)
assets/js/site.js        Scroll reveal, pause offscreen videos, "← All work" back link
assets/js/work-filter.js Filter buttons on the Work page (reads them from the page)
assets/js/home.js        Swaps the title-screen background when hovering a highlight
assets/resume/Victor_Lu_Resume.pdf
assets/images, assets/videos   Media

assets/css/theme.css, assets/css/site.css,
assets/js/main.min.js, assets/js/page-fade.js   Blog pages only — not used by the redesign

tests/                   node --test checks (structure, links, labels, filter logic)
feed.xml, sitemap.xml, robots.txt
```

Every page carries its own copy of the header and footer, so a nav change has to be
made in each `index.html`.

## Customizing

### Change a project's labels

Labels live on the project's card in `work/index.html`, in `data-categories`
(space-separated):

```html
<article class="card reveal" data-categories="shaders environment">
```

Available labels are whatever the filter buttons offer (below). A card with no labels
only shows under "All".

The small orange word above a card's title (`<p class="card__kind">Shaders</p>`) is just
display text — change it freely; it doesn't affect filtering.

### Add, rename or remove a filter

Filter buttons are at the top of `work/index.html`:

```html
<div class="filters" role="group" aria-label="Filter projects">
  <button class="filter" type="button" data-filter="" aria-pressed="true">All</button>
  <button class="filter" type="button" data-filter="shaders" aria-pressed="false">Shaders</button>
  <button class="filter" type="button" data-filter="techanim" aria-pressed="false">Technical Animation</button>
  <button class="filter" type="button" data-filter="environment" aria-pressed="false">Environment Design</button>
</div>
```

- **Add a filter:** copy a button line, give it a new `data-filter` key (lowercase, no
  spaces, e.g. `vfx`) and a label, then add that key to the cards' `data-categories`.
  No JavaScript changes needed — the filter script reads the buttons from the page.
- **Rename:** change the button's text. (Changing the key means updating the cards too.)
- **Remove:** delete the button and remove its key from the cards.
- A filtered view has its own link, e.g. `/work/#environment`.

Then update the expected labels in `tests/site.test.mjs` (the `LABELS` table and the
"work filters are …" test) so the checks match.

### Change the home highlights

In `index.html`, each highlight is one `<a class="level">` tile inside
`<nav class="levels">`:

```html
<a class="level" href="/artwork/2-painterly-shader/" data-poster="/assets/images/painterly/painterly.png">
  <img src="/assets/images/painterly/painterly.png" alt="" decoding="async">
  <span class="level__num">02</span>
  <span class="level__name">Painterly Shader</span>
</a>
```

- `href` — the project page it opens.
- `data-poster` and `<img src>` — the still image (usually the same file).
- `data-video` (optional) — a short muted loop that plays behind the title on hover.
- The first tile has `is-active`; the title background starts on it, so the
  `<video class="title__video">` near the top of `<main>` should use the same video/poster.

Keep it to four tiles for the 4-across layout (it becomes 2×2 on phones). Update the
"home highlights" test in `tests/site.test.mjs` if you change which projects appear.

### Add a project

1. Copy an existing project page (e.g. `games/6-mask-exe/index.html`) to a new folder.
   Update the `<title>`, meta tags, canonical URL, `project__kind`, title, hero media,
   the facts list (only facts you know — delete the rest, or the whole `<dl>`),
   "What I did", and the breakdown.
2. Add a card to `work/index.html` (and to `games/index.html` too if it's a game):
   ```html
   <article class="card reveal" data-categories="shaders">
     <a class="card__link" href="/artwork/5-new-thing/">
       <div class="card__media"><img src="..." alt="" loading="lazy" decoding="async"></div>
       <p class="card__kind">Shaders</p>
       <h3 class="card__title">New Thing</h3>
       <p class="card__what">One line on what you did.</p>
       <ul class="tags"><li>UE5</li><li>HLSL</li></ul>
     </a>
   </article>
   ```
   On the Games page, leave out `data-categories`. For a looping preview instead of an
   image use `<video src="..." poster="..." autoplay muted loop playsinline preload="metadata"></video>`.
3. Add the page to `REDESIGNED` in `tests/helpers.mjs`, its labels to `LABELS` in
   `tests/site.test.mjs`, and its URL to `sitemap.xml`.

### Update your resume

Replace `assets/resume/Victor_Lu_Resume.pdf` with the new PDF **using exactly the same
file name**, then commit and push. Every Resume link points at that name. GitHub Pages
caches files for about 10 minutes; a hard refresh shows the new one immediately.

### Fill in "What I did"

Some projects don't have this text yet. Search for `TODO(victor)` — each appears in the
project's card (`work/index.html`, plus `games/index.html` for games) and on its page.

- **Card:** replace the comment with `<p class="card__what">Your one line.</p>`
- **Page:** replace the two comment lines with
  ```html
  <section class="what-i-did">
    <h2>What I did</h2>
    <p>One to three sentences.</p>
  </section>
  ```

Currently missing: Ramu Cinematic, A Decent Farewell, Ginger Air.

## Checks

```
node --test tests/*.test.mjs
```

Verifies every page uses the new stylesheet and nav, no local link or media path is
broken, no TODO text is visible, every card label has a filter, and the filter logic works.

## Local preview

```
python -m http.server 8000
```

Then open http://localhost:8000. Pages use root-relative paths, so open them through
a server rather than from the file system.
