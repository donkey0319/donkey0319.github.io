(function () {
  // True only when the visitor arrived from the home page on this site, so
  // "← All work" can step back to the exact filter and scroll position they
  // left. Anything else (direct visit, search engine, a fresh tab opened from
  // home with nothing to go back to) follows the plain link.
  function shouldUseHistoryBack(referrer, origin, historyLength) {
    if (!referrer) return false;
    if (historyLength !== undefined && historyLength < 2) return false;
    try {
      var url = new URL(referrer);
      return url.origin === origin && url.pathname === '/';
    } catch (err) {
      return false;
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { shouldUseHistoryBack: shouldUseHistoryBack };
    return;
  }

  // The inline head script un-hides .reveal content if this never gets set.
  window.__siteReady = true;

  var hasIO = 'IntersectionObserver' in window;

  // Fade sections up once as they scroll into view.
  var reveals = document.querySelectorAll('.reveal');
  if (hasIO) {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { revealer.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Pause looping previews while offscreen so scrolling stays smooth.
  if (hasIO) {
    var player = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var video = entry.target;
        if (entry.isIntersecting) {
          var p = video.play();
          if (p && p.catch) p.catch(function () {});
        } else {
          video.pause();
        }
      });
    });
    document.querySelectorAll('video[autoplay]').forEach(function (v) { player.observe(v); });
  }

  document.addEventListener('click', function (e) {
    var back = e.target.closest('a.back');
    if (!back || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (shouldUseHistoryBack(document.referrer, location.origin, history.length)) {
      e.preventDefault();
      history.back();
    }
  });
})();
