// Shared by index.html. Each roster maps onto the dashboard's own filters (experts.html?skill=...&lang=...&q=...).
const ROSTERS = [
  { img:'recovery', t:'Recovery Specialists', d:'Recovery, resilience and risk-informed programming.', tags:['Recovery','Resilience'], skills:['Humanitarian Action'], g:['#c9d6e8','#8fa6c4'] },
  { img:'network', t:'External Expert Network', d:'A global network of external specialists across priority areas.', tags:['Global','Policy'], skills:['Policy Reform'], g:['#ffd9a8','#f0a35e'] },
  { img:'sbc', t:'Social & Behaviour Change (SBC) Specialists', d:'Social and behaviour change, communication and community engagement.', tags:['SBC','Communication'], skills:['Social & Behaviour Change'], g:['#cfe9d6','#6fb58a'] },
  { img:'climate', t:'Climate & Environment Experts', d:'Climate change, environment and sustainable programming.', tags:['Climate','Sustainability'], skills:['Climate Resilience for Children'], g:['#a8d8a0','#3f8f4a'] },
  { img:'finance', t:'Financing for Scale Specialists', d:'Innovative financing, resource mobilization and scaling solutions for children.', tags:['Financing','Scaling'], skills:['Financing for Scale'], g:['#e6f1c8','#9cc45a'] },
  { img:'hiv', t:'HIV/AIDS Technical Experts', d:'HIV prevention, treatment, care and related programming.', tags:['HIV','Treatment'], skills:[], q:'HIV', g:['#e9d5d5','#c24b4b'] },
  { img:'mncah', t:'Maternal, Newborn, Child and Adolescent Health (MNCAH)', d:'Immunization, nutrition and adolescent health.', tags:['Maternal','Child Health'], skills:['Health'], g:['#f6dcc8','#d98b5f'] },
  { img:'edu', t:'Education Specialists', d:'Education policy, programme design and learning innovation.', tags:['Learning','Policy'], skills:['Early Childhood Development'], g:['#cfe0f5','#6b95cc'] },
  { img:'protect', t:'Child Protection Specialists', d:'Child protection systems, violence prevention and risk mitigation.', tags:['Protection','Case Mgmt'], skills:['Child Protection'], g:['#b9d6a8','#4f8a3a'] },
  { img:'cross', t:'Cross-Cutting Specialists', d:'Gender, inclusion, disability, humanitarian action, data and innovation.', tags:['Inclusion','Data'], skills:['Gender Equality','Digital Infrastructure','Humanitarian Action','Adolescent Development'], g:['#ffe2b8','#e8a84a'] }
];
const POS = {"recovery": "center 35%", "network": "center 30%", "sbc": "center 45%", "climate": "center", "finance": "center 60%", "hiv": "center 40%", "mncah": "center 35%", "edu": "center 50%", "cross": "center 45%", "protect": "center 55%"};

// Plain-language topics -> skills that exist in the dashboard's Skills filter.
const SYNONYMS = {
  vaccination:['Health'], vaccine:['Health'], immunization:['Health'], immunisation:['Health'], health:['Health'],
  climate:['Climate Resilience for Children'], gender:['Gender Equality','Adolescent Development'],
  water:['WASH'], sanitation:['WASH'], hygiene:['WASH'], wash:['WASH'],
  school:['Early Childhood Development','Education'], education:['Early Childhood Development','Education'], learning:['Early Childhood Development','Education'],
  nutrition:['Child Nutrition & Development'], recovery:['Humanitarian Action'], 'child protection':['Child Protection'], protection:['Child Protection'], digital:['Digital Infrastructure'], policy:['Policy Reform'],
  financing:['Financing for Scale'], finance:['Financing for Scale'], humanitarian:['Humanitarian Action'], emergency:['Humanitarian Action'],
  sbc:['Social & Behaviour Change'], behaviour:['Social & Behaviour Change'], adolescent:['Adolescent Development'], hiv:['HIV']
};
const LANGS = [...new Set(DASH_EXPERTS.flatMap(e => e.languages || []))];

// Global Practice Area options in the dashboard. A single-skill roster that is one of these opens with that
// dropdown selected; the dashboard matches an area by the expert's primary area OR a listed skill.
const AREAS = ['Early Childhood Development','Health','WASH','Child Protection','Social & Behaviour Change','Humanitarian Action','Gender Equality','Adolescent Development','Financing for Scale','Digital Infrastructure','Policy Reform','Nutrition','Education'];
const asArea = skills => (skills && skills.length === 1 && AREAS.includes(skills[0])) ? skills[0] : '';
const countRoster = r => {
  const a = asArea(r.skills);
  if (a) return DASH_EXPERTS.filter(e => e.globalPracticeArea === a || e.skills.includes(a)).length;
  if (r.q) return DASH_EXPERTS.filter(e => (e.name + ' ' + e.role).toLowerCase().includes(r.q.toLowerCase())).length;
  return DASH_EXPERTS.filter(e => r.skills.some(s => e.skills.includes(s))).length;
};

const resultsUrl = (params) => {
  const u = new URLSearchParams();
  const area = asArea(params.skills);
  if (area) u.set('area', area); else (params.skills || []).forEach(s => u.append('skill', s));
  (params.langs || []).forEach(l => u.append('lang', l));
  if (params.q) u.set('q', params.q);
  return 'experts.html' + (u.toString() ? '?' + u : '');
};
const rosterUrl = r => resultsUrl({ skills: r.skills, q: r.q });
// Typed search -> a language filter, skill filters, or the dashboard's name/role keyword.
function searchUrl(text) {
  text = text.trim(); const lc = text.toLowerCase();
  const lang = LANGS.find(l => l.toLowerCase() === lc);
  if (lang) return resultsUrl({ langs: [lang] });
  const skills = SYNONYMS[lc];
  if (skills) return resultsUrl({ skills });
  return resultsUrl({ q: text });
}
