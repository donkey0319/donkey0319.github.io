# donkey0319.github.io

Victor Lu's portfolio site — plain static HTML/CSS/JS, served as-is by GitHub Pages
(`.nojekyll` disables the Jekyll build).

## Layout

```
index.html                     Home: intro, category tiles, filterable work grid
about/index.html               About: photo, background, contact
games/<project>/index.html     Game project pages
artwork/<project>/index.html   Tech art project pages
games/index.html,              Old grid pages — now redirect to the home grid
  artwork/index.html             (/#games and / respectively)
posts/, welcome-to-my-site/    Old blog (not linked from the nav, still uses theme.css)

assets/css/style.css     All site styles (palette tokens at the top)
assets/js/site.js        Scroll reveal, pause offscreen videos, "← All work" back link
assets/js/work-filter.js Category tiles → grid filter (state kept in the URL hash)
assets/resume/Victor_Lu_Resume.pdf
assets/images, assets/videos   Media

assets/css/theme.css, assets/css/site.css,
assets/js/main.min.js, assets/js/page-fade.js   Blog pages only — not used by the redesign

tests/                   node --test checks (structure, links, filter logic)
feed.xml, sitemap.xml, robots.txt
```

Every page carries its own copy of the header and footer, so a nav change has to be
made in each `index.html` (home, about, and each project page).

## Updating your resume

Replace `assets/resume/Victor_Lu_Resume.pdf` with the new PDF **using exactly the same
file name**, then commit and push. Every "Resume" link points at that name, so nothing
else needs to change. GitHub Pages caches files for about 10 minutes, so visitors may see
the old one briefly; a hard refresh shows the new one immediately.

## Adding a project

1. Copy an existing project page (e.g. `games/6-mask-exe/index.html`) to a new folder.
   Update the `<title>`, meta tags, canonical URL, `project__kind`, title, hero media,
   the facts list (only facts you know — delete the rest, or the whole `<dl>`),
   "What I did", and the breakdown.
2. Add a card to the grid in `index.html`:
   ```html
   <article class="card reveal" data-categories="shaders rendering">
     <a class="card__link" href="/artwork/5-new-thing/">
       <div class="card__media"><img src="..." alt="" loading="lazy" decoding="async"></div>
       <p class="card__kind">Shaders</p>
       <h3 class="card__title">New Thing</h3>
       <p class="card__what">One line on what you did.</p>
       <ul class="tags"><li>UE5</li><li>HLSL</li></ul>
     </a>
   </article>
   ```
   `data-categories` takes one or more of `shaders`, `rendering`, `techanim`, `games`.
   `card__kind` shows the first one's label. For a looping preview use
   `<video src="..." poster="..." autoplay muted loop playsinline preload="metadata"></video>`.
3. Add the page to `REDESIGNED` in `tests/helpers.mjs` and its URL to `sitemap.xml`.

## Filling in "What I did"

Some projects don't have this text yet. Search for `TODO(victor)` — each project has
one in its card (`index.html`) and one on its page.

- **Card:** replace the comment with `<p class="card__what">Your one line.</p>`
- **Page:** replace the two comment lines with
  ```html
  <section class="what-i-did">
    <h2>What I did</h2>
    <p>One to three sentences.</p>
  </section>
  ```

Currently missing: Ramu Cinematic, Granny's Gift, A Decent Farewell, Ginger Air.

## Checks

```
node --test tests/*.test.mjs
```

Verifies every page uses the new stylesheet and nav, no local link or media path is
broken, no TODO text is visible, and the filter logic works.

## Local preview

```
python -m http.server 8000
```

Then open http://localhost:8000. Pages use root-relative paths, so open them through
a server rather than from the file system.
