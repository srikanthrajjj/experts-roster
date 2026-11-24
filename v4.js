// Home V4 "Atlas": a dotted map of where UNICEF's experts are. The map reacts to search, pins and the roster list.
(function () {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ARROW = '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
  const SEARCH = '<svg width="24" height="24" fill="none" stroke="#fff" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Where each expert location sits (lat/lon). `loc` is the value the experts page's Location filter understands.
  const PLACES = {
    'Nigeria': { lat: 9.08, lon: 7.4, loc: 'Nigeria' }, 'Canada': { lat: 45.42, lon: -75.7, loc: 'Canada' }, 'Ethiopia': { lat: 9.03, lon: 38.74, loc: 'Ethiopia' },
    'Uganda': { lat: 0.35, lon: 32.58, loc: 'Uganda' }, 'Pakistan': { lat: 33.68, lon: 73.05, loc: 'Pakistan' }, "Cote d'Ivoire": { lat: 6.82, lon: -5.28, loc: 'Cote' }
  };
  const HUB = { name: 'UNICEF HQ · New York', lat: 40.75, lon: -73.97 };
  const LARGE = new Set(['recovery', 'network', 'sbc', 'climate', 'finance', 'hiv', 'mncah', 'cross']); // rosters with a high-res photo
  let landPromise = null;
  const loadLand = () => landPromise || (landPromise = fetch('assets/v4/land.json').then(r => r.json()));

  /* ------------------------------------------------------------------ Atlas: canvas dot-map engine */
  class Atlas {
    constructor(cv, opt) {
      this.cv = cv; this.cx = cv.getContext('2d');
      this.o = Object.assign({ lonMin: -88, lonMax: 88, latMax: 68, latMin: -38, padT: 0, padB: 0, r: 0.235, interactive: false, labels: true, sigma: 6 }, opt);
      this.pins = opt.pins.map(p => Object.assign({ pa: 0 }, p)); this.hl = {}; this.hover = null; this.visible = true; this.t0 = performance.now(); this.raf = 0; this.ready = false;
      loadLand().then(L => { this.land = L; this.build(); this.ready = true; this.kick(); });
      this.ro = new ResizeObserver(() => { if (this.ready) { this.resize(); this.kick(); } }); this.ro.observe(cv);
      this.io = new IntersectionObserver(es => { this.visible = es[0].isIntersecting; if (this.visible) this.kick(); }); this.io.observe(cv);
      if (this.o.interactive) {
        cv.addEventListener('pointermove', e => this.pointer(e)); cv.addEventListener('pointerleave', () => this.setHover(null));
        cv.addEventListener('click', () => { if (this.hover) location.href = locUrl(this.hover.loc); });
      }
    }
    build() {
      const L = this.land, o = this.o, lon = [], lat = [];
      for (let r = 0; r < L.rows; r++) for (let c = 0; c < L.cols; c++) {
        if (L.data[r][c] !== '1') continue;
        const x = L.lonMin + (c + 0.5) * L.step, y = L.latMax - (r + 0.5) * L.step;
        if (x >= o.lonMin - 3 && x <= o.lonMax + 3 && y <= o.latMax + 3 && y >= o.latMin - 3) { lon.push(x); lat.push(y); }
      }
      this.n = lon.length; this.lon = Float32Array.from(lon); this.lat = Float32Array.from(lat);
      this.sx = new Float32Array(this.n); this.sy = new Float32Array(this.n); this.boost = new Float32Array(this.n); this.target = new Float32Array(this.n); this.hot = [];
      this.base = document.createElement('canvas'); this.resize();
    }
    resize() {
      const r = this.cv.getBoundingClientRect(), o = this.o; if (!r.width || !r.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2); this.dpr = dpr; this.w = r.width; this.h = r.height;
      this.cv.width = this.base.width = Math.round(r.width * dpr); this.cv.height = this.base.height = Math.round(r.height * dpr);
      const narrow = matchMedia('(max-width:980px)').matches, pT = narrow ? 4 : o.padT, pB = narrow ? 4 : o.padB, availH = this.h - pT - pB, sX = this.w / (o.lonMax - o.lonMin), sY = availH / (o.latMax - o.latMin);
      this.s = Math.min(sX, sY); const mw = (o.lonMax - o.lonMin) * this.s, mh = (o.latMax - o.latMin) * this.s;
      this.ox = (this.w - mw) / 2; this.oy = pT + (availH - mh) / 2;
      const px = lon => this.ox + (lon - o.lonMin) * this.s, py = lat => this.oy + (o.latMax - lat) * this.s;
      for (let i = 0; i < this.n; i++) { this.sx[i] = px(this.lon[i]); this.sy[i] = py(this.lat[i]); }
      this.dotR = Math.max(0.65, this.land.step * this.s * o.r);
      this.pins.forEach(p => { p.x = px(p.lon); p.y = py(p.lat); }); this.hubX = px(HUB.lon); this.hubY = py(HUB.lat);
      // the land never changes: paint every dot once into an offscreen layer
      const bx = this.base.getContext('2d'); bx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); bx.clearRect(0, 0, this.w, this.h);
      bx.fillStyle = 'rgba(122,178,228,0.34)'; bx.beginPath();
      for (let i = 0; i < this.n; i++) { bx.moveTo(this.sx[i] + this.dotR, this.sy[i]); bx.arc(this.sx[i], this.sy[i], this.dotR, 0, 6.2832); }
      bx.fill(); this.computeTargets();
    }
    setHighlight(map) { this.hl = map || {}; this.computeTargets(); this.kick(); }
    setHover(p) { if (this.hover === p) return; this.hover = p; this.cv.style.cursor = p ? 'pointer' : ''; this.computeTargets(); this.kick(); if (this.o.onHover) this.o.onHover(p); }
    activeKeys() { return this.hover ? { [this.hover.key]: this.hover.total } : this.hl; }
    computeTargets() {
      if (!this.n) return; const act = this.pins.filter(p => this.activeKeys()[p.key]); this.target.fill(0);
      const sg = this.o.sigma, k = 1 / (2 * sg * sg);
      for (const p of act) for (let i = 0; i < this.n; i++) {
        const dl = (this.lon[i] - p.lon) * Math.cos(this.lat[i] * Math.PI / 180), dt = this.lat[i] - p.lat, v = Math.exp(-(dl * dl + dt * dt) * k);
        if (v > this.target[i]) this.target[i] = v;
      }
      if (reduce) this.boost.set(this.target);
      // only dots that are glowing, or fading, are touched each frame
      this.hot = []; for (let i = 0; i < this.n; i++) if (this.target[i] > 0.004 || this.boost[i] > 0.004) this.hot.push(i);
    }
    pointer(e) {
      const r = this.cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; let best = null, bd = 18 * 18;
      for (const p of this.pins) { const d = (p.x - x) ** 2 + (p.y - y) ** 2; if (d < bd) { bd = d; best = p; } }
      this.setHover(best);
    }
    kick() { if (!this.raf && this.ready && this.visible) this.raf = requestAnimationFrame(t => this.frame(t)); }
    frame(now) {
      this.raf = 0; if (!this.visible || !this.w) return;
      const cx = this.cx, dpr = this.dpr, t = (now - this.t0) / 1000, act = this.activeKeys(), anyAct = Object.keys(act).length > 0; let moving = !reduce;
      cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, this.w, this.h);
      cx.globalAlpha = anyAct ? 0.55 : 1; cx.drawImage(this.base, 0, 0, this.w, this.h); cx.globalAlpha = 1;
      // glowing dots (8 brightness levels, one path each)
      const hot = this.hot, buckets = [[], [], [], [], [], [], [], []]; let still = true;
      for (let h = 0; h < hot.length; h++) {
        const i = hot[h], d = this.target[i] - this.boost[i];
        if (d > 0.002 || d < -0.002) { this.boost[i] += d * 0.14; still = false; } else this.boost[i] = this.target[i];
        buckets[Math.min(7, Math.round(this.boost[i] * 8))].push(i);
      }
      if (!still) moving = true;
      const r0 = this.dotR;
      for (let b = 1; b < 8; b++) {
        if (!buckets[b].length) continue; const f = b / 7, rr = r0 * (1 + 0.45 * f);
        cx.fillStyle = `rgba(${Math.round(120 + 40 * f)},${Math.round(200 + 40 * f)},255,${0.28 + 0.72 * f})`; cx.beginPath();
        for (const i of buckets[b]) { cx.moveTo(this.sx[i] + rr, this.sy[i]); cx.arc(this.sx[i], this.sy[i], rr, 0, 6.2832); }
        cx.fill();
      }
      for (const p of this.pins) { const tg = act[p.key] ? 1 : 0, d = tg - p.pa; if (Math.abs(d) > 0.005) { p.pa += d * 0.16; moving = true; } else p.pa = tg; }
      // arcs from the hub
      for (let k = 0; k < this.pins.length; k++) {
        const p = this.pins[k], dx = p.x - this.hubX, dy = p.y - this.hubY, dist = Math.hypot(dx, dy), mx = (p.x + this.hubX) / 2, my = (p.y + this.hubY) / 2 - dist * 0.26;
        cx.beginPath(); cx.moveTo(this.hubX, this.hubY); cx.quadraticCurveTo(mx, my, p.x, p.y);
        cx.lineWidth = 1; cx.setLineDash([]); cx.strokeStyle = `rgba(125,211,252,${anyAct ? 0.1 : 0.16})`; cx.stroke();
        if (p.pa > 0.02) {
          cx.lineWidth = 1.6; cx.setLineDash([7, 9]); cx.lineDashOffset = reduce ? 0 : -t * 34; cx.strokeStyle = `rgba(150,232,255,${0.85 * p.pa})`; cx.stroke(); cx.setLineDash([]);
          if (!reduce) { const u = ((t * 0.32 + k * 0.21) % 1), x = (1 - u) ** 2 * this.hubX + 2 * (1 - u) * u * mx + u * u * p.x, y = (1 - u) ** 2 * this.hubY + 2 * (1 - u) * u * my + u * u * p.y; cx.fillStyle = `rgba(255,255,255,${p.pa})`; cx.beginPath(); cx.arc(x, y, 2.6, 0, 6.2832); cx.fill(); }
        }
      }
      // hub
      cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(this.hubX, this.hubY, 3.4, 0, 6.2832); cx.fill(); cx.strokeStyle = 'rgba(255,255,255,.55)'; cx.lineWidth = 1; cx.beginPath(); cx.arc(this.hubX, this.hubY, 8, 0, 6.2832); cx.stroke();
      // pins
      for (let k = 0; k < this.pins.length; k++) {
        const p = this.pins[k], dim = anyAct ? 0.35 + 0.65 * p.pa : 1, ph = reduce ? 0 : (t * 0.55 + k * 0.37) % 1;
        if (!reduce) { const pr = anyAct ? (p.pa > 0.05 ? ph : -1) : ph; if (pr >= 0) { cx.strokeStyle = `rgba(111,220,255,${(1 - pr) * 0.55 * dim})`; cx.lineWidth = 1.4; cx.beginPath(); cx.arc(p.x, p.y, 5 + pr * 20, 0, 6.2832); cx.stroke(); } }
        const g = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 17); g.addColorStop(0, `rgba(111,220,255,${0.55 * dim})`); g.addColorStop(1, 'rgba(111,220,255,0)'); cx.fillStyle = g; cx.beginPath(); cx.arc(p.x, p.y, 17, 0, 6.2832); cx.fill();
        cx.fillStyle = `rgba(255,255,255,${dim})`; cx.beginPath(); cx.arc(p.x, p.y, 3.8 + 1.6 * p.pa, 0, 6.2832); cx.fill();
        cx.fillStyle = `rgba(28,171,226,${dim})`; cx.beginPath(); cx.arc(p.x, p.y, 2.2 + 1 * p.pa, 0, 6.2832); cx.fill();
      }
      if (this.o.labels) this.drawLabels(cx, act);
      if (moving) this.raf = requestAnimationFrame(t2 => this.frame(t2));
    }
    drawLabels(cx, act) {
      const placed = [], offs = [0, -26, 26, -52, 52]; cx.font = "600 12.5px Inter, sans-serif"; cx.textBaseline = 'middle';
      const list = this.pins.filter(p => p.pa > 0.25).sort((a, b) => a.x - b.x);
      if (list.length) { cx.fillStyle = 'rgba(255,255,255,.75)'; cx.font = '500 11.5px Inter, sans-serif'; cx.textAlign = 'right'; cx.fillText(HUB.name, this.hubX - 12, this.hubY - 14); cx.font = "600 12.5px Inter, sans-serif"; }
      for (const p of list) {
        const n = act[p.key], txt = `${p.name}  ·  ${n} ${n === 1 ? 'expert' : 'experts'}`, tw = cx.measureText(txt).width + 22, h = 26;
        const right = p.x + 16 + tw < this.w - 6; let x = right ? p.x + 16 : p.x - 16 - tw, y = p.y;
        for (const o of offs) { const yy = p.y + o, hit = placed.some(r => x < r.x + r.w + 4 && x + tw + 4 > r.x && yy - h / 2 < r.y + r.h / 2 + 3 && yy + h / 2 + 3 > r.y - r.h / 2); if (!hit) { y = yy; break; } }
        placed.push({ x, y, w: tw, h });
        cx.globalAlpha = Math.min(1, p.pa * 1.2); cx.fillStyle = 'rgba(2,24,52,.82)'; cx.strokeStyle = 'rgba(111,220,255,.5)'; cx.lineWidth = 1;
        const rr = 13; cx.beginPath(); cx.moveTo(x + rr, y - h / 2); cx.arcTo(x + tw, y - h / 2, x + tw, y + h / 2, rr); cx.arcTo(x + tw, y + h / 2, x, y + h / 2, rr); cx.arcTo(x, y + h / 2, x, y - h / 2, rr); cx.arcTo(x, y - h / 2, x + tw, y - h / 2, rr); cx.closePath(); cx.fill(); cx.stroke();
        cx.fillStyle = '#fff'; cx.textAlign = 'left'; cx.fillText(txt, x + 11, y + 0.5); cx.globalAlpha = 1;
      }
    }
  }

  /* ------------------------------------------------------------------ page */
  let built = false;
  function build(root) {
    const EXP = DASH_EXPERTS, byLoc = {};
    EXP.forEach(e => { (byLoc[e.location] = byLoc[e.location] || []).push(e); });
    const pins = Object.keys(byLoc).filter(k => PLACES[k]).map(k => ({ key: k, name: k === "Cote d'Ivoire" ? "Côte d'Ivoire" : k, total: byLoc[k].length, lat: PLACES[k].lat, lon: PLACES[k].lon, loc: PLACES[k].loc }));
    const langs = new Set(); EXP.forEach(e => (e.languages || []).forEach(l => langs.add(l)));
    const rosters = ROSTERS.map((r, i) => ({ r, i, list: membersOf(r) })).map(x => Object.assign(x, { count: x.list.length })).sort((a, b) => b.count - a.count || a.i - b.i);
    const maxC = Math.max(1, ...rosters.map(x => x.count));
    const hlFor = list => { const m = {}; list.forEach(e => { if (PLACES[e.location]) m[e.location] = (m[e.location] || 0) + 1; }); return m; };
    const SHORT = { mncah: 'MNCAH', sbc: 'Social & Behaviour Change', network: 'External Expert Network', climate: 'Climate & Environment', protect: 'Child Protection', finance: 'Financing for Scale', hiv: 'HIV/AIDS' };
    const title = x => SHORT[x.r.img] ? (x.r.img === 'mncah' ? 'Maternal, Newborn, Child & Adolescent Health' : x.r.t.replace(/ \(.*\)/, '')) : x.r.t.replace(/ \(.*\)/, '');

    root.innerHTML = `
    <header class="v4-nav" id="v4nav"><div class="wrap">
      <a class="v4-logo" href="/"><img src="assets/unicef-logo-dxya9f98.png" alt="UNICEF" /><span class="reach">REACH</span></a>
      <nav class="v4-links" aria-label="Main"><a href="#">Home</a><a href="#" class="on">Rosters</a><a href="#v4index">Expertise map</a><a href="#">Resources</a></nav>
      <div class="v4-tools"><svg width="22" height="22" fill="none" stroke="#fff" stroke-width="1.8" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><span class="u" aria-hidden="true"><svg width="18" height="18" fill="none" stroke="#fff" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg></span></div>
    </div></header>

    <section class="v4-hero" aria-labelledby="v4h">
      <div class="v4-map" aria-hidden="true"><canvas id="v4hero"></canvas></div>
      <div class="v4-heroin wrap"><div class="v4-copy">
        <div class="eyebrow"><i></i>REACH · Expert rosters</div>
        <h1 id="v4h">Expertise, <em>wherever</em> a child needs it.</h1>
        <p class="v4-lead">${EXP.length} vetted specialists across ${pins.length} countries. Search by skill, language or name &mdash; and watch the map show you exactly where they are.</p>
        <div class="v4-cmd">
          <form class="v4-bar" id="v4f" role="search" autocomplete="off">${SEARCH}
            <input id="v4q" role="combobox" aria-expanded="false" aria-controls="v4pop" aria-autocomplete="list" placeholder="Try &ldquo;vaccination&rdquo;, &ldquo;French&rdquo; or a name" aria-label="Search experts" />
            <button class="v4-go" type="submit">Find experts</button></form>
          <div class="v4-pop" id="v4pop" role="listbox" hidden></div>
        </div>
        <div class="v4-live" id="v4live" aria-live="polite"><i></i><span>Hover a pin, or start typing, to see where experts are based.</span></div>
        <div class="v4-quick">Popular:${['Education', 'Child Protection', 'Climate', 'Health', 'Recovery'].map(s => `<button type="button" data-q="${s}">${s}</button>`).join('')}</div>
      </div></div>
      <ul class="sr" aria-label="Expert locations">${pins.map(p => `<li><a href="${esc(locUrl(p.loc))}">${esc(p.name)}: ${p.total} ${p.total === 1 ? 'expert' : 'experts'}</a></li>`).join('')}</ul>
      <div class="v4-stats"><div class="wrap">
        ${[[EXP.length, 'Vetted experts'], [pins.length, 'Countries'], [ROSTERS.length, 'Specialist rosters'], [langs.size, 'Languages']].map(([n, l]) => `<div class="v4-stat"><b data-n="${n}">0</b><span>${l}</span></div>`).join('')}
      </div></div>
    </section>

    <section class="v4-index" id="v4index" aria-labelledby="v4r"><div class="wrap">
      <div class="v4-head"><div><div class="k">Rosters</div><h2 id="v4r">Choose a roster. <em>See who&rsquo;s behind it.</em></h2></div>
        <p>Hover or focus a roster to see where its experts are based; the bar shows how many it holds.</p></div>
      <div class="v4-split">
        <div class="v4-rows" id="v4rows">${rosters.map((x, n) => `
          <a class="v4-row${x.count ? '' : ' zero'}" href="${esc(rosterUrl(x.r))}" data-i="${n}" style="--w:${Math.round(x.count / maxC * 100)};--i:${n}" aria-label="${esc(title(x))}, ${x.count} ${x.count === 1 ? 'expert' : 'experts'}">
            <span class="bar"></span><span class="no">${String(n + 1).padStart(2, '0')}</span>
            <img class="th" src="assets/photos/${x.r.img}.jpg" alt="" loading="lazy" />
            <span class="t">${esc(title(x))}<small>${esc(x.r.tags.join(' · '))}</small></span>
            <span class="cnt"><b>${x.count}</b><span>${x.count === 1 ? 'expert' : 'experts'}</span></span><span class="go">${ARROW}</span>
          </a>`).join('')}</div>
        <aside class="v4-panel" aria-live="polite">
          <div class="v4-ph"><img id="v4pa" alt="" /><img id="v4pb" alt="" /><div class="lab"><small id="v4pk"></small><h3 id="v4pt"></h3></div></div>
          <div class="v4-pbody"><p id="v4pd"></p>
            <div class="v4-pmap"><canvas id="v4panel"></canvas></div>
            <div class="v4-where" id="v4pw"></div>
            <a class="v4-open" id="v4po" href="#"><span>Open this roster</span>${ARROW}</a></div>
        </aside>
      </div>
      <div class="v4-guide"><div><h3>Not sure which roster fits?</h3><p>Answer a few quick questions and we&rsquo;ll guide you to the right expertise.</p></div><a class="btn" href="#">Get guidance ${ARROW}</a></div>
      <div class="v4-foot"><span>Before engaging an expert, review UNICEF&rsquo;s recruitment and procurement requirements.</span><a href="#">Read the guidance</a></div>
    </div></section>`;

    // sticky-nav background after scrolling
    const nav = root.querySelector('#v4nav'); const onScroll = () => nav.classList.toggle('solid', scrollY > 24); addEventListener('scroll', onScroll, { passive: true }); onScroll();
    // count-up stats
    root.querySelectorAll('[data-n]').forEach(el => { const to = +el.dataset.n; if (reduce) { el.textContent = to; return; } const t0 = performance.now(); (function tick(t) { const p = Math.min(1, (t - t0) / 1100); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); })(t0); });
    // rows draw their bars when they scroll into view
    const rowsEl = root.querySelector('#v4rows'); new IntersectionObserver((es, ob) => { if (es[0].isIntersecting) { rowsEl.classList.add('in'); ob.disconnect(); } }, { threshold: 0.15 }).observe(rowsEl);

    // ---- maps
    const live = root.querySelector('#v4live span');
    const idleMsg = 'Hover a pin, or start typing, to see where experts are based.';
    const heroMap = new Atlas(root.querySelector('#v4hero'), { pins, padT: 76, padB: 190, interactive: true, onHover: p => { live.innerHTML = p ? `<b>${esc(p.name)}</b> &mdash; ${p.total} ${p.total === 1 ? 'expert' : 'experts'} based here. Click to view them.` : (state.msg || idleMsg); } });
    const state = { msg: '' };
    const panelMap = new Atlas(root.querySelector('#v4panel'), { pins, padT: 6, padB: 6, r: 0.24, sigma: 7, labels: false });
    function preview(text) {
      const list = expertsForSearch(text), m = hlFor(list), cs = Object.keys(m).length;
      state.msg = list.length ? `<b>${list.length} ${list.length === 1 ? 'expert' : 'experts'}</b> match &mdash; across ${cs} ${cs === 1 ? 'country' : 'countries'}` : (text.trim() ? 'No experts match yet &mdash; try a skill or a language.' : '');
      live.innerHTML = state.msg || idleMsg; heroMap.setHighlight(m);
    }

    // ---- roster index + panel
    const rows = [...root.querySelectorAll('.v4-row')], imgs = [root.querySelector('#v4pa'), root.querySelector('#v4pb')]; let cur = -1, flip = 0;
    function setPanel(n) {
      if (n === cur) return; cur = n; const x = rosters[n], m = hlFor(x.list);
      rows.forEach((r, i) => r.classList.toggle('on', i === n));
      const next = imgs[flip ^= 1], prev = imgs[flip ^ 1]; next.onerror = () => { next.onerror = null; next.src = `assets/photos/${x.r.img}.jpg`; }; next.src = (LARGE.has(x.r.img) ? 'assets/photos/lg/' : 'assets/photos/') + x.r.img + '.jpg'; next.classList.add('on'); prev.classList.remove('on');
      root.querySelector('#v4pk').textContent = `${x.count} ${x.count === 1 ? 'expert' : 'experts'} · Roster ${String(n + 1).padStart(2, '0')}`; root.querySelector('#v4pt').textContent = title(x);
      root.querySelector('#v4pd').textContent = x.r.d; root.querySelector('#v4po').href = rosterUrl(x.r);
      const cs = Object.keys(m); root.querySelector('#v4pw').innerHTML = cs.length ? cs.map(k => `<span>${esc(k === "Cote d'Ivoire" ? "Côte d'Ivoire" : k)} · ${m[k]}</span>`).join('') : '<em>No experts on this roster yet.</em>';
      panelMap.setHighlight(m);
    }
    rows.forEach((r, i) => { r.addEventListener('mouseenter', () => setPanel(i)); r.addEventListener('focus', () => setPanel(i)); });
    setPanel(0);

    // ---- search: autocomplete + live map preview
    const input = root.querySelector('#v4q'), pop = root.querySelector('#v4pop'); let opts = [], sel = -1;
    function suggestions(text) {
      const t = text.trim().toLowerCase(), out = [], add = (type, label, sub, url) => out.push({ type, label, sub, url }), hit = s => !t || s.toLowerCase().includes(t);
      const rank = (a, b) => (b.label.toLowerCase().startsWith(t) - a.label.toLowerCase().startsWith(t));
      rosters.filter(x => hit(x.r.t)).slice(0, t ? 3 : 4).forEach(x => add('Roster', title(x), x.count + ' experts', rosterUrl(x.r)));
      if (t) {
        const sk = new Map(); EXP.forEach(e => e.skills.forEach(s => sk.set(s, (sk.get(s) || 0) + 1)));
        [...sk].filter(([s]) => hit(s)).map(([s, n]) => ({ label: s, n })).sort(rank).slice(0, 3).forEach(x => add('Skill', x.label, x.n + ' experts', resultsUrl({ skills: [x.label] })));
        [...langs].filter(l => hit(l)).map(l => ({ label: l, n: EXP.filter(e => (e.languages || []).includes(l)).length })).sort(rank).slice(0, 2).forEach(x => add('Language', x.label, x.n + ' experts', resultsUrl({ langs: [x.label] })));
        EXP.filter(e => hit(e.name) || hit(e.role)).slice(0, 3).forEach(e => add('Expert', e.name, e.role.replace(/ Specialist$/, ''), resultsUrl({ q: e.name })));
      }
      return out.slice(0, 9);
    }
    function paint() {
      opts = suggestions(input.value); sel = -1;
      if (!opts.length) { pop.hidden = true; input.setAttribute('aria-expanded', 'false'); return; }
      let last = '', html = '';
      opts.forEach((o, i) => { if (o.type !== last) { html += `<h4>${input.value.trim() ? o.type + 's' : 'Popular rosters'}</h4>`; last = o.type; } html += `<div class="v4-opt" role="option" id="v4o${i}" data-i="${i}"><span>${esc(o.label)}</span><small>${esc(o.sub)}</small></div>`; });
      pop.innerHTML = html; pop.hidden = false; input.setAttribute('aria-expanded', 'true');
    }
    const mark = n => { sel = (n + opts.length) % opts.length; pop.querySelectorAll('.v4-opt').forEach((el, i) => el.setAttribute('aria-selected', i === sel)); input.setAttribute('aria-activedescendant', 'v4o' + sel); pop.querySelector('#v4o' + sel).scrollIntoView({ block: 'nearest' }); };
    input.addEventListener('focus', paint);
    input.addEventListener('input', () => { paint(); preview(input.value); });
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); if (pop.hidden) paint(); mark(sel + 1); } else if (e.key === 'ArrowUp') { e.preventDefault(); mark(sel - 1); }
      else if (e.key === 'Escape') { pop.hidden = true; } else if (e.key === 'Enter' && sel >= 0) { e.preventDefault(); location.href = opts[sel].url; }
    });
    pop.addEventListener('mousedown', e => { const o = e.target.closest('.v4-opt'); if (o) { e.preventDefault(); location.href = opts[+o.dataset.i].url; } });
    document.addEventListener('click', e => { if (!root.querySelector('.v4-cmd').contains(e.target)) pop.hidden = true; });
    root.querySelector('#v4f').addEventListener('submit', e => { e.preventDefault(); const v = input.value.trim(); if (v) location.href = searchUrl(v); else input.focus(); });
    root.querySelectorAll('[data-q]').forEach(b => { b.onclick = () => { location.href = searchUrl(b.dataset.q); }; b.onmouseenter = b.onfocus = () => preview(b.dataset.q); b.onmouseleave = b.onblur = () => preview(input.value); });
    document.addEventListener('keydown', e => { if (e.key === '/' && document.body.dataset.ver === '4' && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); input.focus(); scrollTo({ top: 0, behavior: 'smooth' }); } });
  }

  window.initHomeV4 = function () { if (built) return; built = true; build(document.getElementById('v4')); };
})();
