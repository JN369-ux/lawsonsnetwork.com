// Lawsons Network — Stage 3b: opening through the mark, one globe and one colour field behind the page.
(() => {
  const body = document.body;
  document.documentElement.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const q = new URLSearchParams(location.search);
  const clean = q.has('clean');
  body.classList.toggle('clean', clean);

  // ---------- word-by-word reveal for headline and statements (text stays in the DOM, readable without JS)
  document.querySelectorAll('.split').forEach(el => {
    let i = 0;
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(part); return; }
          const w = document.createElement('span'); w.className = 'w';
          const inner = document.createElement('span'); inner.textContent = part; inner.style.setProperty('--i', i++);
          w.append(inner); frag.append(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName === 'BR') { /* keep line breaks */ }
      else if (n.nodeType === 1 && !n.classList.contains('draft')) walk(n);
    });
    walk(el);
  });

  // ---------- opening: the mark draws as one line, locks, then unlocks between the L and the N
  const intro = document.getElementById('intro');
  const seen = (() => { try { return sessionStorage.getItem('ln-intro'); } catch { return null; } })();
  let introDone = reduce || seen || q.has('nointro');
  const finishIntro = () => {
    if (introDone) return;
    introDone = true; intro.hidden = true; body.classList.remove('intro-on');
    try { sessionStorage.setItem('ln-intro', '1'); } catch {}
    revealHero();
  };
  if (!introDone) {
    intro.hidden = false; body.classList.add('intro-on');
    requestAnimationFrame(() => requestAnimationFrame(() => intro.classList.add('draw')));
    setTimeout(() => intro.classList.add('lock'), 1000);   // fills with the logo gradient, small click
    setTimeout(() => intro.classList.add('open'), 1380);   // splits between the L and the N
    setTimeout(revealHero, 1650);                          // headline starts as the halves leave
    setTimeout(finishIntro, 2450);
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(e => addEventListener(e, finishIntro, { once: true, passive: true }));
  }

  // ---------- section entrances
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -14% 0px' });
  document.querySelectorAll('.reveal, .split').forEach(el => { if (!el.closest('.hero')) io.observe(el); });
  // headline letters: each arrives from its own direction and settles into one word
  const ind = document.querySelector('.h-ind');
  if (ind) {
    const r = (i, k) => (Math.sin(i * 12.9898 + k * 78.233) * 43758.5453) % 1;
    ind.innerHTML = [...ind.textContent].map((c, i) => `<span class="lt" style="--x:${(r(i, 1) * 60).toFixed(0)}px;--y:${(r(i, 2) * 70).toFixed(0)}px;--r:${(r(i, 3) * 14).toFixed(1)}deg;--d:${(Math.abs(r(i, 4)) * .28).toFixed(2)}s">${c}</span>`).join('');
  }
  let heroShown = false;
  function revealHero() {
    if (heroShown) return; heroShown = true;
    document.querySelector('.hero-title')?.classList.add('go');
    document.querySelectorAll('.hero .reveal, .hero .split').forEach(el => el.classList.add('in'));
  }
  if (introDone) revealHero();

  // ---------- light parallax on labels and cards (content moves at slightly different speeds)
  const drift = [...document.querySelectorAll('[data-speed]')];

  // ---------- globe + colour field
  const cv = document.getElementById('globe'), g = cv.getContext('2d');
  const D = window.LN_DOTS, N = D.length / 2, rad = Math.PI / 180;
  const cl = new Float32Array(N), sl = new Float32Array(N), lo = new Float32Array(N);
  for (let i = 0; i < N; i++) { const la = D[i * 2 + 1] * rad; cl[i] = Math.cos(la); sl[i] = Math.sin(la); lo[i] = D[i * 2] * rad; }

  // The world advisers work across: major financial hubs (light blue) and offshore centres (magenta).
  // Illustrative geography, not a claim about Lawsons offices. No labels on the globe.
  const HUBS = {
    london: [-.13, 51.5], newyork: [-74, 40.7], zurich: [8.54, 47.37], frankfurt: [8.68, 50.11], paris: [2.35, 48.86],
    dubai: [55.27, 25.2], singapore: [103.8, 1.35], hongkong: [114.17, 22.3], tokyo: [139.7, 35.7], sydney: [151.2, -33.9],
    toronto: [-79.4, 43.7], johannesburg: [28.05, -26.2], mumbai: [72.88, 19.07], saopaulo: [-46.6, -23.55],
  };
  const OFFSHORE = {
    isleofman: [-4.5, 54.2], guernsey: [-2.58, 49.45], jersey: [-2.13, 49.21], dublin: [-6.26, 53.35], luxembourg: [6.13, 49.61],
    cayman: [-81.25, 19.3], bermuda: [-64.75, 32.3], bvi: [-64.6, 18.4], bahamas: [-77.35, 25.05], malta: [14.5, 35.9],
    gibraltar: [-5.35, 36.14], mauritius: [57.5, -20.2], labuan: [115.2, 5.3],
  };
  const NODES = [], idx = {};
  for (const [k, [lon, lat]] of Object.entries(HUBS)) { idx[k] = NODES.length; NODES.push({ lon, lat, hub: true }); }
  for (const [k, [lon, lat]] of Object.entries(OFFSHORE)) { idx[k] = NODES.length; NODES.push({ lon, lat, hub: false }); }
  const vec = (lon, lat) => { const c = Math.cos(lat * rad); return [c * Math.sin(lon * rad), Math.sin(lat * rad), c * Math.cos(lon * rad)]; };
  const LINKS = [
    'london-newyork', 'london-dubai', 'london-zurich', 'london-frankfurt', 'london-paris', 'london-johannesburg', 'london-toronto',
    'london-isleofman', 'london-guernsey', 'london-jersey', 'london-dublin', 'london-gibraltar', 'london-bermuda', 'london-mumbai',
    'zurich-luxembourg', 'zurich-dubai', 'frankfurt-luxembourg', 'paris-malta', 'newyork-cayman', 'newyork-bahamas', 'newyork-bvi',
    'newyork-toronto', 'newyork-saopaulo', 'dubai-mumbai', 'dubai-singapore', 'dubai-mauritius', 'dubai-johannesburg',
    'singapore-hongkong', 'singapore-sydney', 'singapore-labuan', 'hongkong-tokyo', 'mauritius-johannesburg', 'isleofman-dublin',
  ].map(l => { const [a, b] = l.split('-'); return [idx[a], idx[b]]; });

  // One state per chapter. Globe: centre, radius, view, brightness, pink mix of the dots.
  // Field: a brand-blue pool and a magenta pool that drift and blend behind everything.
  const STATES = {
    hero:     { x: .72, y: .47, r: .43, lon: 32, tilt: 24, dim: 1,   pink: .2,  net: 1,  bx: .78, by: .3,  ba: .6,  px: .08, py: .95, pa: .55 },
    weight:   { x: .12, y: .55, r: .64, lon: 12, tilt: 18, dim: .45, pink: .35, net: .4, bx: .1,  by: .6,  ba: .45, px: .9,  py: .2,  pa: .32 },
    supplies: { x: .52, y: 1.34, r: .98, lon: 40, tilt: 40, dim: .6, pink: .7, net: .6, bx: .5,  by: 1.05, ba: .5, px: .5,  py: .95, pa: .5 },
    routes:   { x: .88, y: .26, r: .34, lon: 62, tilt: 18, dim: .7, pink: .3, net: .8, bx: .9,  by: .15, ba: .5,  px: .05, py: .7,  pa: .3 },
    path:     { x: .72, y: .5,  r: .46, lon: 52, tilt: 20, dim: .85, pink: .35, net: .18, bx: .85, by: .3, ba: .5, px: .6,  py: 1,   pa: .45 },
    diligence:{ x: .1,  y: .6,  r: .5,  lon: 90, tilt: 24, dim: .45, pink: .6, net: .5, bx: .2, by: .7, ba: .4, px: .85, py: .35, pa: .45 },
    about:    { x: 1.02, y: .66, r: .5, lon: 70, tilt: 28, dim: .6, pink: .25, net: .6, bx: .7,  by: .5,  ba: .55, px: .2,  py: .15, pa: .25 },
    contact:  { x: .86, y: .56, r: .34, lon: 26, tilt: 20, dim: .75, pink: .45, net: 1, bx: .5,  by: .5,  ba: .6,  px: .5,  py: .5,  pa: .35 },
  };
  const MOBILE = { path: { x: .5, y: .26, r: .3 }, hero: { x: .5, y: .24, r: .27, dim: .8 }, weight: { x: .5, y: .2, r: .36 }, routes: { x: .5, y: .12, r: .22 }, about: { x: .5, y: .22, r: .34 }, contact: { x: .5, y: .2, r: .24 } };
  const sections = [...document.querySelectorAll('[data-globe]')];
  const keys = Object.keys(STATES.hero);
  let W = 0, H = 0, DPR = 1, small = false;
  const cur = { ...STATES.hero };
  const resize = () => { DPR = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; small = W < 900; cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); };
  resize(); addEventListener('resize', resize);
  let routeTint = 0, journey = 0;
  const stateFor = k => {
    const o = { ...STATES[k], ...(small ? MOBILE[k] || { x: .5 } : {}) };
    if (k === 'path') { o.lon = -5 + 100 * journey; o.tilt = 42 - 34 * journey; }
    if (k === 'routes') { o.pink = .1 + .8 * routeTint; o.pa = .25 + .45 * routeTint; o.ba = .65 - .3 * routeTint; }
    return o;
  };
  const smooth = t => t * t * (3 - 2 * t);

  // Continuous blend: a chapter holds its state for its first half, then eases into the next.
  function target() {
    const mid = H * .5;
    for (let i = 0; i < sections.length; i++) {
      const r = sections[i].getBoundingClientRect();
      if (r.top <= mid && r.bottom > mid) {
        const a = stateFor(sections[i].dataset.globe), next = sections[i + 1];
        if (!next) return a;
        const f = smooth(Math.min(1, Math.max(0, ((mid - r.top) / r.height - .45) / .55)));
        const b = stateFor(next.dataset.globe), o = {};
        keys.forEach(k => o[k] = a[k] + (b[k] - a[k]) * f);
        return o;
      }
    }
    return stateFor(sections[0].dataset.globe);
  }

  let px = 0, py = 0;
  if (!reduce) addEventListener('pointermove', e => { px = e.clientX / W - .5; py = e.clientY / H - .5; }, { passive: true });

  const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const BLUE = [102, 204, 255], PINK = [255, 153, 255], DOT = [214, 236, 246];

  let last = performance.now(), spin = 0, pulseT = -9;
  const vel = {};
  function frame(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (!reduce) spin += dt * 1.6;
    const t = target(), k = reduce ? 1 : 1 - Math.exp(-dt * 2.6);
    if (reduce) keys.forEach(key => cur[key] = t[key]);
    else keys.forEach(key => {                       // lightly under-damped spring: glides, overshoots a touch, settles
      vel[key] = ((vel[key] || 0) + (t[key] - cur[key]) * 30 * dt) * Math.exp(-9 * dt);
      cur[key] += vel[key] * dt;
    });
    handoffs(); chapterRail();
    draw(now / 1000);
    if (drift.length && !small) { drift.forEach(el => { const r = el.parentElement.getBoundingClientRect(); el.style.translate = `0 ${(((r.top + r.height / 2) - H / 2) * -+el.dataset.speed).toFixed(1)}px`; }); }
    if (!reduce) requestAnimationFrame(frame);
  }

  function field() {
    g.fillStyle = '#081A30'; g.fillRect(0, 0, W, H);
    const pool = (x, y, rr, c, a) => {
      const gr = g.createRadialGradient(x, y, 0, x, y, rr);
      gr.addColorStop(0, `rgba(${c},${a})`); gr.addColorStop(.55, `rgba(${c},${a * .35})`); gr.addColorStop(1, `rgba(${c},0)`);
      g.fillStyle = gr; g.fillRect(0, 0, W, H);
    };
    const big = Math.max(W, H);
    pool(cur.bx * W, cur.by * H, big * .75, '0,153,204', cur.ba * .55);
    pool(cur.px * W, cur.py * H, big * .62, '204,102,204', cur.pa * .6);
    pool(W * .5, H * .5, big * .9, '12,36,64', .35);
  }

  function draw(time) {
    g.setTransform(DPR, 0, 0, DPR, 0, 0);
    field();
    const R = cur.r * H, cx = cur.x * W + (small ? 0 : px * -24), cy = cur.y * H + (small ? 0 : py * -16);
    const l0 = (cur.lon + spin) * rad, tl = (cur.tilt + (vel.x || 0) * 18) * rad, ct = Math.cos(tl), st = Math.sin(tl);
    // atmosphere in the brand blue, rim tinted toward magenta
    const halo = g.createRadialGradient(cx, cy, R * .9, cx, cy, R * 1.3);
    halo.addColorStop(0, `rgba(102,204,255,${.22 * cur.dim})`); halo.addColorStop(.5, `rgba(204,102,204,${.08 * cur.dim})`); halo.addColorStop(1, 'rgba(204,102,204,0)');
    g.fillStyle = halo; g.beginPath(); g.arc(cx, cy, R * 1.3, 0, 7); g.fill();
    const sphere = g.createRadialGradient(cx - R * .35, cy - R * .4, R * .1, cx, cy, R);
    sphere.addColorStop(0, `rgba(16,62,96,${.7 * cur.dim})`); sphere.addColorStop(1, `rgba(9,26,48,${.92 * cur.dim})`);
    g.fillStyle = sphere; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill();
    // land dots in three depth bands; colour moves between light blue and light pink by chapter
    const s = Math.max(1.1, R / 260), bands = [[], [], []];
    for (let i = 0; i < N; i++) {
      const dl = lo[i] - l0, x = cl[i] * Math.sin(dl), y = sl[i], z = cl[i] * Math.cos(dl);
      const y2 = y * ct - z * st, z2 = y * st + z * ct;
      if (z2 <= 0) continue;
      bands[z2 > .55 ? 2 : z2 > .25 ? 1 : 0].push(cx + x * R, cy - y2 * R);
    }
    const tint = [mix(BLUE, PINK, cur.pink), mix(DOT, PINK, cur.pink * .5), DOT], alpha = [.3, .55, .9];
    bands.forEach((b, j) => {
      g.fillStyle = `rgba(${tint[j]},${alpha[j] * cur.dim})`;
      for (let i = 0; i < b.length; i += 2) g.fillRect(b[i] - s / 2, b[i + 1] - s / 2, s, s);
    });
    // network mesh, arcs in the brand gradient
    const P = v => { const y2 = v[1] * ct - v[2] * st, z2 = v[1] * st + v[2] * ct; return [cx + v[0] * R, cy - y2 * R, z2]; };
    const rot = n => vec(n.lon - (cur.lon + spin), n.lat);
    const boost = 1 + 1.1 * Math.exp(-Math.max(0, time - pulseT) * 2.4);
    const net = Math.min(1, cur.net * cur.dim * boost);
    LINKS.forEach(([ia, ib], li) => {
      const A = NODES[ia], B = NODES[ib], a = rot(A), b = rot(B);
      const om = Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))), so = Math.sin(om) || 1;
      const pts = [];
      for (let i = 0; i <= 40; i++) {
        const u = i / 40, wa = Math.sin((1 - u) * om) / so, wb = Math.sin(u * om) / so, lift = 1 + Math.min(.13, .09 * om) * Math.sin(Math.PI * u);
        const p = P([(a[0] * wa + b[0] * wb) * lift, (a[1] * wa + b[1] * wb) * lift, (a[2] * wa + b[2] * wb) * lift]);
        pts.push([p, p[2] > 0 || Math.hypot(p[0] - cx, p[1] - cy) > R]);
      }
      const ga = pts[0][0], gb = pts[40][0], grad = g.createLinearGradient(ga[0], ga[1], gb[0], gb[1]);
      const ca = A.hub ? '102,204,255' : '235,120,235', cb = B.hub ? '102,204,255' : '235,120,235';
      grad.addColorStop(0, `rgba(${ca},${.75 * net})`); grad.addColorStop(1, `rgba(${cb},${.75 * net})`);
      g.strokeStyle = grad; g.lineWidth = 1.2;
      g.beginPath(); let on = false;
      pts.forEach(([p, vis]) => { if (vis) { on ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); on = true; } else on = false; });
      g.stroke();
      const k = pts[Math.floor(((time * .2 + li * .23) % 1) * 40)];
      if (k && k[1]) { g.fillStyle = `rgba(255,255,255,${.9 * net})`; g.beginPath(); g.arc(k[0][0], k[0][1], 1.8, 0, 7); g.fill(); }
    });
    NODES.forEach((n, i) => {
      const e = P(rot(n)); if (e[2] <= 0) return;
      const c = n.hub ? '102,204,255' : '255,153,255', pulse = ((time * .7 + i * .37) % 2.4) / 2.4;
      g.strokeStyle = `rgba(${c},${(1 - pulse) * .55 * net})`; g.lineWidth = 1;
      g.beginPath(); g.arc(e[0], e[1], 3 + pulse * (n.hub ? 14 : 9) * boost, 0, 7); g.stroke();
      g.fillStyle = `rgba(${n.hub ? '245,247,247' : '255,190,255'},${net})`; g.beginPath(); g.arc(e[0], e[1], n.hub ? 2.8 : 2.2, 0, 7); g.fill();
    });
    // the move: one route drawn across the globe as the stages are read
    if (journey > 0) {
      const A = rot({ lon: -.13, lat: 51.5 }), B = rot({ lon: 103.8, lat: 1.35 });
      const om = Math.acos(A[0] * B[0] + A[1] * B[1] + A[2] * B[2]), so = Math.sin(om);
      const at = u => { const wa = Math.sin((1 - u) * om) / so, wb = Math.sin(u * om) / so, lift = 1 + .2 * Math.sin(Math.PI * u); return P([(A[0] * wa + B[0] * wb) * lift, (A[1] * wa + B[1] * wb) * lift, (A[2] * wa + B[2] * wb) * lift]); };
      const end = Math.min(1, journey), a0 = at(0), a1 = at(1), gr = g.createLinearGradient(a0[0], a0[1], a1[0], a1[1]);
      gr.addColorStop(0, '#66CCFF'); gr.addColorStop(1, '#E08AE0');
      g.strokeStyle = 'rgba(102,204,255,.18)'; g.lineWidth = 1; g.setLineDash([2, 6]); g.beginPath();
      for (let i = 0; i <= 60; i++) { const p = at(i / 60); i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); } g.stroke(); g.setLineDash([]);
      g.strokeStyle = gr; g.lineWidth = 2.4; g.shadowColor = 'rgba(102,204,255,.8)'; g.shadowBlur = 12; g.beginPath();
      const n = Math.max(1, Math.round(60 * end));
      for (let i = 0; i <= n; i++) { const p = at(i / 60 * (60 * end / n)); i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); } g.stroke(); g.shadowBlur = 0;
      [0, .25, .5, .75, 1].forEach((u, i) => {
        const p = at(u), lit = end >= u - .001;
        g.beginPath(); g.arc(p[0], p[1], lit ? 5 : 3.5, 0, 7);
        if (lit) { g.fillStyle = i > 2 ? '#E08AE0' : '#66CCFF'; g.fill(); } else { g.strokeStyle = 'rgba(245,247,247,.5)'; g.lineWidth = 1; g.stroke(); }
      });
      const hd = at(end); g.fillStyle = '#fff'; g.beginPath(); g.arc(hd[0], hd[1], 3, 0, 7); g.fill();
    }
  }

  if (reduce) { const redraw = () => { Object.assign(cur, target()); draw(0); }; addEventListener('scroll', redraw, { passive: true }); addEventListener('resize', redraw); redraw(); }
  else requestAnimationFrame(frame);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) last = performance.now(); });

  // ---------- nav CTA stays quiet while the hero's own CTA is visible
  const nav = document.querySelector('.nav'), heroCta = document.querySelector('.hero .btn');
  new IntersectionObserver(([e]) => nav.classList.toggle('solid', !e.isIntersecting)).observe(heroCta);

  // ---------- three ways to work: carousel
  const car = document.querySelector('.car'), slides = [...car.querySelectorAll('.slide')];
  const prev = document.querySelector('.car-btn.prev'), next = document.querySelector('.car-btn.next');
  const count = document.querySelector('.car-count b'), bar = document.querySelector('.car-bar');
  let active = 0;
  const step = () => slides[1].offsetLeft - slides[0].offsetLeft;
  const sync = () => {
    active = Math.max(0, Math.min(slides.length - 1, Math.round(car.scrollLeft / step())));
    slides.forEach((sl, i) => sl.classList.toggle('active', i === active));
    count.textContent = String(active + 1).padStart(2, '0');
    bar.style.setProperty('--p', (active + 1) / slides.length);
    prev.disabled = active === 0; next.disabled = active === slides.length - 1;
    routeTint = +slides[active].dataset.tint;
  };
  car.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
  prev.addEventListener('click', () => car.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }));
  next.addEventListener('click', () => car.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }));
  car.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); next.click(); } if (e.key === 'ArrowLeft') { e.preventDefault(); prev.click(); } });
  let drag = null;
  car.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' || e.target.closest('a,button')) return; drag = { x: e.clientX, l: car.scrollLeft, moved: false }; car.classList.add('dragging'); car.setPointerCapture(e.pointerId); });
  car.addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - drag.x; if (Math.abs(dx) > 4) drag.moved = true; car.scrollLeft = drag.l - dx; });
  const endDrag = () => {
    if (!drag) return;
    const from = Math.round(drag.l / step()), d = car.scrollLeft - drag.l;
    const to = Math.max(0, Math.min(slides.length - 1, from + (Math.abs(d) > step() * .12 ? Math.sign(d) : 0)));
    drag = null; car.classList.remove('dragging'); car.scrollTo({ left: to * step(), behavior: 'smooth' });
  };
  car.addEventListener('pointerup', endDrag); car.addEventListener('pointercancel', endDrag);
  sync();

  // ---------- how a move works: pinned; stages hand over as the route draws across the globe
  const jSec = document.getElementById('path'), stages = [...jSec.querySelectorAll('.stages li')], dots = [...jSec.querySelectorAll('.rail span')];
  if (!reduce) {
    jSec.classList.add('pinned');
    const run = () => {
      const r = jSec.getBoundingClientRect(), span = jSec.offsetHeight - innerHeight;
      const p = Math.max(0, Math.min(1, -r.top / span));
      const jp = Math.max(0, Math.min(1, (p - .06) / .82));
      const arrive = r.top > 0 ? Math.max(0, 1 - r.top / innerHeight) : 1;
      journey = r.top < innerHeight && r.bottom > 0 ? Math.max(.001, jp, arrive * .08) : 0;
      const idx = Math.min(stages.length - 1, Math.floor(jp * stages.length * .999));
      stages.forEach((li, i) => { li.classList.toggle('on', i === idx); li.classList.toggle('past', i < idx); });
      dots.forEach((d, i) => d.classList.toggle('lit', jp >= i / (dots.length - 1) - .001));
      jSec.style.setProperty('--jp', jp);
    };
    addEventListener('scroll', () => requestAnimationFrame(run), { passive: true }); run();
  }

  // ---------- enquiry form: validates, posts to /api/enquiry (a Pages Function that emails it), says plainly what happened.
  // If sending fails, it offers the same note as a ready-made email instead.
  const form = document.getElementById('enquiry'), status = form.querySelector('.form-status');
  form.addEventListener('submit', e => {
    e.preventDefault();
    form.querySelectorAll('.err').forEach(x => x.remove());
    let first = null;
    form.querySelectorAll('[required]').forEach(f => {
      const bad = !f.value.trim() || (f.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value));
      f.setAttribute('aria-invalid', bad);
      if (bad) {
        const m = document.createElement('p'); m.className = 'err'; m.id = f.id + '-err';
        m.textContent = f.type === 'email' && f.value.trim() ? 'Please check this email address.' : 'Please fill this in.';
        f.after(m); f.setAttribute('aria-describedby', m.id); first = first || f;
      } else f.removeAttribute('aria-describedby');
    });
    if (first) { first.focus(); return; }
    const d = new FormData(form), btn = form.querySelector('button[type="submit"]');
    const body = `Name: ${d.get('name')}\nEmail: ${d.get('email')}\nRoute: ${d.get('route') || 'Not sure yet'}\n\n${d.get('now')}`;
    const href = 'mailto:info@lawsonsnetwork.com?subject=' + encodeURIComponent('Start a conversation') + '&body=' + encodeURIComponent(body);
    btn && (btn.disabled = true);
    fetch('https://lawsons-network.pages.dev/api/enquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(d)) })
      .then(r => { if (!r.ok) throw new Error(r.status); status.hidden = false; status.textContent = 'Thank you. Your note has been sent, and we’ll be in touch.'; form.reset(); })
      .catch(() => { status.hidden = false; status.innerHTML = 'Sorry, that didn’t send. <a href="' + href + '">Send it by email instead</a> — your note is already filled in.'; })
      .finally(() => { btn && (btn.disabled = false); status.focus?.(); });
  });

  // ---------- 1. chapter hand-offs: content dims and lifts as it leaves, rises as it arrives
  const shells = [...document.querySelectorAll('.ch > .shell')];
  function handoffs() {
    if (reduce) return;
    for (const el of shells) {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -H || r.top > 2 * H) continue;
      const inn = Math.min(1, Math.max(0, (H - r.top) / (H * .5))), out = Math.min(1, Math.max(0, r.bottom / (H * .5)));
      const f = Math.min(inn, out), ease = f * f * (3 - 2 * f);
      el.style.setProperty('--o', (.2 + .8 * ease).toFixed(3));
      el.style.setProperty('--ty', ((1 - inn) * 48 - (1 - out) * 36).toFixed(1) + 'px');
    }
  }

  // ---------- 2. chapter rail
  const railLinks = [...document.querySelectorAll('.rail-nav a')], railNav = document.querySelector('.rail-nav');
  let lastCh = '';
  function chapterRail() {
    const mid = H * .5;
    const sec = sections.find(s => { const r = s.getBoundingClientRect(); return r.top <= mid && r.bottom > mid; });
    const max = document.documentElement.scrollHeight - H;
    const ch = scrollY >= max - 4 ? 'contact' : sec ? sec.dataset.globe : lastCh;
    if (ch !== lastCh) { railLinks.forEach(a => { const on = a.dataset.ch === ch; a.classList.toggle('on', on); on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'); }); lastCh = ch; }
    railNav.style.setProperty('--rp', max > 0 ? (scrollY / max).toFixed(3) : 0);
  }
  if (reduce) { addEventListener('scroll', chapterRail, { passive: true }); chapterRail(); }

  // ---------- 4. buttons: a slight pull toward the cursor, and the network pulses when you reach for one
  const btns = [...document.querySelectorAll('.btn:not([type=submit])')];
  btns.forEach(b => b.addEventListener('pointerenter', () => { pulseT = performance.now() / 1000; }));
  if (!reduce) addEventListener('pointermove', e => {
    for (const b of btns) {
      const r = b.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, dx = e.clientX - cx, dy = e.clientY - cy;
      const near = Math.abs(dx) < r.width / 2 + 60 && Math.abs(dy) < r.height / 2 + 50;
      b.style.setProperty('--mx', near ? (Math.max(-8, Math.min(8, dx * .15))).toFixed(1) + 'px' : '0px');
      b.style.setProperty('--my', near ? (Math.max(-6, Math.min(6, dy * .2))).toFixed(1) + 'px' : '0px');
    }
  }, { passive: true });

  // ---------- 7. closing mark draws itself when the footer arrives
  const foot = document.querySelector('.foot');
  new IntersectionObserver(([e]) => { if (e.isIntersecting) foot.classList.add('in'); }, { threshold: .3 }).observe(foot);

  // ---------- menu
  const menu = document.querySelector('.menu'), panel = document.getElementById('menu');
  const setMenu = open => { panel.hidden = !open; menu.setAttribute('aria-expanded', open); menu.textContent = open ? 'Close' : 'Menu'; };
  menu.addEventListener('click', () => setMenu(panel.hidden));
  panel.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) { setMenu(false); menu.focus(); } });

  // ---------- review marks
  const toggle = document.querySelector('.review-toggle');
  const label = () => toggle.textContent = body.classList.contains('clean') ? 'Show review marks' : 'Hide review marks';
  if (toggle) { toggle.addEventListener('click', () => { body.classList.toggle('clean'); label(); }); label(); }
})();
