(function () {
  var CATEGORIES = ['shaders', 'rendering', 'techanim', 'games'];

  function parseHash(hash) {
    var key = String(hash || '').replace(/^#/, '').toLowerCase();
    return CATEGORIES.indexOf(key) === -1 ? null : key;
  }

  function matches(categoriesAttr, filter) {
    if (!filter) return true;
    return String(categoriesAttr || '').split(/\s+/).indexOf(filter) !== -1;
  }

  // Clicking the active tile again clears the filter.
  function toggle(current, clicked) {
    return current === clicked ? null : clicked;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CATEGORIES: CATEGORIES, parseHash: parseHash, matches: matches, toggle: toggle };
    return;
  }

  var tiles = document.querySelectorAll('.tile[data-filter]');
  var cards = document.querySelectorAll('.card[data-categories]');
  var work = document.getElementById('work');
  var reset = document.getElementById('work-reset');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var current = null;

  function apply(filter) {
    current = filter;
    cards.forEach(function (card) {
      var show = matches(card.getAttribute('data-categories'), filter);
      card.classList.toggle('is-hidden', !show);
      // A card hidden before it scrolled into view never got revealed.
      if (show) card.classList.add('is-visible');
    });
    tiles.forEach(function (tile) {
      var on = tile.getAttribute('data-filter') === filter;
      tile.classList.toggle('is-active', on);
      tile.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if (reset) reset.classList.toggle('is-hidden', !filter);
  }

  function choose(filter) {
    apply(filter);
    history.replaceState(null, '', filter ? '#' + filter : location.pathname + location.search);
    if (work) work.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  tiles.forEach(function (tile) {
    tile.addEventListener('click', function () {
      choose(toggle(current, tile.getAttribute('data-filter')));
    });
  });

  if (reset) reset.addEventListener('click', function () { choose(null); });

  window.addEventListener('hashchange', function () { apply(parseHash(location.hash)); });
  apply(parseHash(location.hash));
})();
