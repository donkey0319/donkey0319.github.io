# donkey0319.github.io

Victor Lu's portfolio site — plain static HTML/CSS/JS, served as-is by GitHub Pages
(`.nojekyll` disables the Jekyll build).

## Layout

```
index.html                     About (home)
games/index.html               Games grid
games/<project>/index.html     Game detail pages
artwork/index.html             Artwork grid
artwork/<project>/index.html   Artwork detail pages
posts/, welcome-to-my-site/    Blog list + post (not linked from the nav)

assets/css/theme.css   Compiled Minimal Mistakes theme + "claude" skin — don't edit
assets/css/site.css    Site customizations (cards, grid, transitions, spacing)
assets/js/main.min.js  Theme JS (responsive "greedy" nav, video sizing, etc.)
assets/js/page-fade.js Fade transition for browsers without View Transitions
assets/images, assets/videos   Media
feed.xml, sitemap.xml, robots.txt
```

Every page carries its own copy of the masthead and footer, so a nav change has to be
made in each `index.html`.

## Adding a project

1. Copy an existing detail page (e.g. `games/6-mask-exe/index.html`) to a new folder and
   update the `<title>`, meta tags, page title and content.
2. Add a `grid__item` card for it in `games/index.html` (or `artwork/index.html`).
3. Add the URL to `sitemap.xml`.

## Local preview

```
python -m http.server 8000
```

Then open http://localhost:8000. Pages use root-relative paths, so open them through
a server rather than from the file system.
