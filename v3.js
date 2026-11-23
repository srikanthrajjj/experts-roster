// Home V3: premium photographic hero + featured bento tiles. Renders into #v3 on first use.
(function () {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ARROW = '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
  const SEARCH = '<svg width="26" height="26" fill="none" stroke="#1f2937" stroke-width="1.7" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
  const SHORT = { mncah: 'MNCAH Specialists', sbc: 'Social & Behaviour Change Specialists', network: 'External Expert Network', climate: 'Climate & Environment', hiv: 'HIV/AIDS Experts', finance: 'Financing for Scale', protect: 'Child Protection' };
  // corner swoosh colours per roster (UNICEF palette): [main, mid, light]
  const SW = { recovery: ['#0A6CFF', '#1CABE2', '#7fd0f5'], network: ['#0058AB', '#1CABE2', '#7fd0f5'], sbc: ['#1CABE2', '#27d3c5', '#8ee8e0'], climate: ['#00833D', '#2fb36a', '#9fe0b8'],
    finance: ['#F26A21', '#ffb02e', '#ffd88a'], hiv: ['#E2231A', '#ff5a8a', '#ffb3cb'], mncah: ['#d6336c', '#ff7bb5', '#ffc0dc'], edu: ['#0A6CFF', '#1CABE2', '#7fd0f5'],
    protect: ['#8b3dd9', '#d36bd0', '#f3b6ef'], cross: ['#1CABE2', '#0A6CFF', '#7fd0f5'] };
  let built = false;

  function build(root) {
    const EXP = DASH_EXPERTS;
    const rosters = ROSTERS.map((r, i) => ({ r, i, count: countRoster(r) }));
    const countries = new Set(EXP.map(e => e.location)).size;
    const skillMap = new Map(); EXP.forEach(e => e.skills.forEach(s => skillMap.set(s, (skillMap.get(s) || 0) + 1)));
    const langMap = new Map(); EXP.forEach(e => (e.languages || []).forEach(l => langMap.set(l, (langMap.get(l) || 0) + 1)));
    const ic = p => `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;

    root.innerHTML = `
    <header class="v3-nav"><div class="wrap">
      <a class="v3-logo" href="/"><img src="assets/unicef-logo-dxya9f98.png" alt="UNICEF" /><span class="tag">for every child</span><span class="reach">REACH</span></a>
      <nav class="v3-links" aria-label="Main"><a href="#">Home</a><a href="#" class="on">Rosters</a><a href="#">Expertise Map</a><a href="#">Resources</a></nav>
      <div class="v3-tools"><svg width="24" height="24" fill="none" stroke="#0b1d33" stroke-width="1.9" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        <span class="u" aria-hidden="true"><svg width="20" height="20" fill="none" stroke="#fff" stroke-width="1.9" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg></span></div>
    </div></header>

    <section class="v3-hero" aria-labelledby="v3h">
      <div class="v3-bg" role="img" aria-label="A smiling child with a blue backpack"></div>
      <div class="v3-hero-in wrap">
        <div class="v3-copy">
          <div class="eyebrow">REACH ROSTER</div>
          <h1 id="v3h">Global expertise<br>for children, <em>everywhere.<svg viewBox="0 0 200 18" preserveAspectRatio="none" fill="none"><path d="M3 14C50 4 120 3 197 8" stroke="#0A6CFF" stroke-width="3.5" stroke-linecap="round"/></svg></em></h1>
          <p class="v3-lead">Find and engage vetted specialists to support UNICEF&rsquo;s programmes around the world.</p>
          <div class="v3-cmd">
            <form class="v3-bar" id="v3f" role="search" autocomplete="off">
              ${SEARCH}
              <input id="v3q" role="combobox" aria-expanded="false" aria-controls="v3pop" aria-autocomplete="list" placeholder="Search by skill, topic or expertise (e.g. education, climate, gender)" aria-label="Search experts" />
              <button class="v3-go" type="submit">Find experts</button>
            </form>
            <div class="v3-pop" id="v3pop" role="listbox" hidden></div>
          </div>
          <div class="v3-pop-row">Popular searches:${['Education', 'Child Protection', 'Climate', 'Health', 'Recovery'].map(s => `<button type="button" data-q="${s}">${s}</button>`).join('')}</div>
        </div>
        <aside class="v3-stats" aria-label="Roster at a glance">
          <div class="row">${ic('<circle cx="14" cy="13" r="5"/><circle cx="27" cy="15" r="4"/><path d="M5 31c0-5 4-8 9-8s9 3 9 8M25 24c4 0 9 2 10 7"/>')}<div><b>${EXP.length}</b><span>Vetted experts</span></div></div>
          <div class="row">${ic('<path d="M20 6 5 14l15 8 15-8-15-8z"/><path d="m5 21 15 8 15-8M5 28l15 8 15-8"/>')}<div><b>${ROSTERS.length}</b><span>Roster areas</span></div></div>
          <div class="row">${ic('<circle cx="20" cy="20" r="14"/><path d="M6 20h28M20 6c5 5 5 23 0 28M20 6c-5 5-5 23 0 28"/>')}<div><b>${countries}</b><span>Countries covered</span></div></div>
        </aside>
      </div>
    </section>

    <section class="wrap v3-sec" aria-labelledby="v3r">
      <div class="v3-sec-h"><h2 id="v3r">Explore rosters</h2><button type="button" class="viewall" id="v3all" aria-expanded="false"><span>View all rosters</span>${ARROW}</button></div>
      <div class="v3-bento"><div id="v3feat"></div><div class="v3-right" id="v3right"></div></div>
      <div class="v3-more" id="v3more" hidden></div>
      <div class="v3-guide">
        <svg class="ic" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><circle cx="24" cy="24" r="19"/><circle cx="24" cy="24" r="12"/><circle cx="24" cy="24" r="5"/><path d="m26 22 14-14M36 8v6h6"/></svg>
        <h3>Not sure which roster to use?</h3><div class="sep"></div>
        <p>Answer a few quick questions and <b>we&rsquo;ll guide you to the right expertise.</b></p>
        <a class="btn-o" href="#">Get guidance ${ARROW}</a>
      </div>
    </section>`;

    // ---- bento: most experts = featured; next 7 fill the grid; the rest sit under "View all rosters"
    const items = rosters.slice().sort((a, b) => b.count - a.count || a.i - b.i);
    const tile = (x, n, feat) => {
      const [c1, c2, c3] = SW[x.r.img];
      const label = x.count + (x.count === 1 ? ' expert' : ' experts');
      const src = feat ? 'assets/photos/lg/' + x.r.img + '.jpg' : 'assets/photos/' + x.r.img + '.jpg';
      const title = esc(feat ? (SHORT[x.r.img] || x.r.t) : (SHORT[x.r.img] || x.r.t.replace(/ \(.*\)/, '')));
      return `<a class="tile${feat ? ' feat' : ''}${x.count ? '' : ' zero'}" href="${esc(rosterUrl(x.r))}" style="--i:${n};--pos:${POS[x.r.img]};--c1:${c1};--c2:${c2};--c3:${c3}" aria-label="${esc(x.r.t)}, ${label}">
        <img src="${src}" alt="" loading="lazy" onerror="this.onerror=null;this.src='assets/photos/${x.r.img}.jpg'" />
        <span class="sw2"></span><span class="sw"></span>
        ${feat ? '<span class="tagf">FEATURED</span>' : ''}
        <div class="cap"><h3>${title}</h3>${feat ? `<p>${esc(x.r.d)}</p><span class="cnt">${label} available</span><span class="btn-w">Explore roster ${ARROW}</span>` : `<span class="n">${label}</span>`}</div>
      </a>`;
    };
    root.querySelector('#v3feat').innerHTML = tile(items[0], 0, true);
    root.querySelector('#v3right').innerHTML = items.slice(1, 8).map((x, n) => tile(x, n + 1, false)).join('');
    const more = root.querySelector('#v3more'), allBtn = root.querySelector('#v3all');
    more.innerHTML = items.slice(8).map((x, n) => tile(x, n + 8, false)).join('');
    if (items.length <= 8) allBtn.hidden = true;
    allBtn.onclick = () => { const open = more.hidden; more.hidden = !open; allBtn.setAttribute('aria-expanded', open); allBtn.firstElementChild.textContent = open ? 'Show fewer' : 'View all rosters'; };

    // ---- smart search (autocomplete)
    const input = root.querySelector('#v3q'), pop = root.querySelector('#v3pop');
    let opts = [], sel = -1;
    function suggestions(text) {
      const t = text.trim().toLowerCase(), out = [];
      const add = (type, label, sub, url) => out.push({ type, label, sub, url });
      const hit = s => !t || s.toLowerCase().includes(t);
      const rank = (a, b) => (b.label.toLowerCase().startsWith(t) - a.label.toLowerCase().startsWith(t));
      rosters.filter(x => hit(x.r.t)).sort((a, b) => b.count - a.count).slice(0, t ? 3 : 4).forEach(x => add('Roster', x.r.t, x.count + ' experts', rosterUrl(x.r)));
      if (t) {
        [...skillMap].filter(([s]) => hit(s)).map(([s, n]) => ({ label: s, n })).sort(rank).slice(0, 3).forEach(x => add('Skill', x.label, x.n + ' experts', resultsUrl({ skills: [x.label] })));
        [...langMap].filter(([l]) => hit(l)).map(([l, n]) => ({ label: l, n })).sort(rank).slice(0, 2).forEach(x => add('Language', x.label, x.n + ' experts', resultsUrl({ langs: [x.label] })));
        EXP.filter(e => hit(e.name) || hit(e.role)).slice(0, 3).forEach(e => add('Expert', e.name, e.role.replace(/ Specialist$/, ''), resultsUrl({ q: e.name })));
      }
      return out.slice(0, 9);
    }
    function paint() {
      opts = suggestions(input.value); sel = -1;
      if (!opts.length) { pop.hidden = true; input.setAttribute('aria-expanded', 'false'); return; }
      let last = '', html = '';
      opts.forEach((o, i) => { if (o.type !== last) { html += `<h4>${input.value.trim() ? o.type + 's' : 'Popular rosters'}</h4>`; last = o.type; } html += `<div class="v3-opt" role="option" id="v3o${i}" data-i="${i}"><span>${esc(o.label)}</span><small>${esc(o.sub)}</small></div>`; });
      pop.innerHTML = html; pop.hidden = false; input.setAttribute('aria-expanded', 'true');
    }
    function mark(n) { sel = (n + opts.length) % opts.length; pop.querySelectorAll('.v3-opt').forEach((el, i) => el.setAttribute('aria-selected', i === sel)); input.setAttribute('aria-activedescendant', 'v3o' + sel); pop.querySelector('#v3o' + sel).scrollIntoView({ block: 'nearest' }); }
    input.addEventListener('focus', paint); input.addEventListener('input', paint);
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); if (pop.hidden) paint(); mark(sel + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); mark(sel - 1); }
      else if (e.key === 'Escape') { pop.hidden = true; }
      else if (e.key === 'Enter' && sel >= 0) { e.preventDefault(); location.href = opts[sel].url; }
    });
    pop.addEventListener('mousedown', e => { const o = e.target.closest('.v3-opt'); if (o) { e.preventDefault(); location.href = opts[+o.dataset.i].url; } });
    document.addEventListener('click', e => { if (!root.querySelector('.v3-cmd').contains(e.target)) pop.hidden = true; });
    root.querySelector('#v3f').addEventListener('submit', e => { e.preventDefault(); const v = input.value.trim(); if (v) location.href = searchUrl(v); else input.focus(); });
    root.querySelectorAll('[data-q]').forEach(b => b.onclick = () => { location.href = searchUrl(b.dataset.q); });
    document.addEventListener('keydown', e => { if (e.key === '/' && document.body.dataset.ver === '3' && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); input.focus(); } });
  }

  window.initHomeV3 = function () { if (built) return; built = true; build(document.getElementById('v3')); };
})();
