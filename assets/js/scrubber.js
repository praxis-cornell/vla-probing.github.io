// Frame-sequence scrubber: preloads a directory of numbered JPEG frames and
// renders them to a <canvas>, driven by a scrub bar plus forward/reverse
// playback. Because every frame is a plain preloaded <img>, once loading
// finishes there is no network activity left to stall on — scrubbing and
// playback are just canvas redraws.
(function () {
  function pad(n, digits) {
    return String(n).padStart(digits, '0');
  }

  function initScrubber(root) {
    var dir = root.dataset.dir;
    var count = parseInt(root.dataset.count, 10);
    var fps = parseFloat(root.dataset.fps) || 10;
    var digits = parseInt(root.dataset.digits, 10) || 4;
    var ext = root.dataset.ext || 'jpg';
    var width = parseInt(root.dataset.width, 10);
    var height = parseInt(root.dataset.height, 10);

    var canvas = root.querySelector('.scrubber-canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;

    var loadingEl = root.querySelector('.scrubber-loading');
    var loadingFill = root.querySelector('.scrubber-loading-fill');
    var loadingLabel = root.querySelector('.scrubber-loading-label');
    var range = root.querySelector('.scrubber-range');
    var counter = root.querySelector('.scrubber-counter');
    var playBtn = root.querySelector('.scrubber-play');
    var reverseBtn = root.querySelector('.scrubber-reverse');

    range.min = 0;
    range.max = count - 1;
    range.value = 0;
    counter.textContent = '1 / ' + count;

    var frames = new Array(count);
    var loaded = 0;
    var index = 0;
    var playing = null; // null | 'forward' | 'reverse'
    var rafId = null;
    var lastTick = 0;
    var frameInterval = 1000 / fps;

    function draw(i) {
      if (frames[i] && frames[i].complete) {
        ctx.drawImage(frames[i], 0, 0, width, height);
      }
      range.value = i;
      counter.textContent = (i + 1) + ' / ' + count;
    }

    function setIndex(i) {
      index = ((i % count) + count) % count;
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
    for (var i = 0; i < count; i++) {
      (function (idx) {
        var img = new Image();
        img.onload = img.onerror = function () {
          loaded++;
          var pct = Math.round((loaded / count) * 100);
          loadingFill.style.width = pct + '%';
          loadingLabel.textContent = 'Loading… ' + pct + '%';
          if (idx === 0) draw(0);
          if (loaded === count) {
            loadingEl.classList.add('is-hidden');
            root.classList.add('is-ready');
          }
        };
        img.src = dir + '/frame_' + pad(idx + 1, digits) + '.' + ext;
        frames[idx] = img;
      })(i);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var roots = document.querySelectorAll('.scrubber');
    if (!('IntersectionObserver' in window)) {
      roots.forEach(initScrubber);
      return;
    }
    // Preload each scrubber's frames only once it's about to scroll into
    // view, rather than fronting the full multi-clip payload on page load.
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
          initScrubber(entry.target);
        }
      });
    }, { rootMargin: '150% 0px' });
    roots.forEach(function (root) { observer.observe(root); });
  });
})();
