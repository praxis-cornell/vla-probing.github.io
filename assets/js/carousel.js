// Minimal click-through carousel: one slide visible at a time, navigated
// with prev/next arrows or the dot indicators. Slides are stacked on top of
// each other (not laid out side by side), and swipeTo() animates the active
// one out while the next one animates in from the requested side.
//
// Two visual modes:
//  - default: each slide is sized to its own content, and the viewport
//    animates its height to match whichever slide is active (see
//    resizeViewport) so the border hugs the current image instead of always
//    reserving space for the tallest one.
//  - "swap" (.carousel--swap): slides are grid-stacked inside one fixed
//    card shell whose height stays constant (the tallest of the three,
//    via normal CSS auto-sizing) — used for the "big center card" that
//    swipes between the three definitions without resizing itself.
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
    var animating = false;

    // The index badge and meter bars live once per carousel (not once per
    // slide), so they stay put while only the eyebrow/title/image/body
    // swipe underneath. Works the same whether .carousel-head sits inside
    // the swap-mode shell or directly in a plain figure carousel.
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

    // Swap mode only: the active definition's accent color (red / blue
    // / violet) is read off the slide and applied to the shell, since the
    // shell itself doesn't change per slide otherwise.
    function syncAccent() {
      if (!shell) return;
      var accent = slides[index].dataset.accent;
      shell.className = shellBaseClass + (accent ? ' accent-' + accent : '');
    }

    // Default mode only: each slide's height is its own content height
    // (see CSS — slides are position:absolute, not stretched to match
    // siblings), so this always reflects the *active* slide, not the
    // tallest of the bunch.
    function resizeViewport(i) {
      if (swap || !viewport) return;
      viewport.style.height = slides[i].offsetHeight + 'px';
    }

    if (slides.length <= 1) {
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
      if (slides[0]) {
        slides[0].classList.add('is-active');
        slides[0].style.opacity = '1';
        slides[0].style.pointerEvents = 'auto';
      }
      syncHead();
      syncAccent();
      resizeViewport(0);
      return;
    }

    var dots = slides.map(function (_, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', 'Go to figure ' + (i + 1));
      dot.addEventListener('click', function () { goTo(i); });
      dotsWrap.appendChild(dot);
      return dot;
    });

    function swipeTo(newIndex, forward) {
      var oldSlide = slides[index];
      var newSlide = slides[newIndex];
      var dir = forward ? 1 : -1;
      animating = true;

      // Snap the incoming slide just off the entry edge, fully opaque, with
      // transitions disabled so this positioning jump isn't itself animated.
      newSlide.style.transition = 'none';
      newSlide.style.opacity = '1';
      newSlide.style.pointerEvents = 'auto';
      newSlide.style.transform = 'translateX(' + (dir * 100) + '%)';
      newSlide.classList.add('is-active');
      void newSlide.offsetWidth; // force reflow so the snap applies first
      newSlide.style.transition = '';

      oldSlide.style.opacity = '1';
      oldSlide.style.pointerEvents = 'none';
      oldSlide.classList.remove('is-active');

      resizeViewport(newIndex);

      requestAnimationFrame(function () {
        oldSlide.style.transform = 'translateX(' + (-dir * 100) + '%)';
        newSlide.style.transform = 'translateX(0)';
      });

      var onDone = function (e) {
        if (e.target !== newSlide || e.propertyName !== 'transform') return;
        newSlide.removeEventListener('transitionend', onDone);
        oldSlide.style.transition = 'none';
        oldSlide.style.transform = 'translateX(0)';
        oldSlide.style.opacity = '0';
        void oldSlide.offsetWidth;
        oldSlide.style.transition = '';
        animating = false;
      };
      newSlide.addEventListener('transitionend', onDone);
    }

    function goTo(i, forward) {
      if (animating) return;
      var newIndex = ((i % slides.length) + slides.length) % slides.length;
      if (newIndex === index) return;
      if (typeof forward !== 'boolean') forward = newIndex > index;

      swipeTo(newIndex, forward);

      index = newIndex;
      syncHead();
      syncAccent();
      dots.forEach(function (d, di) { d.classList.toggle('is-active', di === index); });
    }

    prevBtn.addEventListener('click', function () { goTo(index - 1, false); });
    nextBtn.addEventListener('click', function () { goTo(index + 1, true); });

    // Basic touch swipe: dragging left advances forward, right goes back.
    var startX = null;
    track.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) goTo(index + (dx < 0 ? 1 : -1), dx < 0);
      startX = null;
    });

    // Initial paint: show slide 0 directly, no animation, no "old slide" yet.
    slides.forEach(function (s, si) {
      var active = si === 0;
      s.classList.toggle('is-active', active);
      s.style.opacity = active ? '1' : '0';
      s.style.pointerEvents = active ? 'auto' : 'none';
    });
    resizeViewport(0);
    if (!swap) window.addEventListener('resize', function () { resizeViewport(index); });
    syncHead();
    syncAccent();
    dots[0].classList.add('is-active');
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.carousel').forEach(initCarousel);
  });
})();
