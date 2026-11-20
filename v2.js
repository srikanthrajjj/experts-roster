// Home V2: immersive hero with smart search + bento roster tiles. Renders into #v2 on first use.
(function () {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ARROW = '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
  const SEARCH = '<svg width="22" height="22" fill="none" stroke="#334155" stroke-width="1.9" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
  const initials = n => n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  let built = false;

  function build(root) {
    const EXP = DASH_EXPERTS;
    const members = r => EXP.filter(e => r.skills.some(s => e.skills.includes(s)));
    const rosters = ROSTERS.map((r, i) => ({ r, i, list: members(r), count: countRoster(r) }));
    const top = rosters.slice().sort((a, b) => b.count - a.count)[0];
    const skillMap = new Map(); EXP.forEach(e => e.skills.forEach(s => skillMap.set(s, (skillMap.get(s) || 0) + 1)));
    const langMap = new Map(); EXP.forEach(e => (e.languages || []).forEach(l => langMap.set(l, (langMap.get(l) || 0) + 1)));
    const countries = new Set(EXP.map(e => e.location)).size;

    root.innerHTML = `
    <section class="v2-hero" aria-labelledby="v2h">
      <div class="wrap v2-in">
        <div>
          <span class="v2-pill"><i></i> REACH &middot; Expert rosters</span>
          <h1 id="v2h">Find the expert your <span class="grad">programme</span> needs</h1>
          <p class="v2-lead">Search ${EXP.length} vetted specialists across ${ROSTERS.length} rosters by skill, language, topic or name &mdash; and go straight to their profiles.</p>
          <div class="v2-cmd">
            <form class="v2-bar" id="v2f" role="search" autocomplete="off">
              ${SEARCH}
              <input id="v2q" role="combobox" aria-expanded="false" aria-controls="v2pop" aria-autocomplete="list" placeholder="Try &ldquo;vaccination&rdquo;, &ldquo;French&rdquo; or an expert&rsquo;s name" aria-label="Search experts" />
              <kbd title="Press / to search">/</kbd>
              <button class="v2-go" type="submit">Find experts</button>
            </form>
            <div class="v2-pop" id="v2pop" role="listbox" hidden></div>
          </div>
          <div class="v2-quick">Quick start:
            ${['vaccination', 'climate', 'gender', 'WASH', 'French'].map(s => `<button type="button" data-q="${s}">${s}</button>`).join('')}
          </div>
        </div>
        <div class="v2-vis" aria-hidden="true">
          <img class="p1" src="assets/photos/mncah.jpg" alt="" />
          <img class="p2" src="assets/photos/sbc.jpg" alt="" />
          <img class="p3" src="assets/photos/edu.jpg" alt="" />
          <div class="fc a"><b>${top.count}</b><span>experts in our<br>top roster</span></div>
          <div class="fc b"><b>${langMap.size}</b><span>languages<br>covered</span></div>
        </div>
      </div>
      <div class="wrap v2-stats">
        ${[[EXP.length, 'Vetted experts'], [ROSTERS.length, 'Specialist rosters'], [countries, 'Countries represented'], [langMap.size, 'Languages spoken']].map(([n, l]) => `<div class="v2-stat"><b data-n="${n}">0</b><span>${l}</span></div>`).join('')}
      </div>
    </section>

    <section class="wrap v2-sec" aria-labelledby="v2r">
      <div class="v2-sec-h">
        <div><h2 id="v2r">Explore our rosters</h2><p>Bigger tiles have more experts available. Pick one to open its profiles.</p></div>
        <div class="v2-ctl">
          <label class="flt" aria-label="Filter rosters">${SEARCH.replace('width="22" height="22"', 'width="16" height="16"')}<input id="v2flt" placeholder="Filter rosters&hellip;" /></label>
          <div class="seg" role="group" aria-label="Show"><button type="button" data-show="all" aria-pressed="true">All</button><button type="button" data-show="has" aria-pressed="false">With experts</button></div>
          <div class="seg" role="group" aria-label="Sort"><button type="button" data-sort="count" aria-pressed="true">Most experts</button><button type="button" data-sort="az" aria-pressed="false">A&ndash;Z</button></div>
        </div>
      </div>
      <div class="v2-grid" id="v2grid"></div>
    </section>
    <div class="v2-note-gap"></div>`;

    // ---- stat count-up
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    root.querySelectorAll('[data-n]').forEach(el => {
      const to = +el.dataset.n; if (reduce) { el.textContent = to; return; }
      const t0 = performance.now(); (function tick(t) { const p = Math.min(1, (t - t0) / 900); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); })(t0);
    });

    // ---- tiles
    const state = { show: 'all', sort: 'count', q: '' };
    const grid = root.querySelector('#v2grid');
    function renderTiles() {
      let items = rosters.filter(x => (state.show === 'all' || x.count > 0) && (!state.q || (x.r.t + ' ' + x.r.d + ' ' + x.r.tags.join(' ')).toLowerCase().includes(state.q)));
      items = items.slice().sort(state.sort === 'az' ? (a, b) => a.r.t.localeCompare(b.r.t) : (a, b) => b.count - a.count || a.i - b.i);
      if (!items.length) { grid.innerHTML = '<div class="none">No rosters match your filter.</div>'; return; }
      grid.innerHTML = items.map((x, n) => {
        const cls = state.sort === 'count' && state.show === 'all' && !state.q ? (n === 0 ? 'xl' : n < 3 ? 'wide' : '') : '';
        const names = x.list.slice(0, 3).map(e => `<i title="${esc(e.name)}">${esc(initials(e.name))}</i>`).join('');
        return `<a class="tile ${cls}${x.count ? '' : ' zero'}" href="${esc(rosterUrl(x.r))}" style="--i:${n};--pos:${POS[x.r.img]}" aria-label="${esc(x.r.t)}, ${x.count} ${x.count === 1 ? 'expert' : 'experts'}">
          <div class="bg" style="background-image:url(assets/photos/${x.r.img}.jpg)"></div>
          <div class="badge"><b>${x.count}</b><span>${x.count === 1 ? 'expert' : 'experts'}</span></div>
          ${x.count ? '' : '<div class="soon">Growing soon</div>'}
          <h3>${esc(x.r.t)}</h3>
          <p>${esc(x.r.d)}</p>
          <div class="tl-foot"><div class="tags">${x.r.tags.map(t => `<span>${esc(t)}</span>`).join('')}</div>${names ? `<div class="av" aria-hidden="true">${names}</div>` : ''}<span class="go" aria-hidden="true">${ARROW}</span></div>
        </a>`;
      }).join('');
    }
    root.querySelectorAll('[data-show]').forEach(b => b.onclick = () => { state.show = b.dataset.show; root.querySelectorAll('[data-show]').forEach(x => x.setAttribute('aria-pressed', x === b)); renderTiles(); });
    root.querySelectorAll('[data-sort]').forEach(b => b.onclick = () => { state.sort = b.dataset.sort; root.querySelectorAll('[data-sort]').forEach(x => x.setAttribute('aria-pressed', x === b)); renderTiles(); });
    root.querySelector('#v2flt').oninput = e => { state.q = e.target.value.trim().toLowerCase(); renderTiles(); };
    renderTiles();

    // ---- smart search (autocomplete)
    const input = root.querySelector('#v2q'), pop = root.querySelector('#v2pop');
    let opts = [], sel = -1;
    const ICON = { Roster: '🗂️', Skill: '🧩', Language: '🗣️', Expert: '👤' };
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
      opts.forEach((o, i) => { if (o.type !== last) { html += `<h4>${input.value.trim() ? o.type + 's' : 'Popular rosters'}</h4>`; last = o.type; } html += `<div class="v2-opt" role="option" id="v2o${i}" data-i="${i}"><span class="ic">${ICON[o.type]}</span><span>${esc(o.label)}</span><small>${esc(o.sub)}</small></div>`; });
      pop.innerHTML = html; pop.hidden = false; input.setAttribute('aria-expanded', 'true');
    }
    function mark(n) { sel = (n + opts.length) % opts.length; pop.querySelectorAll('.v2-opt').forEach((el, i) => el.setAttribute('aria-selected', i === sel)); input.setAttribute('aria-activedescendant', 'v2o' + sel); pop.querySelector('#v2o' + sel).scrollIntoView({ block: 'nearest' }); }
    input.addEventListener('focus', paint); input.addEventListener('input', paint);
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); if (pop.hidden) paint(); mark(sel + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); mark(sel - 1); }
      else if (e.key === 'Escape') { pop.hidden = true; }
      else if (e.key === 'Enter' && sel >= 0) { e.preventDefault(); location.href = opts[sel].url; }
    });
    pop.addEventListener('mousedown', e => { const o = e.target.closest('.v2-opt'); if (o) { e.preventDefault(); location.href = opts[+o.dataset.i].url; } });
    document.addEventListener('click', e => { if (!root.querySelector('.v2-cmd').contains(e.target)) pop.hidden = true; });
    root.querySelector('#v2f').addEventListener('submit', e => { e.preventDefault(); const v = input.value.trim(); if (v) location.href = searchUrl(v); else input.focus(); });
    root.querySelectorAll('[data-q]').forEach(b => b.onclick = () => { location.href = searchUrl(b.dataset.q); });
    document.addEventListener('keydown', e => { if (e.key === '/' && document.body.dataset.ver === '2' && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); input.focus(); } });
  }

  window.initHomeV2 = function () { if (built) return; built = true; build(document.getElementById('v2')); };
})();
