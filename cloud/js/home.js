/* UNSHARED — homepage: Möbius lemniscate hero (Three.js) + section scroll spy */
(function () {
  'use strict';

  var SPIN_SECONDS = 25;   // one full infinity ⇌ hourglass turn
  var TWIST_DEG = 180;     // Möbius half twist
  var FOLLOW_POINTER = true;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------ hero */
  var stage = document.getElementById('hero-stage');
  var canvas = document.querySelector('canvas[data-tlc-hero]');
  var fallback = document.getElementById('hero-fallback');
  var mx = 0, my = 0, tx = 0, ty = 0;

  function showFallback() {
    if (fallback) fallback.hidden = false;
    if (canvas) canvas.style.display = 'none';
  }

  if (stage) {
    stage.addEventListener('mousemove', function (e) {
      var r = stage.getBoundingClientRect();
      mx = ((e.clientX - (r.left + r.width / 2)) / Math.max(1, r.width / 2)) * 0.3;
      my = ((e.clientY - (r.top + r.height / 2)) / Math.max(1, r.height / 2)) * 0.3;
    });
    stage.addEventListener('mouseleave', function () { mx = 0; my = 0; });
  }

  // 3D figure-8 path with a ribbon cross-section and a Möbius twist
  function buildRibbon() {
    var uSegments = 250, vSegments = 30, ribbonWidth = 1.35;
    var A = 3.6, B = 1.8, C = 1.2;
    var twistTotal = TWIST_DEG * Math.PI / 180;
    var positions = new Float32Array((uSegments + 1) * (vSegments + 1) * 3);
    var colors = new Float32Array((uSegments + 1) * (vSegments + 1) * 3);
    var o = 0;
    for (var i = 0; i <= uSegments; i++) {
      var u = (i / uSegments) * Math.PI * 2;
      var cx = A * Math.sin(u), cy = B * Math.sin(2 * u), cz = C * Math.cos(u);
      var tx0 = A * Math.cos(u), ty0 = 2 * B * Math.cos(2 * u), tz0 = -C * Math.sin(u);
      var tLen = Math.sqrt(tx0 * tx0 + ty0 * ty0 + tz0 * tz0) || 1;
      var tnx = tx0 / tLen, tny = ty0 / tLen, tnz = tz0 / tLen;
      var nx = -tnz, ny = 0, nz = tnx;
      var nLen = Math.sqrt(nx * nx + ny * ny + nz * nz);
      if (nLen === 0) { nx = 1; ny = 0; nz = 0; nLen = 1; }
      nx /= nLen; ny /= nLen; nz /= nLen;
      var bx = tny * nz - tnz * ny, by = tnz * nx - tnx * nz, bz = tnx * ny - tny * nx;
      var twist = (u / (Math.PI * 2)) * twistTotal;
      var ct = Math.cos(twist), st = Math.sin(twist);
      var rx = nx * ct + bx * st, ry = ny * ct + by * st, rz = nz * ct + bz * st;
      var g = 0.5 + 0.5 * ((Math.sin(u * 2) + 1) * 0.5); // mid grey → white
      for (var j = 0; j <= vSegments; j++) {
        var v = (j / vSegments - 0.5) * ribbonWidth;
        positions[o] = cx + v * rx;
        positions[o + 1] = cy + v * ry;
        positions[o + 2] = cz + v * rz;
        colors[o] = g; colors[o + 1] = g; colors[o + 2] = g;
        o += 3;
      }
    }
    var index = [];
    for (var a = 0; a < uSegments; a++) {
      for (var b = 0; b < vSegments; b++) {
        var p0 = a * (vSegments + 1) + b;
        var p1 = (a + 1) * (vSegments + 1) + b;
        index.push(p0, p1, p0 + 1, p1, p1 + 1, p0 + 1);
      }
    }
    return { positions: positions, colors: colors, index: index };
  }

  function initHero() {
    var THREE = window.THREE;
    if (!THREE || !canvas || !stage) { showFallback(); return; }
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    } catch (err) {
      showFallback();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 0, 12);

    var built = buildRibbon();
    var pos = new THREE.BufferAttribute(built.positions, 3);
    var col = new THREE.BufferAttribute(built.colors, 3);
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', pos);
    geo.setAttribute('color', col);
    geo.setIndex(built.index);
    var pgeo = new THREE.BufferGeometry();
    pgeo.setAttribute('position', pos);
    pgeo.setAttribute('color', col);
    var wire = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, wireframe: true, transparent: true, opacity: 0.15, depthWrite: false }));
    var pts = new THREE.Points(pgeo, new THREE.PointsMaterial({ size: 0.04, vertexColors: true, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
    scene.add(wire);
    scene.add(pts);

    function fit() {
      var w = Math.max(1, stage.clientWidth), h = Math.max(1, stage.clientHeight);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // keep the ring as large as possible while the vertical hourglass still fits
      camera.position.z = 11.2 * Math.max(1, 1 / camera.aspect);
      camera.updateProjectionMatrix();
    }
    fit();
    if (window.ResizeObserver) new ResizeObserver(fit).observe(stage);
    else window.addEventListener('resize', fit);

    var start = performance.now();
    function draw(now) {
      var t = (now - start) / 1000;
      wire.rotation.z = t * (Math.PI * 2 / SPIN_SECONDS);   // infinity ⇌ hourglass
      wire.rotation.x = Math.sin(t * 0.4) * 0.2;            // gentle sway reveals the saddle
      wire.rotation.y = Math.cos(t * 0.3) * 0.15;
      pts.rotation.copy(wire.rotation);
      tx += ((FOLLOW_POINTER ? mx : 0) - tx) * 0.05;
      ty += ((FOLLOW_POINTER ? my : 0) - ty) * 0.05;
      scene.rotation.y = tx * 1.5;
      scene.rotation.x = ty * 1.5;
      renderer.render(scene, camera);
    }

    if (reduceMotion) {
      draw(start);
      return;
    }

    // only animate while the hero is on screen and the tab is visible
    var raf = 0, onScreen = true;
    function loop(now) { draw(now); raf = requestAnimationFrame(loop); }
    function sync() {
      var run = onScreen && !document.hidden;
      if (run && !raf) raf = requestAnimationFrame(loop);
      if (!run && raf) { cancelAnimationFrame(raf); raf = 0; }
    }
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
        sync();
      }).observe(stage);
    }
    document.addEventListener('visibilitychange', sync);
    sync();
    stage.setAttribute('data-hero-ready', '1');
  }

  if (window.THREE) initHero();
  else window.addEventListener('load', initHero);

  /* ------------------------------------------------------------ scroll spy */
  var nav = document.querySelector('[data-spy-nav]');
  if (!nav) return;
  var track = nav.querySelector('.spy-wrap');
  var bar = document.getElementById('spy-bar');
  var links = Array.prototype.slice.call(nav.querySelectorAll('[data-spy-link]'));
  var ids = links.map(function (a) { return a.getAttribute('data-spy-link'); });
  var last = null, pending = 0;

  function update() {
    pending = 0;
    var line = nav.getBoundingClientRect().bottom + 80;
    var active = null;
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= line) active = id;
    });
    links.forEach(function (a) {
      if (a.getAttribute('data-spy-link') === active) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    if (active) {
      var cur = nav.querySelector('[data-spy-link="' + active + '"]');
      bar.style.left = cur.offsetLeft + 'px';
      bar.style.width = cur.offsetWidth + 'px';
      bar.style.opacity = '1';
      // phones: keep the active tab visible in the horizontally scrolling bar
      if (active !== last && track.scrollWidth > track.clientWidth + 1) {
        track.scrollTo({ left: cur.offsetLeft - (track.clientWidth - cur.offsetWidth) / 2, behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    } else {
      bar.style.opacity = '0';
    }
    last = active;
  }
  function schedule() { if (!pending) pending = requestAnimationFrame(update); }

  links.forEach(function (a) {
    a.addEventListener('click', function (e) {
      var el = document.getElementById(a.getAttribute('data-spy-link'));
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      if (history.replaceState) history.replaceState(null, '', '#' + el.id);
    });
  });
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('load', schedule);
  schedule();
})();
