(function () {
  // Filter keys are read from the page's <button data-filter="…"> elements, so
  // adding a button in work/index.html adds a filter — no change needed here.
  function parseHash(hash, keys) {
    var key = String(hash || '').replace(/^#/, '').toLowerCase();
    return keys.indexOf(key) === -1 ? null : key;
  }

  function matches(categoriesAttr, filter) {
    if (!filter) return true;
    return String(categoriesAttr || '').split(/\s+/).indexOf(filter) !== -1;
  }

  // Clicking the active filter again, or "All" (empty key), clears the filter.
  function toggle(current, clicked) {
    if (!clicked) return null;
    return current === clicked ? null : clicked;
  }

  // A card shown by an active filter is revealed at once (it may never have
  // scrolled into view while hidden); with no filter, cards keep their
  // normal scroll reveal.
  function cardState(categoriesAttr, filter) {
    var show = matches(categoriesAttr, filter);
    return { hidden: !show, forceVisible: show && !!filter };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { parseHash: parseHash, matches: matches, toggle: toggle, cardState: cardState };
    return;
  }

  var buttons = document.querySelectorAll('.filter[data-filter]');
  var cards = document.querySelectorAll('.card[data-categories]');
  var keys = [];
  buttons.forEach(function (b) {
    var key = b.getAttribute('data-filter');
    if (key) keys.push(key);
  });
  var current = null;

  function apply(filter) {
    current = filter;
    cards.forEach(function (card) {
      var state = cardState(card.getAttribute('data-categories'), filter);
      card.classList.toggle('is-hidden', state.hidden);
      if (state.forceVisible) card.classList.add('is-visible');
    });
    buttons.forEach(function (b) {
      var on = (b.getAttribute('data-filter') || null) === filter;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      var next = toggle(current, b.getAttribute('data-filter'));
      apply(next);
      history.replaceState(null, '', next ? '#' + next : location.pathname + location.search);
    });
  });

  window.addEventListener('hashchange', function () { apply(parseHash(location.hash, keys)); });
  apply(parseHash(location.hash, keys));
})();
