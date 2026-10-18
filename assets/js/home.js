(function () {
  // Scenes: each full-screen section fades its elements in as it reaches the
  // middle of the screen, and back out as it leaves. The dots on the right
  // follow along. Without IntersectionObserver nothing is hidden at all.
  var scenes = document.querySelectorAll('.scene');
  var dots = document.querySelectorAll('.scene-dots__dot');
  if (!scenes.length || !('IntersectionObserver' in window)) return;

  document.documentElement.classList.add('scenes');

  // "In" while the scene covers the middle band of the screen.
  var fader = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      entry.target.classList.toggle('is-in', entry.isIntersecting);
    });
  }, { rootMargin: '-30% 0px -30% 0px' });

  // The current dot is the scene crossing the exact middle line.
  var tracker = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var id = entry.target.id;
      dots.forEach(function (d) { d.classList.toggle('is-active', d.getAttribute('href') === '#' + id); });
    });
  }, { rootMargin: '-50% 0px -50% 0px' });

  scenes.forEach(function (s) {
    fader.observe(s);
    tracker.observe(s);
  });
})();

(function () {
  // Level select: hovering or focusing a highlight tile swaps the shared
  // background to that piece (its looping video if it has one, else its still).
  var video = document.querySelector('.title__video');
  var levels = document.querySelectorAll('.level');
  if (!video || !levels.length) return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    video.removeAttribute('autoplay');
    video.pause();
  }

  function select(level) {
    levels.forEach(function (l) { l.classList.toggle('is-active', l === level); });
    var src = level.getAttribute('data-video');
    var poster = level.getAttribute('data-poster');
    if ((video.getAttribute('src') || null) === src && video.getAttribute('poster') === poster) return;

    video.setAttribute('poster', poster);
    if (src) {
      video.setAttribute('src', src);
      if (!reduceMotion) {
        var p = video.play();
        if (p && p.catch) p.catch(function () {});
      }
    } else {
      video.removeAttribute('src');
      video.load(); // drop the old frame so the new poster shows
    }
  }

  levels.forEach(function (level) {
    level.addEventListener('mouseenter', function () { select(level); });
    level.addEventListener('focus', function () { select(level); });
  });
})();
