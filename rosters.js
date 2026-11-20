// Shared by index.html and experts.html. Each roster -> results filter. `terms` are OR-ed; matched against practice area, role, skills, summary.
const ROSTERS = [
  { img:'recovery', t:'Recovery Specialists', d:'Recovery, resilience and risk-informed programming.', tags:['Recovery','Resilience'], terms:['recovery','resilience','humanitarian'], g:['#c9d6e8','#8fa6c4'], i:'🏗️' },
  { img:'network', t:'External Expert Network', d:'A global network of external specialists across priority areas.', tags:['Global','Policy'], terms:['policy','programme management'], g:['#ffd9a8','#f0a35e'], i:'🌍' },
  { img:'sbc', t:'Social & Behaviour Change (SBC) Specialists', d:'Social and behaviour change, communication and community engagement.', tags:['SBC','Communication'], terms:['social & behaviour change','sbc','communication','community engagement'], g:['#cfe9d6','#6fb58a'], i:'💬' },
  { img:'climate', t:'Climate & Environment Experts', d:'Climate change, environment and sustainable programming.', tags:['Climate','Sustainability'], terms:['climate','environment','sustainab'], g:['#a8d8a0','#3f8f4a'], i:'🌳' },
  { img:'finance', t:'Financing for Scale Specialists', d:'Innovative financing, resource mobilization and scaling solutions for children.', tags:['Financing','Scaling'], terms:['financing','scale','scaling','economic'], g:['#e6f1c8','#9cc45a'], i:'🪙' },
  { img:'hiv', t:'HIV/AIDS Technical Experts', d:'HIV prevention, treatment, care and related programming.', tags:['HIV','Treatment'], terms:['hiv','aids'], g:['#e9d5d5','#c24b4b'], i:'🎗️' },
  { img:'mncah', t:'Maternal, Newborn, Child and Adolescent Health (MNCAH)', d:'Immunization, nutrition and adolescent health.', tags:['Maternal','Child Health'], terms:['health','nutrition','immuniz','maternal','adolescent'], g:['#f6dcc8','#d98b5f'], i:'🤱' },
  { img:'edu', t:'Education Specialists', d:'Education policy, programme design and learning innovation.', tags:['Learning','Policy'], terms:['education','learning','early childhood'], g:['#cfe0f5','#6b95cc'], i:'📚' },
  { img:'protect', t:'Child Protection Specialists', d:'Child protection systems, violence prevention and risk mitigation.', tags:['Protection','Case Mgmt'], terms:['child protection','protection','case management','gbv'], g:['#b9d6a8','#4f8a3a'], i:'🛡️' },
  { img:'cross', t:'Cross-Cutting Specialists', d:'Gender, inclusion, disability, humanitarian action, data and innovation.', tags:['Inclusion','Data'], terms:['gender','inclusion','disability','humanitarian','data','digital'], g:['#ffe2b8','#e8a84a'], i:'🤝' }
];
// Plain-language topics -> terms the dashboard data actually contains.
const SYNONYMS = {
  vaccination:['health','immuniz'], vaccine:['health','immuniz'], immunization:['health','immuniz'], immunisation:['health','immuniz'],
  climate:['climate','environment','wash','sustainab'], gender:['gender','adolescent','inclusion'],
  water:['wash'], sanitation:['wash'], hygiene:['wash'], school:['education'], learning:['education','learning'],
  nutrition:['nutrition'], protection:['child protection','protection']
};
const POS = {"recovery": "center 35%", "network": "center 30%", "sbc": "center 45%", "climate": "center", "finance": "center 60%", "hiv": "center 40%", "mncah": "center 35%", "edu": "center 50%", "cross": "center 45%", "protect": "center 55%"};

// Typed search -> { q, label } for experts.html. OR across synonym expansions; AND across plain words.
function resolveSearch(text) {
  const groups = text.toLowerCase().split(/[\s,]+/).filter(Boolean);
  const terms = groups.flatMap(w => SYNONYMS[w] ? [w, ...SYNONYMS[w]] : []);
  return { q: terms.length ? [...new Set(terms)].join('|') : groups.join(' '), label: text.trim() };
}
const resultsUrl = (q, label) => 'experts.html?q=' + encodeURIComponent(q) + (label ? '&label=' + encodeURIComponent(label) : '');
