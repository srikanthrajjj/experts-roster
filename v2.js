// Home V2: photo-led hero with smart search + roster photo tiles. Renders into #v2 on first use.
(function () {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let built = false;

  function build(root) {
    const EXP = DASH_EXPERTS;
    const rosters = ROSTERS.map((r, i) => ({ r, i, count: countRoster(r) }));
    const skillMap = new Map(); EXP.forEach(e => e.skills.forEach(s => skillMap.set(s, (skillMap.get(s) || 0) + 1)));
    const langMap = new Map(); EXP.forEach(e => (e.languages || []).forEach(l => langMap.set(l, (langMap.get(l) || 0) + 1)));

    const ARROW = '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
    const SEARCH = '<svg width="26" height="26" fill="none" stroke="#1f2937" stroke-width="1.7" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
    // UNICEF corner swoosh colours per roster
    const SW = { recovery: ['#1CABE2', '#0A6CFF'], network: ['#1CABE2', '#0058AB'], sbc: ['#27d3c5', '#1CABE2'], climate: ['#2fb36a', '#00833D'], finance: ['#ffb02e', '#F26A21'],
      hiv: ['#ff5a4f', '#E2231A'], mncah: ['#ff7bb5', '#d6336c'], edu: ['#35b8ef', '#0A6CFF'], protect: ['#a35cf0', '#6d28d9'], cross: ['#ffb02e', '#F26A21'] };
    const SHORT = { mncah: 'MNCAH Specialists', sbc: 'Social & Behaviour Change Specialists', network: 'External Expert Network', climate: 'Climate & Environment Experts' };
    root.innerHTML = `
    <section class="v2-hero" aria-labelledby="v2h"><div class="v2-deco"></div><div class="v2-heroin">
      <div class="v2-copy">
        <div class="eyebrow">REACH</div>
        <h1 id="v2h">Find the right expertise</h1>
        <p class="v2-lead">Access UNICEF&rsquo;s curated rosters of specialists and consultants for country, regional and global priorities.</p>
        <div class="v2-cmd">
          <form class="v2-bar" id="v2f" role="search" autocomplete="off">
            ${SEARCH}
            <input id="v2q" role="combobox" aria-expanded="false" aria-controls="v2pop" aria-autocomplete="list" placeholder="Search expertise, skill or topic (e.g. vaccination, climate)" aria-label="Search experts" />
            <button class="v2-go" type="submit">Find experts</button>
          </form>
          <div class="v2-pop" id="v2pop" role="listbox" hidden></div>
        </div>
      </div>
      <div class="v2-art" aria-hidden="true"><div class="ring"></div><div class="pic"></div>
        <div class="tag">People<br>Knowledge<br>Solutions<br>for every child
          <svg viewBox="0 0 150 22" fill="none"><path d="M3 17C40 6 90 4 147 5" stroke="#1CABE2" stroke-width="4" stroke-linecap="round"/></svg></div>
      </div>
    </div></section>

    <section class="wrap v2-sec" aria-labelledby="v2r">
      <div class="v2-sec-h"><h2 id="v2r">Explore our rosters</h2><button type="button" class="viewall" id="v2all" aria-expanded="false"><span>View all rosters</span>${ARROW}</button></div>
      <div class="v2-grid" id="v2grid"></div>
      <div class="v2-more" id="v2more" hidden></div>
      <div class="v2-banner">
        <div class="blk"><div><h3>Not sure which roster to use?</h3><p>Tell us what you need and we&rsquo;ll guide you.</p></div><a class="btn-o" href="#">Get guidance ${ARROW}</a></div>
        <div class="sep"></div>
        <div class="blk"><div><h3>Before engaging an expert</h3><p>Review recruitment and procurement requirements.</p></div><a class="btn-o" href="#">Read the guidance ${ARROW}</a></div>
      </div>
    </section>`;

    // ---- tiles: the roster with the most experts gets the large tile; the next 8 fill the grid; the rest sit under "View all"
    const grid = root.querySelector('#v2grid'), more = root.querySelector('#v2more'), allBtn = root.querySelector('#v2all');
    const tile = (x, n, big) => {
      const [c1, c2] = SW[x.r.img];
      const label = x.count + (x.count === 1 ? ' expert' : ' experts');
      const src = big ? 'assets/photos/lg/' + x.r.img + '.jpg' : 'assets/photos/' + x.r.img + '.jpg';
      return `<a class="tile${big ? ' xl' : ''}${x.count ? '' : ' zero'}" href="${esc(rosterUrl(x.r))}" style="--i:${n};--pos:${POS[x.r.img]};--c1:${c1};--c2:${c2}" aria-label="${esc(x.r.t)}, ${label}">
        <img src="${src}" alt="" loading="lazy" onerror="this.onerror=null;this.src='assets/photos/${x.r.img}.jpg'" />
        <div class="cap"><h3>${esc(SHORT[x.r.img] || x.r.t)}</h3>${big ? `<p class="p">${esc(x.r.d)}</p><span class="btn-w">Explore roster ${ARROW}</span>` : `<span class="n">${label}</span>`}</div>
      </a>`;
    };
    const items = rosters.slice().sort((a, b) => b.count - a.count || a.i - b.i);
    grid.innerHTML = items.slice(0, 9).map((x, n) => tile(x, n, n === 0)).join('');
    more.innerHTML = items.slice(9).map((x, n) => tile(x, n + 9, false)).join('');
    if (items.length <= 9) allBtn.hidden = true;
    allBtn.onclick = () => { const open = more.hidden; more.hidden = !open; allBtn.setAttribute('aria-expanded', open); allBtn.firstElementChild.textContent = open ? 'Show fewer' : 'View all rosters'; };

    if (matchMedia('(max-width:640px)').matches) root.querySelector('#v2q').placeholder = 'Search experts';

    // ---- smart search (autocomplete)
    const input = root.querySelector('#v2q'), pop = root.querySelector('#v2pop');
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
      opts.forEach((o, i) => { if (o.type !== last) { html += `<h4>${input.value.trim() ? o.type + 's' : 'Popular rosters'}</h4>`; last = o.type; } html += `<div class="v2-opt" role="option" id="v2o${i}" data-i="${i}"><span>${esc(o.label)}</span><small>${esc(o.sub)}</small></div>`; });
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
  }

  window.initHomeV2 = function () { if (built) return; built = true; build(document.getElementById('v2')); };
})();
