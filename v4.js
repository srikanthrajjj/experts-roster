// Home V4: a sentence-style search ("Find experts in [field] who speak [language] based in [country]") over flat colour-blocked roster tiles.
(function () {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
  const CARET = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m2 4 4 4 4-4"/></svg>';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LARGE = new Set(['recovery', 'network', 'sbc', 'climate', 'finance', 'hiv', 'mncah', 'cross']); // rosters with a high-resolution photo
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
  // flat UNICEF palette per roster: [background, text]
  const TONE = { cross: ['#FFC20E', '#0b1d33'], network: ['#0058AB', '#fff'], protect: ['#F26A21', '#0b1d33'], recovery: ['#DDEFFA', '#0b1d33'], sbc: ['#00833D', '#fff'],
    edu: ['#0096FF', '#0b1d33'], climate: ['#DDF2E3', '#0b1d33'], finance: ['#FFE7A3', '#0b1d33'], hiv: ['#E2231A', '#fff'], mncah: ['#0b1d33', '#fff'], _: ['#DDEFFA', '#0b1d33'] };
  // how a field reads inside the sentence
  const SAY = { 'Early Childhood Development': 'early childhood', 'Social & Behaviour Change': 'behaviour change', 'Adolescent Development': 'adolescents', 'Financing for Scale': 'financing', 'Digital Infrastructure': 'digital', 'Humanitarian Action': 'humanitarian action' };
  const say = a => SAY[a] || (a === 'WASH' ? 'WASH' : a.toLowerCase());
  const locParam = c => (c === "Cote d'Ivoire" ? 'Cote' : c);
  const niceLoc = c => (c === "Cote d'Ivoire" ? 'Côte d’Ivoire' : c);
  let built = false;

  function build(root) {
    const EXP = DASH_EXPERTS;
    const rosters = ROSTERS.map((r, i) => ({ r, i, count: countRoster(r) })).sort((a, b) => b.count - a.count || a.i - b.i);
    const name = x => x.r.t.replace(/ \(.*\)/, '');
    const photo = (x, big) => (big && LARGE.has(x.r.img) ? 'assets/photos/lg/' : 'assets/photos/') + x.r.img + '.jpg';
    const tally = (keyOf, uni) => { const m = new Map(); EXP.forEach(e => keyOf(e).forEach(k => m.set(k, (m.get(k) || 0) + 1))); return [...m].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(b[0])).filter(([k]) => !uni || uni(k)).map(([k]) => k); };
    const fields = tally(e => AREAS.filter(a => e.globalPracticeArea === a || e.skills.includes(a)));
    const langsList = tally(e => e.languages || []);
    const places = tally(e => [e.location].filter(Boolean));
    const sel = { area: '', lang: '', loc: '' };
    const matches = () => EXP.filter(e => (!sel.area || e.globalPracticeArea === sel.area || e.skills.includes(sel.area)) && (!sel.lang || (e.languages || []).includes(sel.lang)) && (!sel.loc || e.location === sel.loc));
    const pill = (id, label, def, opts) => `<span class="pill" id="${id}p"><span class="pv">${esc(def)}</span>${CARET}<select id="${id}" aria-label="${esc(label)}"><option value="">${esc(def)}</option>${opts.map(([v, t]) => `<option value="${esc(v)}">${esc(t)}</option>`).join('')}</select></span>`;
    const feat = rosters[0], rest = rosters.slice(1);
    const tile = (x, n, big, last) => {
      const [bg, fg] = TONE[x.r.img] || TONE._;
      return `<a class="t${big ? ' big' : ''}${x.count ? '' : ' zero'}${last ? ' last-odd' : ''} rv" href="${esc(rosterUrl(x.r))}" style="--bg:${bg};--fg:${fg};--pos:${POS[x.r.img]};--d:${big ? 0 : (n % 3) * 70}ms" aria-label="${esc(name(x))}, ${plural(x.count, 'expert')}">
        ${big ? `<div class="top"><span class="k">Largest roster</span><h3>${esc(name(x))}</h3><p>${esc(x.r.d)}</p></div>` : `<h3>${esc(name(x))}</h3>`}
        <div class="cnt"><b>${x.count}</b><span>${x.count ? (x.count === 1 ? 'expert' : 'experts') + (big ? ' available' : '') : 'No experts yet'}</span></div>
        <div class="arch"><img src="${photo(x, big)}" alt="" ${big ? '' : 'loading="lazy"'} /></div>
      </a>`;
    };

    root.innerHTML = `
    <section class="v4-hero" aria-label="Find an expert">
      <div class="v4-nav"><a class="v4-logo" href="/"><img src="assets/unicef-logo-dxya9f98.png" alt="UNICEF" /><b>REACH</b></a>
        <nav class="v4-links" aria-label="Main"><a href="#">Home</a><a href="#v4rosters" class="on">Rosters</a><a href="#">Resources</a><a href="#">Help &amp; contact</a></nav></div>
      <div class="v4-body">
        <div class="v4-form"><form id="v4f" autocomplete="off">
          <h1 class="sr">Find the right expert</h1>
          <p class="v4-sentence"><span class="cl">Find experts in ${pill('v4a', 'Field of expertise', 'any field', fields.map(a => [a, a]))}</span> <span class="cl">who speak ${pill('v4l', 'Language', 'any language', langsList.map(l => [l, l]))}</span> <span class="cl">based in ${pill('v4c', 'Country', 'anywhere', places.map(c => [c, niceLoc(c)]))}</span></p>
          <div class="v4-act">
            <button class="v4-cta" id="v4go" type="submit"><span id="v4cta"></span><i>${ARROW}</i></button>
          </div>
        </form>
        <form class="v4-kw" id="v4k" role="search" autocomplete="off"><input id="v4q" placeholder="Or search by name or keyword" aria-label="Search by name or keyword" /><button type="submit" aria-label="Search">${ARROW}</button></form></div>
        <div class="v4-arch" aria-hidden="true"><img src="assets/v4/portrait.jpg" alt="" /></div>
      </div>
    </section>

    <section class="wrap v4-sec" id="v4rosters" aria-labelledby="v4r">
      <div class="v4-sec-h"><h2 id="v4r">Browse by<br>roster</h2><p>${rosters.length} specialist rosters, ranked by how many experts each holds.</p></div>
      <div class="v4-tiles">${tile(feat, 0, true)}${rest.map((x, n) => tile(x, n + 1, false, rest.length % 2 === 1 && n === rest.length - 1)).join('')}</div>
      <div class="v4-guide rv" style="margin-top:16px"><div><h3>Not sure where to start?</h3><p>Answer a few quick questions and we&rsquo;ll point you to the right roster.</p></div><a class="v4-btn" href="#">Get guidance</a></div>
      <div class="v4-foot"><span>Before engaging an expert, review UNICEF&rsquo;s recruitment and procurement requirements.</span><a href="#">Read the guidance</a></div>
    </section>`;

    // ---- the sentence: a live count on the button; the button opens the experts page with exactly those filters
    const form = root.querySelector('#v4f'), go = root.querySelector('#v4go'), cta = root.querySelector('#v4cta');
    function refresh() {
      const n = matches().length, any = sel.area || sel.lang || sel.loc;
      cta.innerHTML = n ? `${any ? 'Show' : 'Browse'} <b>${n}</b> ${n === 1 ? 'expert' : 'experts'}` : 'No experts match yet';
      go.setAttribute('aria-disabled', n ? 'false' : 'true');
    }
    [['v4a', 'area', v => (v ? say(v) : 'any field')], ['v4l', 'lang', v => (v ? v : 'any language')], ['v4c', 'loc', v => (v ? niceLoc(v) : 'anywhere')]].forEach(([id, key, label]) => {
      const s = root.querySelector('#' + id), p = root.querySelector('#' + id + 'p');
      s.addEventListener('change', () => { sel[key] = s.value; p.querySelector('.pv').textContent = label(s.value); p.classList.toggle('set', !!s.value); refresh(); });
    });
    form.addEventListener('submit', e => {
      e.preventDefault(); if (go.getAttribute('aria-disabled') === 'true') return;
      const u = new URLSearchParams(); if (sel.area) u.set('area', sel.area); if (sel.lang) u.append('lang', sel.lang); if (sel.loc) u.set('loc', locParam(sel.loc));
      location.href = 'experts.html' + (u.toString() ? '?' + u : '');
    });
    refresh();
    root.querySelector('#v4k').addEventListener('submit', e => { e.preventDefault(); const v = root.querySelector('#v4q').value.trim(); if (v) location.href = searchUrl(v); else root.querySelector('#v4q').focus(); });

    // gentle reveal as tiles enter
    const items = root.querySelectorAll('.rv');
    if (reduce || !('IntersectionObserver' in window)) items.forEach(el => el.classList.add('in'));
    else { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.1, rootMargin: '0px 0px -5% 0px' }); items.forEach(el => io.observe(el)); }
  }

  window.initHomeV4 = function () { if (built) return; built = true; build(document.getElementById('v4')); };
})();
