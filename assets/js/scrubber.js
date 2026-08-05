// Frame-sequence scrubber: preloads a directory of numbered JPEG frames and
// renders them to a <canvas>, driven by a scrub bar plus forward/reverse
// playback. Because every frame is a plain preloaded <img>, once loading
// finishes there is no network activity left to stall on — scrubbing and
// playback are just canvas redraws.
//
// Mobile behavior:
// - On touch devices (and under Save-Data), only the first frame loads as a
//   poster; the full multi-MB sequence waits for an explicit tap.
// - A scrubber may declare a lighter phone-sized frame set via
//   data-dir-mobile (plus optional data-width-mobile / data-height-mobile /
//   data-count-mobile / data-ext-mobile); it is used at <=768px widths and
//   ignored when absent.
(function () {
  var IS_MOBILE = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
  var IS_COARSE = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  var SAVE_DATA = !!(navigator.connection && navigator.connection.saveData);
  var DEFER_LOAD = IS_COARSE || SAVE_DATA;

  function pad(n, digits) {
    return String(n).padStart(digits, '0');
  }

  function readConfig(root) {
    var d = root.dataset;
    var mobile = IS_MOBILE && d.dirMobile;
    return {
      dir: mobile ? d.dirMobile : d.dir,
      count: parseInt((mobile && d.countMobile) || d.count, 10),
      fps: parseFloat(d.fps) || 10,
      digits: parseInt(d.digits, 10) || 4,
      ext: (mobile && d.extMobile) || d.ext || 'jpg',
      width: parseInt((mobile && d.widthMobile) || d.width, 10),
      height: parseInt((mobile && d.heightMobile) || d.height, 10)
    };
  }

  function frameSrc(cfg, idx) {
    return cfg.dir + '/frame_' + pad(idx + 1, cfg.digits) + '.' + cfg.ext;
  }

  function initScrubber(root) {
    if (root.dataset.scrubberInit) return;
    root.dataset.scrubberInit = '1';

    var cfg = readConfig(root);
    var canvas = root.querySelector('.scrubber-canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = cfg.width;
    canvas.height = cfg.height;

    var loadingEl = root.querySelector('.scrubber-loading');
    var loadingFill = root.querySelector('.scrubber-loading-fill');
    var loadingLabel = root.querySelector('.scrubber-loading-label');
    var range = root.querySelector('.scrubber-range');
    var counter = root.querySelector('.scrubber-counter');
    var playBtn = root.querySelector('.scrubber-play');
    var reverseBtn = root.querySelector('.scrubber-reverse');

    range.min = 0;
    range.max = cfg.count - 1;
    range.value = 0;
    counter.textContent = '1 / ' + cfg.count;

    var frames = new Array(cfg.count);
    var loaded = 0;
    var index = 0;
    var playing = null; // null | 'forward' | 'reverse'
    var rafId = null;
    var lastTick = 0;
    var frameInterval = 1000 / cfg.fps;

    function draw(i) {
      if (frames[i] && frames[i].complete) {
        ctx.drawImage(frames[i], 0, 0, cfg.width, cfg.height);
      }
      range.value = i;
      counter.textContent = (i + 1) + ' / ' + cfg.count;
    }

    function setIndex(i) {
      index = ((i % cfg.count) + cfg.count) % cfg.count;
      draw(index);
    }

    function stop() {
      playing = null;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      playBtn.classList.remove('is-active');
      reverseBtn.classList.remove('is-active');
      playBtn.textContent = '▶';
      reverseBtn.textContent = '◀';
    }

    function tick(ts) {
      if (!playing) return;
      if (!lastTick) lastTick = ts;
      var elapsed = ts - lastTick;
      if (elapsed >= frameInterval) {
        lastTick = ts;
        setIndex(index + (playing === 'forward' ? 1 : -1));
      }
      rafId = requestAnimationFrame(tick);
    }

    function play(direction) {
      if (playing === direction) {
        stop();
        return;
      }
      playing = direction;
      lastTick = 0;
      playBtn.classList.toggle('is-active', direction === 'forward');
      reverseBtn.classList.toggle('is-active', direction === 'reverse');
      playBtn.textContent = direction === 'forward' ? '⏸' : '▶';
      reverseBtn.textContent = direction === 'reverse' ? '⏸' : '◀';
      if (rafId === null) rafId = requestAnimationFrame(tick);
    }

    playBtn.addEventListener('click', function () { play('forward'); });
    reverseBtn.addEventListener('click', function () { play('reverse'); });

    range.addEventListener('input', function () {
      stop();
      setIndex(parseInt(range.value, 10));
    });

    // Preload every frame up front.
    for (var i = 0; i < cfg.count; i++) {
      (function (idx) {
        var img = new Image();
        img.onload = img.onerror = function () {
          loaded++;
          var pct = Math.round((loaded / cfg.count) * 100);
          loadingFill.style.width = pct + '%';
          loadingLabel.textContent = 'Loading… ' + pct + '%';
          if (idx === 0) draw(0);
          if (loaded === cfg.count) {
            loadingEl.classList.add('is-hidden');
            root.classList.add('is-ready');
          }
        };
        img.src = frameSrc(cfg, idx);
        frames[idx] = img;
      })(i);
    }
  }

  // Deferred start: draw only the first frame as a poster behind a
  // "tap to load" overlay, and run the full preload on tap.
  function deferScrubber(root) {
    var cfg = readConfig(root);
    var canvas = root.querySelector('.scrubber-canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = cfg.width;
    canvas.height = cfg.height;

    var poster = new Image();
    poster.onload = function () {
      ctx.drawImage(poster, 0, 0, cfg.width, cfg.height);
    };
    poster.src = frameSrc(cfg, 0);

    var loadingEl = root.querySelector('.scrubber-loading');
    var loadingBar = root.querySelector('.scrubber-loading-bar');
    var loadingLabel = root.querySelector('.scrubber-loading-label');
    loadingBar.style.display = 'none';
    loadingLabel.textContent = 'Tap to load clip ▶';
    loadingEl.classList.add('is-deferred');

    loadingEl.addEventListener('click', function onTap() {
      loadingEl.removeEventListener('click', onTap);
      loadingEl.classList.remove('is-deferred');
      loadingBar.style.display = '';
      loadingLabel.textContent = 'Loading… 0%';
      initScrubber(root);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var roots = document.querySelectorAll('.scrubber');
    var start = DEFER_LOAD ? deferScrubber : initScrubber;
    if (!('IntersectionObserver' in window)) {
      roots.forEach(start);
      return;
    }
    // Start each scrubber only once it's about to scroll into view, rather
    // than fronting the full multi-clip payload on page load.
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
          start(entry.target);
        }
      });
    }, { rootMargin: '150% 0px' });
    roots.forEach(function (root) { observer.observe(root); });
  });
})();
