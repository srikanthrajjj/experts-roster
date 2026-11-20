// Home V2: immersive hero with smart search + bento roster tiles. Renders into #v2 on first use.
(function () {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ARROW = '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
  const SEARCH = '<svg width="22" height="22" fill="none" stroke="#334155" stroke-width="1.9" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
  const initials = n => n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  let built = false;

  const I = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const ICONS = {
    recovery: I('<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>'),
    network: I('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>'),
    sbc: I('<path d="M4 5h11a2 2 0 012 2v6a2 2 0 01-2 2H9l-4 3v-3H4a1 1 0 01-1-1V6a1 1 0 011-1z"/><path d="M19 9h1a1 1 0 011 1v7l-3-2h-4"/>'),
    climate: I('<path d="M5 19c0-9 5-14 15-14 0 10-5 15-14 15"/><path d="M5 19c3-5 6-8 10-10"/>'),
    finance: I('<circle cx="12" cy="12" r="9"/><path d="M14.5 9.2c-.6-.8-1.5-1.2-2.5-1.2-1.4 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1.1 2-2.5 2c-1 0-1.9-.4-2.5-1.2M12 6v2M12 16v2"/>'),
    hiv: I('<path d="M12 21s-7-4.6-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.4-7 10-7 10z"/><path d="M12 9v5M9.5 11.5h5"/>'),
    mncah: I('<path d="M12 21s-8-5-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 6-8 11-8 11z"/>'),
    edu: I('<path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M7 9.5V15c0 1.5 2.5 3 5 3s5-1.5 5-3V9.5"/><path d="M21 7v6"/>'),
    protect: I('<path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/>'),
    cross: I('<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><path d="M17 13v8M13 17h8"/>')
  };
  const COL = {
    recovery: ['#ffe5d3', '#e8590c'], network: ['#dfe8ff', '#2f5bea'], sbc: ['#e9e1ff', '#7048e8'], climate: ['#d9f5e3', '#2b8a3e'], finance: ['#fff1b8', '#b7791f'],
    hiv: ['#ffdde2', '#d6336c'], mncah: ['#d6efff', '#1c7ed6'], edu: ['#e2e9ff', '#364fc7'], protect: ['#d3f4ec', '#0b7285'], cross: ['#ffe0f0', '#c2255c']
  };

  function build(root) {
    const EXP = DASH_EXPERTS;
    const members = r => EXP.filter(e => r.skills.some(s => e.skills.includes(s)));
    const rosters = ROSTERS.map((r, i) => ({ r, i, list: members(r), count: countRoster(r) }));
    const top = rosters.slice().sort((a, b) => b.count - a.count)[0];
    const skillMap = new Map(); EXP.forEach(e => e.skills.forEach(s => skillMap.set(s, (skillMap.get(s) || 0) + 1)));
    const langMap = new Map(); EXP.forEach(e => (e.languages || []).forEach(l => langMap.set(l, (langMap.get(l) || 0) + 1)));
    const countries = new Set(EXP.map(e => e.location)).size;

    const tone = ['#e9e1ff', '#fff', '#fff3c4'], pick = [EXP[0], EXP[5], EXP[3]];
    const ecard = (e, k) => `<div class="ec e${k}"><div class="top"><div class="ava" style="background:${['#ffe0f0', '#d6efff', '#d9f5e3'][k - 1]}">${esc(initials(e.name))}</div><div><b>${esc(e.name)}</b><small>${esc(e.role)}</small></div></div><div class="row"><span class="ok">Available</span>${(e.languages || []).slice(0, 2).map(l => `<span>${esc(l)}</span>`).join('')}</div></div>`;
    root.innerHTML = `
    <section class="v2-hero" aria-labelledby="v2h">
      <div class="v2-blobs"><span class="v2-blob a"></span><span class="v2-blob b"></span></div>
      <div class="wrap v2-in">
        <div>
          <span class="v2-pill"><i></i> REACH &middot; ${EXP.length} experts ready to deploy</span>
          <h1 id="v2h">Find the expert your <span class="hl">programme</span> needs.</h1>
          <p class="v2-lead">Search UNICEF&rsquo;s vetted specialists by skill, language, topic or name &mdash; then jump straight to their profiles.</p>
          <div class="v2-cmd">
            <form class="v2-bar" id="v2f" role="search" autocomplete="off">
              ${SEARCH}
              <input id="v2q" role="combobox" aria-expanded="false" aria-controls="v2pop" aria-autocomplete="list" placeholder="Skill, language or name" aria-label="Search experts" />
              <kbd title="Press / to search">/</kbd>
              <button class="v2-go" type="submit">Find experts</button>
            </form>
            <div class="v2-pop" id="v2pop" role="listbox" hidden></div>
          </div>
          <div class="v2-quick">Popular:
            ${['vaccination', 'climate', 'gender', 'WASH', 'French'].map(s => `<button type="button" data-q="${s}">${s}</button>`).join('')}
          </div>
        </div>
        <div class="v2-art" aria-hidden="true">
          <div class="spark">&#10024;</div>
          ${ecard(pick[0], 1)}${ecard(pick[1], 2)}
          <div class="ec e3"><small>Experts available across</small><div class="big">${ROSTERS.length} rosters</div><div class="row"><span>${countries} countries</span><span>${langMap.size} languages</span></div></div>
        </div>
      </div>
      <div class="v2-stats">
        ${[[EXP.length, 'vetted experts'], [ROSTERS.length, 'specialist rosters'], [countries, 'countries'], [langMap.size, 'languages']].map(([n, l]) => `<div class="v2-stat"><b data-n="${n}">0</b><span>${l}</span></div>`).join('')}
      </div>
    </section>

    <section class="wrap v2-sec" aria-labelledby="v2r">
      <div class="v2-sec-h">
        <div><h2 id="v2r">Explore our rosters</h2><p>Bigger tiles have more experts. Pick one to open its profiles.</p></div>
        <div class="v2-ctl">
          <label class="flt" aria-label="Filter rosters">${SEARCH.replace('width="22" height="22"', 'width="16" height="16"')}<input id="v2flt" placeholder="Filter rosters&hellip;" /></label>
          <div class="seg" role="group" aria-label="Show"><button type="button" data-show="all" aria-pressed="true">All</button><button type="button" data-show="has" aria-pressed="false">With experts</button></div>
          <div class="seg" role="group" aria-label="Sort"><button type="button" data-sort="count" aria-pressed="true">Most experts</button><button type="button" data-sort="az" aria-pressed="false">A&ndash;Z</button></div>
        </div>
      </div>
      <div class="v2-grid" id="v2grid"></div>
    </section>`;

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
        const [bg, ac] = COL[x.r.img];
        return `<a class="tile ${cls}${x.count ? '' : ' zero'}" href="${esc(rosterUrl(x.r))}" style="--i:${n};--bg:${bg};--ac:${ac}" aria-label="${esc(x.r.t)}, ${x.count} ${x.count === 1 ? 'expert' : 'experts'}">
          <span class="deco d1"></span><span class="deco d2"></span>
          <div class="t-top"><div class="ico">${ICONS[x.r.img]}</div><div class="num"><b>${x.count}</b><span>${x.count === 1 ? 'expert' : 'experts'}</span></div></div>
          <div class="t-body">
            ${x.count ? '' : '<span class="soon">Growing soon</span>'}
            <h3>${esc(x.r.t)}</h3>
            <p>${esc(x.r.d)}</p>
            <div class="t-foot"><div class="tags">${x.r.tags.map(t => `<span>${esc(t)}</span>`).join('')}</div>${names ? `<div class="av" aria-hidden="true">${names}</div>` : ''}<span class="go" aria-hidden="true">${ARROW}</span></div>
          </div>
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
