// Scroll progress bar: the bar carries a full-width gradient whose color
// stops are computed from the real page positions of the sections, each in
// its section's accent color, with progress revealed via clip-path. The
// leading edge therefore always matches the section currently on screen.
// Updates are batched through requestAnimationFrame off passive listeners.
(function () {
  var bar;
  var maxScroll = 0;

  // Section anchor → accent CSS variable, in page order. The definitions
  // get their three per-term accents so the bar mirrors the gold/blue/violet
  // walk before it repeats for the matching result sections.
  var SECTIONS = [
    ['.hero-flow', '--carnelian'],
    ['.def-block.accent-gold', '--gold'],
    ['.def-block.accent-blue', '--blue-energy'],
    ['.def-block.accent-violet', '--neon-violet'],
    ['#method', '--carnelian'],
    ['#weak', '--gold'],
    ['#strong', '--blue-energy'],
    ['#steerability', '--neon-violet'],
    ['#ood', '--detect-green'],
    ['#resources', '--carnelian']
  ];

  // Percent of the bar over which one section's color blends into the next;
  // between blends each color holds solid.
  var BLEND = 2;

  function rebuildGradient() {
    var doc = document.documentElement;
    maxScroll = doc.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) return;

    var rootStyle = getComputedStyle(doc);
    var stops = [];
    SECTIONS.forEach(function (entry) {
      var el = document.querySelector(entry[0]);
      var color = rootStyle.getPropertyValue(entry[1]).trim();
      if (!el || !color) return;
      // A section "arrives" when its top reaches the upper third of the
      // viewport — the moment a reader would say they're in it.
      var top = el.getBoundingClientRect().top + window.scrollY;
      var f = (top - window.innerHeight * 0.35) / maxScroll;
      stops.push({ at: Math.min(1, Math.max(0, f)) * 100, color: color });
    });
    if (!stops.length) return;
    stops.sort(function (a, b) { return a.at - b.at; });

    var parts = [];
    for (var i = 0; i < stops.length; i++) {
      var hold = stops[i].at + (i === 0 ? 0 : BLEND);
      var release = i === stops.length - 1
        ? 100
        : Math.max(hold, stops[i + 1].at - BLEND);
      parts.push(stops[i].color + ' ' + hold.toFixed(2) + '%');
      parts.push(stops[i].color + ' ' + release.toFixed(2) + '%');
    }
    bar.style.backgroundImage = 'linear-gradient(90deg, ' + parts.join(', ') + ')';
  }

  function update() {
    // The page height moves under us (lazy scrubbers, MathJax, image loads),
    // so verify the cached maximum before trusting it.
    var liveMax = document.documentElement.scrollHeight - window.innerHeight;
    if (Math.abs(liveMax - maxScroll) > 1) rebuildGradient();

    var y = window.scrollY;
    var p = maxScroll > 0 ? Math.min(1, Math.max(0, y / maxScroll)) : 0;
    // Fractional scroll positions can leave a sliver at the very end.
    if (maxScroll > 0 && maxScroll - y < 2) p = 1;
    var clip = 'inset(0 ' + (100 - p * 100).toFixed(3) + '% 0 0)';
    bar.style.clipPath = clip;
    bar.style.webkitClipPath = clip;
  }

  document.addEventListener('DOMContentLoaded', function () {
    bar = document.querySelector('.scroll-progress');
    if (!bar) return;

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        update();
      });
    }
    function onLayoutChange() {
      rebuildGradient();
      update();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onLayoutChange, { passive: true });
    // Section offsets settle as images and scrubber frames come in.
    window.addEventListener('load', onLayoutChange);
    // Content keeps reflowing after load (deferred scrubbers, MathJax), so
    // track the document's size directly where supported.
    if ('ResizeObserver' in window) {
      new ResizeObserver(onLayoutChange).observe(document.body);
    }

    onLayoutChange();
  });
})();
