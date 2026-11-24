// Home V4: restrained, typographic. Search + a featured roster + a calm index of the rest. Renders into #v4 on first use.
(function () {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const CHEV = '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 2 5 5-5 5"/></svg>';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LARGE = new Set(['recovery', 'network', 'sbc', 'climate', 'finance', 'hiv', 'mncah', 'cross']); // rosters with a high-resolution photo
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
  let built = false;

  function build(root) {
    const EXP = DASH_EXPERTS;
    const rosters = ROSTERS.map((r, i) => ({ r, i, count: countRoster(r) })).sort((a, b) => b.count - a.count || a.i - b.i);
    const skillMap = new Map(); EXP.forEach(e => e.skills.forEach(s => skillMap.set(s, (skillMap.get(s) || 0) + 1)));
    const langs = new Map(); EXP.forEach(e => (e.languages || []).forEach(l => langs.set(l, (langs.get(l) || 0) + 1)));
    const name = x => x.r.t.replace(/ \(.*\)/, '');
    const photo = (x, big) => (big && LARGE.has(x.r.img) ? 'assets/photos/lg/' : 'assets/photos/') + x.r.img + '.jpg';
    const feat = rosters[0], rest = rosters.slice(1);

    root.innerHTML = `
    <header class="v4-nav" id="v4nav"><div class="wrap">
      <a class="v4-logo" href="/"><img src="assets/unicef-logo-dxya9f98.png" alt="UNICEF" /><b>REACH</b></a>
      <nav class="v4-links" aria-label="Main"><a href="#">Home</a><a href="#v4rosters" class="on">Rosters</a><a href="#">Resources</a><a href="#">Help &amp; contact</a></nav>
    </div></header>

    <section class="v4-hero" aria-label="Find an expert"><div class="wrap">
      <div>
        <h1><span>Find the expert</span> <span>your programme needs.</span></h1>
        <p class="v4-lead">Search UNICEF&rsquo;s vetted specialists by skill, language or name &mdash; or browse a roster below.</p>
        <div class="v4-cmd">
          <form class="v4-bar" id="v4f" role="search" autocomplete="off">
            <input id="v4q" role="combobox" aria-expanded="false" aria-controls="v4pop" aria-autocomplete="list" placeholder="Search skill, language or name" aria-label="Search experts" />
            <button class="v4-go" type="submit">Search</button>
          </form>
          <div class="v4-pop" id="v4pop" role="listbox" hidden></div>
        </div>
        <div class="v4-hint" aria-live="polite">
          <div class="v4-pop-row" id="v4popular"><span>Popular</span>${['Education', 'Child Protection', 'Climate', 'Health', 'Recovery'].map(s => `<button type="button" data-q="${s}">${s}</button>`).join('')}</div>
          <div class="v4-msg" id="v4msg" hidden></div>
        </div>
      </div>
      <figure class="v4-photo"><img src="assets/v4/portrait.jpg" alt="A smiling child with a blue backpack" /></figure>
    </div></section>

    <section class="wrap v4-sec" id="v4rosters" aria-labelledby="v4r">
      <div class="v4-sec-h"><h2 id="v4r">Rosters</h2><a class="link" href="experts.html">All ${EXP.length} experts ${CHEV}</a></div>
      <a class="v4-feat rv" href="${esc(rosterUrl(feat.r))}" style="--pos:${POS[feat.r.img]}" aria-label="${esc(name(feat))}, ${plural(feat.count, 'expert')}">
        <div class="ph"><img src="${photo(feat, true)}" alt="" /></div>
        <div class="tx"><span class="k">Largest roster</span><h3>${esc(name(feat))}</h3><p>${esc(feat.r.d)}</p>
          <div class="n"><b>${feat.count}</b> ${feat.count === 1 ? 'expert' : 'experts'}</div><span class="link">Explore roster ${CHEV}</span></div>
      </a>
      <div class="v4-grid">${rest.map((x, n) => `
        <a class="v4-card rv${x.count ? '' : ' zero'}" href="${esc(rosterUrl(x.r))}" style="--pos:${POS[x.r.img]};--d:${(n % 3) * 70}ms" aria-label="${esc(name(x))}, ${plural(x.count, 'expert')}">
          <div class="ph"><img src="${photo(x, false)}" alt="" loading="lazy" /></div>
          <h3>${esc(name(x))}</h3><p class="c">${x.count ? plural(x.count, 'expert') : 'No experts yet'}</p>
        </a>`).join('')}</div>
      <div class="v4-guide rv"><div><h3>Not sure which roster fits?</h3><p>Answer a few quick questions and we&rsquo;ll point you to the right expertise.</p></div><a class="v4-btn" href="#">Get guidance</a></div>
      <div class="v4-foot"><span>Before engaging an expert, review UNICEF&rsquo;s recruitment and procurement requirements.</span><a class="link" href="#">Read the guidance ${CHEV}</a></div>
    </section>`;

    // nav hairline once scrolled; gentle reveal as cards enter
    const nav = root.querySelector('#v4nav'); const onScroll = () => nav.classList.toggle('scrolled', scrollY > 8); addEventListener('scroll', onScroll, { passive: true }); onScroll();
    const items = root.querySelectorAll('.rv');
    if (reduce || !('IntersectionObserver' in window)) items.forEach(el => el.classList.add('in'));
    else { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }); items.forEach(el => io.observe(el)); }

    // ---- search: suggestions + a plain-language preview of what the search will return
    const input = root.querySelector('#v4q'), pop = root.querySelector('#v4pop'), msg = root.querySelector('#v4msg'), popular = root.querySelector('#v4popular'); let opts = [], sel = -1;
    function preview(text) {
      const t = text.trim();
      if (!t) { msg.hidden = true; popular.hidden = false; return; }
      const n = expertsForSearch(t).length; popular.hidden = true; msg.hidden = false;
      msg.innerHTML = n ? `<b>${plural(n, 'expert')}</b> match &ldquo;${esc(t)}&rdquo;. Press Enter to view them.` : `No experts match &ldquo;${esc(t)}&rdquo; yet. Try a skill or a language.`;
    }
    function suggestions(text) {
      const t = text.trim().toLowerCase(), out = [], add = (type, label, sub, url) => out.push({ type, label, sub, url }), hit = s => !t || s.toLowerCase().includes(t);
      const rank = (a, b) => (b.label.toLowerCase().startsWith(t) - a.label.toLowerCase().startsWith(t));
      rosters.filter(x => hit(x.r.t)).slice(0, t ? 3 : 4).forEach(x => add('Roster', name(x), plural(x.count, 'expert'), rosterUrl(x.r)));
      if (t) {
        [...skillMap].filter(([s]) => hit(s)).map(([s, n]) => ({ label: s, n })).sort(rank).slice(0, 3).forEach(x => add('Skill', x.label, plural(x.n, 'expert'), resultsUrl({ skills: [x.label] })));
        [...langs].filter(([l]) => hit(l)).map(([l, n]) => ({ label: l, n })).sort(rank).slice(0, 2).forEach(x => add('Language', x.label, plural(x.n, 'expert'), resultsUrl({ langs: [x.label] })));
        EXP.filter(e => hit(e.name) || hit(e.role)).slice(0, 3).forEach(e => add('Expert', e.name, e.role.replace(/ Specialist$/, ''), resultsUrl({ q: e.name })));
      }
      return out.slice(0, 9);
    }
    function paint() {
      opts = suggestions(input.value); sel = -1;
      if (!opts.length) { pop.hidden = true; input.setAttribute('aria-expanded', 'false'); return; }
      let last = '', html = '';
      opts.forEach((o, i) => { if (o.type !== last) { html += `<h4>${input.value.trim() ? o.type + 's' : 'Rosters'}</h4>`; last = o.type; } html += `<div class="v4-opt" role="option" id="v4o${i}" data-i="${i}"><span>${esc(o.label)}</span><small>${esc(o.sub)}</small></div>`; });
      pop.innerHTML = html; pop.hidden = false; input.setAttribute('aria-expanded', 'true');
    }
    const mark = n => { if (!opts.length) return; sel = (n + opts.length) % opts.length; pop.querySelectorAll('.v4-opt').forEach((el, i) => el.setAttribute('aria-selected', i === sel)); input.setAttribute('aria-activedescendant', 'v4o' + sel); const cur = pop.querySelector('#v4o' + sel); if (cur) cur.scrollIntoView({ block: 'nearest' }); };
    input.addEventListener('focus', paint);
    input.addEventListener('input', () => { paint(); preview(input.value); });
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); if (pop.hidden) paint(); mark(sel + 1); } else if (e.key === 'ArrowUp') { e.preventDefault(); mark(sel - 1); }
      else if (e.key === 'Escape') { pop.hidden = true; } else if (e.key === 'Enter' && sel >= 0) { e.preventDefault(); location.href = opts[sel].url; }
    });
    pop.addEventListener('mousedown', e => { const o = e.target.closest('.v4-opt'); if (o) { e.preventDefault(); location.href = opts[+o.dataset.i].url; } });
    document.addEventListener('click', e => { if (!root.querySelector('.v4-cmd').contains(e.target)) pop.hidden = true; });
    root.querySelector('#v4f').addEventListener('submit', e => { e.preventDefault(); const v = input.value.trim(); if (v) location.href = searchUrl(v); else input.focus(); });
    root.querySelectorAll('[data-q]').forEach(b => { b.onclick = () => { location.href = searchUrl(b.dataset.q); }; });
    document.addEventListener('keydown', e => { if (e.key === '/' && document.body.dataset.ver === '4' && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); input.focus(); scrollTo({ top: 0, behavior: 'smooth' }); } });
  }

  window.initHomeV4 = function () { if (built) return; built = true; build(document.getElementById('v4')); };
})();
