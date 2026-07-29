// Minimal click-through carousel: one slide visible at a time, navigated
// with prev/next arrows or the dot indicators.
//
// Two visual modes, both driven by the same index/dots/direction logic:
//  - default: slides sit side by side in a flex track that translates.
//  - "swap" (.carousel--swap): slides are stacked in one fixed-size shell
//    and the active one is swiped out while the next swipes in, so the
//    frame itself (card border/shadow/accent color) never moves or resizes.
(function () {
  function initCarousel(root) {
    var track = root.querySelector('.carousel-track');
    var slides = Array.prototype.slice.call(root.querySelectorAll('.carousel-slide'));
    var prevBtn = root.querySelector('.carousel-prev');
    var nextBtn = root.querySelector('.carousel-next');
    var dotsWrap = root.querySelector('.carousel-dots');
    var swap = root.classList.contains('carousel--swap');
    var shell = root.querySelector('.carousel-shell');
    var shellBaseClass = shell ? shell.className.replace(/\blevel-\d+\b/g, '').replace(/\s+/g, ' ').trim() : null;
    var shellIndexEl = shell ? shell.querySelector('.def-head .def-index') : null;
    var shellMeterDots = shell ? Array.prototype.slice.call(shell.querySelectorAll('.def-head .def-meter span')) : [];
    var index = 0;
    var animating = false;

    // The index badge and meter bars live once in the shell (not per slide),
    // so they stay put while only the eyebrow/title/image/body swipe.
    function syncShell() {
      if (!shell) return;
      var level = slides[index].dataset.level;
      shell.className = shellBaseClass + (level ? ' level-' + level : '');
      if (!level) return;
      var n = parseInt(level, 10);
      if (shellIndexEl) {
        shellIndexEl.textContent = (n < 10 ? '0' : '') + n;
        shellIndexEl.classList.remove('is-updating');
        void shellIndexEl.offsetWidth;
        shellIndexEl.classList.add('is-updating');
      }
      shellMeterDots.forEach(function (dot, i) { dot.classList.toggle('on', i < n); });
    }

    if (slides.length <= 1) {
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
      if (swap && slides[0]) {
        slides[0].classList.add('is-active');
        slides[0].style.opacity = '1';
      }
      syncShell();
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

      if (swap) {
        swipeTo(newIndex, forward);
      } else {
        track.style.transform = 'translateX(-' + (newIndex * 100) + '%)';
      }

      index = newIndex;
      syncShell();
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
    if (swap) {
      slides.forEach(function (s, si) {
        var active = si === 0;
        s.classList.toggle('is-active', active);
        s.style.opacity = active ? '1' : '0';
        s.style.pointerEvents = active ? 'auto' : 'none';
      });
    } else {
      track.style.transform = 'translateX(0%)';
    }
    syncShell();
    dots[0].classList.add('is-active');
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.carousel').forEach(initCarousel);
  });
})();
