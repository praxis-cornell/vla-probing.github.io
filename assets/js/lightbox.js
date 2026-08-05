// Figure lightbox: every result/diagram image opens in a full-screen overlay
// rendered at >=1000px wide with two-axis panning, so the wide paper-style
// panels stay inspectable on phones. Tap the backdrop, the ×, or press Escape
// to close.
(function () {
  var overlay, imgEl;

  function ensureOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML =
      '<button class="lightbox-close" aria-label="Close image">&times;</button>' +
      '<div class="lightbox-scroll"><img class="lightbox-img" alt=""></div>';
    document.body.appendChild(overlay);
    imgEl = overlay.querySelector('.lightbox-img');

    overlay.addEventListener('click', function (e) {
      // The image itself is the only click-through-safe area (it pans).
      if (e.target !== imgEl) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  function open(src, alt) {
    imgEl.src = src;
    imgEl.alt = alt || '';
    overlay.classList.add('is-open');
    document.body.classList.add('lightbox-lock');
  }

  function close() {
    overlay.classList.remove('is-open');
    document.body.classList.remove('lightbox-lock');
  }

  document.addEventListener('DOMContentLoaded', function () {
    ensureOverlay();
    var selector = '.figure-card img, .rollout-figure, .teaser-image, .def-image';
    document.querySelectorAll(selector).forEach(function (img) {
      img.classList.add('lightbox-zoomable');
      img.addEventListener('click', function () {
        open(img.currentSrc || img.src, img.alt);
      });
    });
  });
})();
