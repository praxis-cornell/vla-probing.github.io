// Peek carousel: the slides are real cards sitting side by side in one wide
// flex row, and the viewport is a window narrower than that row. Navigating
// slides the whole row until the active card is centered; whatever of its
// neighbours the viewport still spans is the peek. Driven by arrows, dots,
// clicking a peeking card, touch swipes, or horizontal trackpad scrolling —
// the wheel path drags the row continuously like a scrollbar and snaps to
// the nearest card when the gesture ends.
//
// The definitions carousel (.carousel--swap) shares all of this; it differs
// only in CSS (its cards carry .def-card-shell chrome and stretch to equal
// heights) and in skipping the viewport height animation.
(function () {
  function initCarousel(root) {
    var track = root.querySelector('.carousel-track');
    var viewport = root.querySelector('.carousel-viewport');
    var slides = Array.prototype.slice.call(root.querySelectorAll('.carousel-slide'));
    var prevBtn = root.querySelector('.carousel-prev');
    var nextBtn = root.querySelector('.carousel-next');
    var dotsWrap = root.querySelector('.carousel-dots');
    var swap = root.classList.contains('carousel--swap');
    var shell = root.querySelector('.carousel-shell');
    var shellBaseClass = shell ? shell.className.replace(/\baccent-\S+\b/g, '').replace(/\s+/g, ' ').trim() : null;
    var head = root.querySelector('.carousel-head');
    var headIndexEl = head ? head.querySelector('.carousel-index') : null;
    var headMeterDots = head ? Array.prototype.slice.call(head.querySelectorAll('.carousel-meter span')) : [];
    var index = 0;
    var dots = [];

    // The index badge and meter bars live once per carousel (not once per
    // slide), so they stay put while the cards slide underneath.
    function syncHead() {
      if (!headIndexEl && headMeterDots.length === 0) return;
      var n = index + 1;
      if (headIndexEl) {
        headIndexEl.textContent = (n < 10 ? '0' : '') + n;
        headIndexEl.classList.remove('is-updating');
        void headIndexEl.offsetWidth;
        headIndexEl.classList.add('is-updating');
      }
      headMeterDots.forEach(function (dot, i) { dot.classList.toggle('on', i <= index); });
    }

    // Swap mode only: the active definition's accent color (gold / blue
    // / violet) is read off the slide and applied to the shell, since the
    // shell itself doesn't change per slide otherwise.
    function syncAccent() {
      if (!shell) return;
      var accent = slides[index].dataset.accent;
      shell.className = shellBaseClass + (accent ? ' accent-' + accent : '');
    }

    // Figure carousels only: the viewport hugs the active card's height so a
    // short figure isn't framed by a tall empty window (taller neighbours
    // just get cropped — they're previews). Height is border-box, so the
    // viewport's own padding has to be added back in.
    function resizeViewport() {
      if (swap || !viewport) return;
      var cs = getComputedStyle(viewport);
      var pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
      viewport.style.height = (slides[index].offsetHeight + pad) + 'px';
    }

    // Track offset (px) that puts card i's midpoint at the viewport's.
    function centerOffsetFor(i) {
      var card = slides[i];
      return (viewport.clientWidth / 2) - (card.offsetLeft + card.offsetWidth / 2);
    }

    function centerActive() {
      if (!viewport || !track) return;
      track.style.transform = 'translateX(' + centerOffsetFor(index) + 'px)';
    }

    // Update which card is highlighted (classes, header, accent, dots,
    // viewport height) without moving the track — motion is separate so the
    // wheel path can highlight live mid-drag.
    function setIndex(i) {
      index = i;
      slides.forEach(function (s, si) { s.classList.toggle('is-active', si === index); });
      dots.forEach(function (d, di) { d.classList.toggle('is-active', di === index); });
      syncHead();
      syncAccent();
      resizeViewport();
    }

    function goTo(i) {
      var newIndex = ((i % slides.length) + slides.length) % slides.length;
      if (newIndex !== index) setIndex(newIndex);
      centerActive();
    }

    function render() {
      setIndex(index);
      centerActive();
    }

    if (slides.length <= 1) {
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
      if (slides[0]) slides[0].classList.add('is-active');
      syncHead();
      syncAccent();
      resizeViewport(); // lone card centers itself via :only-child margins
      window.addEventListener('load', resizeViewport); // re-measure once images settle
      return;
    }

    dots = slides.map(function (_, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', 'Go to figure ' + (i + 1));
      dot.addEventListener('click', function () { goTo(i); });
      dotsWrap.appendChild(dot);
      return dot;
    });

    prevBtn.addEventListener('click', function () { goTo(index - 1); });
    nextBtn.addEventListener('click', function () { goTo(index + 1); });

    // Clicking a peeking card brings it to the center — the sliver is a
    // target, not just decoration.
    slides.forEach(function (s, si) {
      s.addEventListener('click', function () {
        if (si !== index) goTo(si);
      });
    });

    // Basic touch swipe: dragging left advances forward, right goes back.
    var startX = null;
    track.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) goTo(index + (dx < 0 ? 1 : -1));
      startX = null;
    });

    // Horizontal trackpad scrolling, scrollbar-style: the row follows the
    // gesture continuously in either direction (clamped at the first/last
    // card), the nearest card highlights live, and when the event stream
    // goes idle the row snaps that card to center. Only horizontal-dominant
    // wheel events are claimed — vertical ones stay with the page.
    var scrollPos = null;
    var wheelIdleTimer = null;
    viewport.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();

      if (scrollPos === null) scrollPos = centerOffsetFor(index);
      scrollPos -= e.deltaX;
      var last = centerOffsetFor(slides.length - 1);
      var first = centerOffsetFor(0);
      scrollPos = Math.min(Math.max(scrollPos, Math.min(first, last)), Math.max(first, last));

      track.style.transition = 'none';
      track.style.transform = 'translateX(' + scrollPos + 'px)';

      // Highlight whichever card is nearest the center as the row drags.
      var nearest = 0;
      var bestDist = Infinity;
      for (var i = 0; i < slides.length; i++) {
        var d = Math.abs(centerOffsetFor(i) - scrollPos);
        if (d < bestDist) { bestDist = d; nearest = i; }
      }
      if (nearest !== index) setIndex(nearest);

      clearTimeout(wheelIdleTimer);
      wheelIdleTimer = setTimeout(function () {
        scrollPos = null;
        track.style.transition = '';
        centerActive(); // snap the nearest card the rest of the way
      }, 120);
    }, { passive: false });

    // Initial paint: the row starts left-aligned, so the first centering is
    // a real transform change — suppress the transition or the carousel
    // slides itself into place on every page load.
    track.style.transition = 'none';
    if (viewport) viewport.style.transition = 'none';
    render();
    void track.offsetWidth;
    track.style.transition = '';
    if (viewport) viewport.style.transition = '';

    window.addEventListener('resize', render); // card widths are %-based
    window.addEventListener('load', render); // re-measure once images settle
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.carousel').forEach(initCarousel);
  });
})();
