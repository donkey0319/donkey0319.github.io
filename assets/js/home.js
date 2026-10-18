(function () {
  // Level select: hovering or focusing a highlight tile swaps the title
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
