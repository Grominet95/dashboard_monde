/* tech.ts — V5 TECH : port TS du proto v5_tech.jsx */

import { colorFor, isTechNews, threatColor, type JarvisViewData } from './_shared.js';

const STYLE_ID = 'jarvis-tech-styles';

// ─── Data ────────────────────────────────────────────────────────────
const ACTORS = [
  { code: 'US', name: 'États-Unis', geo: 'United States of America' },
  { code: 'CN', name: 'Chine',      geo: 'China' },
  { code: 'FR', name: 'France',     geo: 'France' },
  { code: 'UK', name: 'Royaume-Uni',geo: 'United Kingdom' },
  { code: 'DE', name: 'Allemagne',  geo: 'Germany' },
  { code: 'JP', name: 'Japon',      geo: 'Japan' },
  { code: 'IL', name: 'Israël',     geo: 'Israel' },
  { code: 'IN', name: 'Inde',       geo: 'India' },
  { code: 'RU', name: 'Russie',     geo: 'Russia' },
];
const ACTOR_BY_CODE = Object.fromEntries(ACTORS.map(a => [a.code, a]));

const DOMAINS = [
  { id: 'ai',      name: 'IA',        eyebrow: 'intelligence',      delta: '+12%', lvl: 'accent' },
  { id: 'robo',    name: 'Robotique', eyebrow: 'humanoïdes & ind.', delta: '+24%', lvl: 'gold' },
  { id: 'quantum', name: 'Quantique', eyebrow: 'qbits utiles',      delta: '+7%',  lvl: 'accent' },
  { id: 'fusion',  name: 'Fusion',    eyebrow: 'Q>1 commercial',    delta: '+9%',  lvl: 'accent' },
  { id: 'space',   name: 'Spatial',   eyebrow: 'accès orbital',     delta: '+18%', lvl: 'accent' },
  { id: 'bio',     name: 'Biotech',   eyebrow: 'thérapies & édit.', delta: '+11%', lvl: 'accent' },
  { id: 'cyber',   name: 'Cyber',     eyebrow: 'offense & def.',    delta: '+14%', lvl: 'neutral' },
  { id: 'energy',  name: 'Énergie',   eyebrow: 'solaire · batteries',delta: '+16%', lvl: 'gold' },
];
const GLOBAL_META = { id: 'global', name: 'Vue globale', eyebrow: 'moyenne 8 domaines', delta: '+13%', lvl: 'accent' };

const MATRIX: Record<string, Record<string, number>> = {
  ai:      { US:92, CN:78, FR:58, UK:60, DE:52, JP:48, IL:71, IN:48, RU:22 },
  robo:    { US:70, CN:88, FR:50, UK:46, DE:72, JP:84, IL:40, IN:36, RU:24 },
  quantum: { US:84, CN:72, FR:70, UK:66, DE:58, JP:56, IL:32, IN:30, RU:44 },
  fusion:  { US:78, CN:68, FR:76, UK:56, DE:60, JP:48, IL:18, IN:22, RU:40 },
  space:   { US:95, CN:78, FR:64, UK:50, DE:48, JP:52, IL:30, IN:64, RU:50 },
  bio:     { US:88, CN:72, FR:64, UK:76, DE:68, JP:58, IL:56, IN:44, RU:28 },
  cyber:   { US:82, CN:74, FR:62, UK:70, DE:58, JP:44, IL:90, IN:42, RU:78 },
  energy:  { US:70, CN:92, FR:68, UK:62, DE:78, JP:60, IL:30, IN:54, RU:52 },
};

const PROFILE: Record<string, Record<string, { f: string; w: string }>> = {
  ai:      { US:{f:'Compute · capital · talents',       w:'Coût énergie · TSMC'},
             CN:{f:'DeepSeek · Qwen · données',          w:'Sanctions chips'},
             FR:{f:'Mistral · INRIA · talents math',     w:'Capital · compute'},
             UK:{f:'DeepMind · ARM · safety',            w:'Capital risque limité'},
             IL:{f:'AI21 · sécurité · militaire',        w:'Échelle marché'} },
  robo:    { US:{f:'Figure · Tesla Optimus · Boston Dyn.',w:'Coût main d\'œuvre'},
             CN:{f:'Unitree · BYD · Xiaomi · volume',    w:'Soft real-time avancé'},
             JP:{f:'Toyota · Honda · héritage industriel',w:'Coût production'},
             DE:{f:'Kuka · Festo · industriel',          w:'Humanoïdes en retard'},
             FR:{f:'Aldebaran · CEA · Naval Group',      w:'Pas de champion grand public'} },
  quantum: { US:{f:'IBM · Google · IonQ · capital',     w:'Coût · mise à l\'échelle'},
             CN:{f:'Hefei lab · Jiuzhang · USTC',        w:'Sanctions composants'},
             FR:{f:'Alice&Bob · Pasqal · Quandela · plan €1.8B',w:'Volume production'},
             UK:{f:'Oxford Quantum · National Quantum Strategy',w:'Capital industriel'} },
  fusion:  { US:{f:'Helion · CFS · NIF · capital privé $7B',w:'Pré-grid · délais'},
             FR:{f:'ITER Cadarache · CEA · WEST',        w:'Calendrier ITER glissant'},
             CN:{f:'EAST tokamak · BEST 2025',           w:'Maturité industrielle'},
             UK:{f:'JET legacy · STEP 2040',             w:'Capital privé limité'} },
  space:   { US:{f:'SpaceX · Starship · Starlink 8k+',  w:'Concentration acteur'},
             CN:{f:'CASC · Tiangong · Long March',       w:'Réutilisable en retard'},
             FR:{f:'ArianeGroup · CNES · Kourou',        w:'Coût lanceur vs SpaceX'},
             IN:{f:'ISRO · Chandrayaan · coût bas',      w:'Capacité lourde'} },
  bio:     { US:{f:'FDA · NIH · CRISPR · BioNTech US',  w:'Coût soins'},
             UK:{f:'AstraZeneca · Sanger · NHS data',    w:'Capital risque post-Brexit'},
             CN:{f:'BGI · CanSino · vitesse essais',     w:'Confiance internationale'},
             FR:{f:'Pasteur · Sanofi · INSERM',          w:'Sorties startups limitées'} },
  cyber:   { US:{f:'NSA · CISA · cloud hyperscale',     w:'Surface critique massive'},
             IL:{f:'8200 · Check Point · NSO · écosystème',w:'Petite échelle interne'},
             RU:{f:'Offensive · APT · GRU',              w:'Défense privée faible'},
             FR:{f:'ANSSI · Thales · Atos · Campus Cyber',w:'Souveraineté cloud'} },
  energy:  { US:{f:'Shale · nucléaire · solaire ferme', w:'Lobby fossile'},
             CN:{f:'80% solaire mondial · CATL · sodium-ion',w:'Charbon · dette locale'},
             DE:{f:'Wind · Energiewende · hydrogène',    w:'Sortie nucléaire'},
             FR:{f:'Nucléaire 70% · EDF · ITER · EPR2', w:'Vieillissement parc'} },
};

const TECH_NEWS = [
  { t:'−02m', dom:'fusion',  actors:['US'], src:'BLOOMBERG',     lvl:'red',    title:'Commonwealth Fusion · SPARC atteint Q=2.4',    body:'1ère démonstration Q>1 net en tokamak commercial.' },
  { t:'−06m', dom:'space',   actors:['US'], src:'REUTERS',       lvl:'accent', title:'Starship V3 · 1er retour cargo orbital',       body:'Catch tour 2 réussi. Cadence 1/sem visée Q3.' },
  { t:'−12m', dom:'robo',    actors:['CN'], src:'SCMP',          lvl:'gold',   title:'Unitree H2 · 50k unités déployées chez BYD',   body:'Coût unitaire $11.8k. Software stack Tencent.' },
  { t:'−18m', dom:'ai',      actors:['US'], src:'FT',            lvl:'accent', title:'Anthropic lève $5B série G · valo $200B',      body:'Lead GIC + AMZN. Focus inference & sécurité.' },
  { t:'−24m', dom:'quantum', actors:['FR'], src:'LES ÉCHOS',     lvl:'accent', title:'Pasqal lève €100M · cap quantique français',   body:'Plan France 2030 · 132 qbits atomes neutres.' },
  { t:'−33m', dom:'bio',     actors:['US','UK'], src:'STAT',     lvl:'accent', title:'FDA approuve thérapie CRISPR drépanocytose élargie', body:'Vertex/CRISPR Tx · 1ère indication pédiatrique.' },
  { t:'−41m', dom:'cyber',   actors:['US','CN'], src:'WIRED',    lvl:'red',    title:'Volt Typhoon · nouvelle vague infra US',       body:'CISA confirme 14 opérateurs eau/élec compromis.' },
  { t:'−55m', dom:'energy',  actors:['CN'], src:'BNEF',          lvl:'gold',   title:'CATL · batterie sodium-ion 200Wh/kg',          body:'Production série Q3. Coût −30% vs LFP.' },
  { t:'−1h',  dom:'ai',      actors:['US','CN'], src:'BLOOMBERG',lvl:'red',    title:'Sénat US adopte EXPORT CONTROL ACT v3',        body:'Restrictions modèles >10²⁶ FLOPS.' },
  { t:'−1h',  dom:'space',   actors:['FR'], src:'AP',            lvl:'gold',   title:'ESA · Ariane 7 sélectionnée Vulcain-3X',       body:'1er vol 2029. Capacité GTO 12t réutilisable.' },
  { t:'−2h',  dom:'robo',    actors:['US','DE'], src:'NIKKEI',   lvl:'neutral',title:'Figure × BMW · 4000 robots déployés',         body:'Spartanburg → 12 usines US d\'ici fin 2026.' },
  { t:'−2h',  dom:'fusion',  actors:['FR'], src:'LE MONDE',      lvl:'accent', title:'ITER · 1er plasma confirmé pour Q4-2026',      body:'Calendrier tenu après glissement, Cadarache.' },
  { t:'−3h',  dom:'ai',      actors:['FR'], src:'L\'USINE NOUVELLE',lvl:'accent',title:'Mistral × Orange · contrat €450M cloud souverain',body:'Inference public pour ministères français.' },
  { t:'−3h',  dom:'quantum', actors:['US'], src:'NATURE',        lvl:'neutral',title:'IBM Condor-2 · 1121 qbits supraconducteurs',   body:'Erreur logique sous 10⁻³ démontrée.' },
  { t:'−4h',  dom:'cyber',   actors:['FR','IL'], src:'REUTERS',  lvl:'gold',   title:'Thales × Cellebrite · partenariat européen',   body:'Plateforme forensique mobile homologuée UE.' },
];

// ─── Live news mapping ───────────────────────────────────────────────
type TechNewsItem = { t: string; dom: string; actors: string[]; src: string; lvl: string; title: string; body: string };

const GEO_PATTERNS: [RegExp, string][] = [
  [/états-unis|usa|washington|américain|silicon valley|nasa|spacex|anthropic|openai|helion|cfs|nif/i, 'US'],
  [/chine|beijing|chinese|pékin|xinhua|alibaba|tencent|baidu|huawei|unitree|catl|cctv|cnpc|deepseek|qwen/i, 'CN'],
  [/france|paris|français|élysée|mistral|pasqal|ariane|iter|cea|thales|sanofi|anssi|atos|inria|inserm/i, 'FR'],
  [/royaume-uni|uk\b|london|britannique|astrazeneca|\barm\b|deepmind|jet\b|step\b/i, 'UK'],
  [/allemagne|berlin|allemand|volkswagen|\bbmw\b|siemens|kuka|festo|energiewende/i, 'DE'],
  [/japon|tokyo|japonais|toyota|honda|sony|nikkei|softbank/i, 'JP'],
  [/israël|israel|tel aviv|israelien|check point|cellebrite|unit 8200|nso\b/i, 'IL'],
  [/\binde\b|india|bangalore|isro|mumbai|delhi|chandrayaan/i, 'IN'],
  [/russie|russia|moscow|moscou|kremlin|poutine|\bapt\b|\bgru\b|volt typhoon/i, 'RU'],
];

function domFromNews(n: { title: string; threat?: { category?: string } }): string {
  const cat = n.threat?.category;
  if (cat === 'cyber') return 'cyber';
  const t = n.title.toLowerCase();
  if (/\bia\b| ai |llm|gpt|mistral|anthropic|deepseek|claude|gemini|qwen|neural|chatbot/.test(t)) return 'ai';
  if (/robot|humano|optimus|unitree|figure/.test(t)) return 'robo';
  if (/quantique|quantum|qbit|qubits?|supraconducteur/.test(t)) return 'quantum';
  if (/fusion|tokamak|iter|sparc|helion|plasma/.test(t)) return 'fusion';
  if (/spatial|satellite|orbital|lanceur|ariane|spacex|fusée|rocket|isro|nasa\b/.test(t)) return 'space';
  if (/crispr|vaccin|thérapie|adn|biotech|génomique|médicament|fda\b/.test(t)) return 'bio';
  if (/solaire|batterie|nucléaire|nucl|énergie|energie|catl|epr/.test(t)) return 'energy';
  if (cat === 'tech') return 'ai';
  return 'ai';
}

function actorsFromNews(n: { title: string; locationName?: string; source: string }): string[] {
  const text = `${n.title} ${n.locationName ?? ''} ${n.source}`;
  const codes = GEO_PATTERNS.filter(([re]) => re.test(text)).map(([, code]) => code);
  return codes.length ? codes : ['US'];
}

function newsToTech(data?: JarvisViewData): TechNewsItem[] {
  if (!data?.news.length) return TECH_NEWS;
  const items = data.news.filter(isTechNews).slice(0, 15);
  if (!items.length) return TECH_NEWS;
  return items.map(n => {
    const minAgo = Math.round((Date.now() - n.pubDate.getTime()) / 60000);
    const t = minAgo < 60 ? `−${minAgo}m` : `−${Math.round(minAgo / 60)}h`;
    return {
      t,
      dom: domFromNews(n),
      actors: actorsFromNews(n),
      src: n.source.toUpperCase().slice(0, 20),
      lvl: threatColor(n),
      title: n.title,
      body: n.snippet ?? '',
    };
  });
}

// ─── Styles ──────────────────────────────────────────────────────────
function injectStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
.tech-wrap {
  position:absolute; inset:0;
  background:var(--bg-0); color:var(--fg-0);
  font-family:var(--sans);
  display:flex; flex-direction:column;
  overflow:hidden;
}
.tech-scroll { flex:1; overflow-y:auto; padding:56px 26px 32px; }
.tech-header { display:flex; align-items:flex-end; gap:22px; margin-bottom:20px; }
.tech-header-num { font-family:var(--mono);font-size:11px;letter-spacing:.14em;color:var(--accent);font-weight:500;padding-bottom:6px; }
.tech-eyebrow { font-family:var(--mono);font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--fg-3); }
.tech-title { font-family:var(--serif);font-weight:300;font-size:28px;letter-spacing:-0.025em;color:var(--fg-0); }
.tech-accent-line { width:32px;height:1px;background:var(--accent);box-shadow:0 0 8px var(--accent);align-self:center; }
.tech-jbtn { font-family:var(--mono);font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;
  padding:9px 16px;border-radius:6px;cursor:pointer;
  background:var(--bg-1);border:1px solid var(--line-1);color:var(--fg-2);
  display:flex;align-items:center;gap:10px;font-weight:500;transition:.15s; }
.tech-jbtn.active { background:var(--accent-soft);border-color:var(--accent-line);color:var(--accent); }
.tech-jbtn:hover { border-color:var(--line-3);color:var(--fg-0); }
.tech-pills { display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap; }
.tech-pill-eyebrow { color:var(--fg-3);font-size:9.5px; }
.tech-pill-delta { font-size:9.5px; }

/* Map hero */
.tech-hero { background:var(--bg-1);border:1px solid var(--line-1);
  border-radius:14px;padding:26px;display:flex;flex-direction:column;gap:14px; }
.tech-map-placeholder { height:540px;background:var(--bg-0);border-radius:10px;
  border:1px solid var(--line-1);display:flex;align-items:center;justify-content:center;
  font-family:var(--mono);font-size:9px;letter-spacing:.14em;color:var(--fg-3); }
.tech-map-overlay { position:absolute;left:16px;bottom:16px;padding:12px 14px;
  background:rgba(6,8,13,.78);border:1px solid var(--line-2);border-radius:8px;
  backdrop-filter:blur(12px);display:flex;align-items:center;gap:14px; }
.tech-choropleth-label { font-family:var(--mono);font-size:9px;letter-spacing:.14em;color:var(--fg-3); }

/* Top 5 */
.tech-top5 { display:grid;grid-template-columns:repeat(5,1fr);gap:8px; }
.tech-actor-card { padding:10px 12px;background:var(--bg-2);
  border:1px solid var(--line-1);border-radius:8px;
  display:flex;flex-direction:column;gap:6px;cursor:pointer;transition:.15s; }
.tech-actor-card.selected { background:var(--accent-soft);border-color:var(--accent-line); }
.tech-actor-card:hover { border-color:var(--line-3); }
.tech-actor-rank { font-family:var(--mono);font-size:9px;letter-spacing:.12em;color:var(--fg-3); }
.tech-actor-code { font-family:var(--mono);font-size:10.5px;letter-spacing:.10em;color:var(--fg-1); }
.tech-actor-code.leader { color:var(--accent); }
.tech-actor-name { font-size:13px;color:var(--fg-0); }
.tech-actor-score { font-family:var(--serif);font-weight:300;font-size:22px;
  color:var(--fg-0);font-variant-numeric:tabular-nums;letter-spacing:-0.03em; }
.tech-actor-score.leader { color:var(--accent); }
.tech-actor-bar { height:4px;background:var(--line-1);border-radius:2px;overflow:hidden;width:60px; }
.tech-actor-bar-fill { height:100%;background:var(--fg-2); }
.tech-actor-bar-fill.leader { background:var(--accent); }

/* Layout hero + profile */
.tech-hero-layout { display:grid;gap:20px;margin-bottom:20px;transition:.25s; }
.tech-hero-layout.no-profile { grid-template-columns:1fr; }
.tech-hero-layout.with-profile { grid-template-columns:1fr 380px; }

/* Profile panel */
.tech-profile { background:var(--bg-1);border:1px solid var(--accent-line);
  border-radius:14px;padding:26px;display:flex;flex-direction:column;gap:14px;
  box-shadow:0 0 24px rgba(74,158,255,.10); }
.tech-profile-code { font-family:var(--mono);font-size:14px;letter-spacing:.14em;color:var(--accent);
  padding:4px 10px;background:var(--accent-soft);border:1px solid var(--accent-line);border-radius:4px; }
.tech-profile-name { font-family:var(--serif);font-weight:300;font-size:26px;
  letter-spacing:-0.025em;color:var(--fg-0); }
.tech-profile-stat { flex:1;padding:12px;background:var(--bg-2);border:1px solid var(--line-1);border-radius:8px; }
.tech-profile-stat-lbl { font-family:var(--mono);font-size:9px;letter-spacing:.14em;
  color:var(--fg-3);text-transform:uppercase; }
.tech-profile-stat-val { font-family:var(--serif);font-weight:300;font-size:30px;
  color:var(--fg-0);letter-spacing:-0.03em;font-variant-numeric:tabular-nums; }
.tech-profile-stat-val.accent { color:var(--accent); }
.tech-lead-pills { display:flex;gap:6px;flex-wrap:wrap; }
.tech-lead-pill { font-family:var(--mono);font-size:9.5px;letter-spacing:.10em;color:var(--accent);
  text-transform:uppercase;padding:3px 8px;border:1px solid var(--accent-line);
  background:var(--accent-soft);border-radius:3px; }
.tech-domain-row { display:grid;grid-template-columns:90px 1fr 30px;gap:10px;
  align-items:center;cursor:pointer;padding:3px 0; }
.tech-domain-bar { position:relative;height:5px;background:var(--bg-3);border-radius:2px;overflow:hidden; }
.tech-domain-bar-fill { position:absolute;inset:0;border-radius:2px;opacity:.65; }
.tech-forces-lbl { font-family:var(--mono);font-size:9px;letter-spacing:.14em;text-transform:uppercase; }
.tech-forces-text { font-size:12px;color:var(--fg-1);line-height:1.45; }

/* Matrix */
.tech-matrix-card { background:var(--bg-1);border:1px solid var(--line-1);
  border-radius:14px;padding:26px;margin-bottom:20px; }
.tech-matrix-grid { display:grid;gap:4px; }
.tech-matrix-cell { padding:10px 0;border-radius:6px;display:flex;flex-direction:column;
  align-items:center;justify-content:center;gap:4px;border:1px solid var(--line-1);transition:.15s; }
.tech-matrix-cell-score { font-family:var(--serif);font-weight:300;font-size:18px;
  letter-spacing:-0.02em;font-variant-numeric:tabular-nums; }
.tech-matrix-cell-bar { height:2px;background:var(--line-1);border-radius:2px;overflow:hidden;width:70%; }
.tech-matrix-cell-bar-fill { height:100%;opacity:.55; }
.tech-matrix-domain-btn { display:flex;flex-direction:column;gap:2px;padding:10px 12px;
  border-radius:6px;background:var(--bg-2);border:1px solid transparent;
  cursor:pointer;text-align:left;transition:.15s; }
.tech-matrix-domain-btn.active { background:var(--accent-soft);border-color:var(--accent-line); }
.tech-matrix-domain-name { font-family:var(--mono);font-size:12px;letter-spacing:.06em;font-weight:500; }
.tech-matrix-actor-btn { text-align:center;padding:6px 0;background:transparent;
  border:none;border-radius:4px;font-family:var(--mono);font-size:11px;
  letter-spacing:.14em;color:var(--fg-1);font-weight:500;cursor:pointer;transition:.15s; }
.tech-matrix-actor-btn.selected { background:var(--accent-soft);color:var(--accent); }

/* News */
.tech-news-card { background:var(--bg-1);border:1px solid var(--line-1);border-radius:14px;padding:26px; }
.tech-news-row { display:grid;grid-template-columns:16px 56px 110px 90px 1fr auto;
  gap:12px;padding:12px 0;border-top:1px solid var(--line-1);align-items:center; }
.tech-news-row:first-child { border-top:none; }
.tech-news-dot { width:8px;height:8px;border-radius:50%;justify-self:center; }
.tech-news-time { font-family:var(--mono);font-size:10.5px;letter-spacing:.06em;
  color:var(--fg-2);font-variant-numeric:tabular-nums; }
.tech-news-src { font-family:var(--mono);font-size:9px;letter-spacing:.14em;color:var(--fg-3);text-transform:uppercase; }
.tech-news-actors { display:flex;gap:4px; }
.tech-news-actor { font-family:var(--mono);font-size:9px;letter-spacing:.10em;
  color:var(--accent);padding:2px 6px;border:1px solid var(--accent-line);
  background:var(--accent-soft);border-radius:3px; }
.tech-news-body { display:flex;flex-direction:column;gap:2px; }
.tech-news-title { font-size:13px;color:var(--fg-0);font-weight:500; }
.tech-news-desc { font-size:11.5px;color:var(--fg-2); }
.tech-news-voir { font-family:var(--mono);font-size:11px;color:var(--fg-3);cursor:pointer;letter-spacing:.08em; }
`;
  document.head.appendChild(s);
}

// ─── State ───────────────────────────────────────────────────────────
function computeScores(domainId: string): Record<string, number> {
  if (domainId === 'global') {
    const out: Record<string, number> = {};
    ACTORS.forEach(a => {
      out[a.code] = Math.round(DOMAINS.reduce((s, d) => s + MATRIX[d.id]![a.code]!, 0) / DOMAINS.length);
    });
    return out;
  }
  return { ...MATRIX[domainId]! };
}

function sortedByScore(scores: Record<string, number>) {
  return [...ACTORS].sort((a, b) => scores[b.code]! - scores[a.code]!);
}

function leadDomains(actorCode: string): typeof DOMAINS {
  return DOMAINS.filter(d => {
    const top = ACTORS.map(a => ({ code: a.code, sc: MATRIX[d.id]![a.code]! }))
      .sort((x, y) => y.sc - x.sc)[0]!;
    return top.code === actorCode;
  });
}

// ─── Renderers ───────────────────────────────────────────────────────
function renderPills(host: HTMLElement, domainId: string, onDomain: (id: string) => void): void {
  host.innerHTML = [GLOBAL_META, ...DOMAINS].map(d => {
    const active = d.id === domainId;
    return `<button class="tech-jbtn${active?' active':''}" data-domain="${d.id}">
      <span>${d.id === 'global' ? '◎ GLOBAL' : d.name}</span>
      <span class="tech-pill-eyebrow">· ${d.eyebrow}</span>
      <span class="tech-pill-delta" style="color:${active?'var(--green)':'var(--fg-3)'}">${d.delta}</span>
    </button>`;
  }).join('');
  host.querySelectorAll<HTMLButtonElement>('[data-domain]').forEach(btn => {
    btn.addEventListener('click', () => onDomain(btn.dataset.domain!));
  });
}

function renderHero(
  host: HTMLElement,
  domainId: string,
  selected: string | null,
  scores: Record<string, number>,
  sorted: ReturnType<typeof sortedByScore>,
  onActor: (code: string) => void,
  onClose: () => void,
  onDomain: (id: string) => void,
): void {
  const leader = sorted[0]!;
  const dom = domainId === 'global' ? GLOBAL_META : DOMAINS.find(d => d.id === domainId)!;

  host.className = `tech-hero-layout ${selected ? 'with-profile' : 'no-profile'}`;

  // Map card
  const top5 = sorted.slice(0, 5).map((a, i) => {
    const sc = scores[a.code]!;
    const isLeader = i === 0;
    const isSel = selected === a.code;
    return `<div class="tech-actor-card${isSel?' selected':''}" data-actor="${a.code}">
      <div style="display:flex;align-items:baseline;justify-content:space-between">
        <span class="tech-actor-rank">#${i+1}</span>
        <span class="tech-actor-code${isLeader?' leader':''}">${a.code}</span>
      </div>
      <span class="tech-actor-name">${a.name}</span>
      <div style="display:flex;align-items:baseline;justify-content:space-between">
        <span class="tech-actor-score${isLeader?' leader':''}">${sc}</span>
        <div class="tech-actor-bar">
          <div class="tech-actor-bar-fill${isLeader?' leader':''}" style="width:${sc}%"></div>
        </div>
      </div>
    </div>`;
  }).join('');

  let profileHtml = '';
  if (selected) {
    const a = ACTOR_BY_CODE[selected]!;
    const allScores = DOMAINS.map(d => ({ d, sc: MATRIX[d.id]![selected]! }));
    const avg = Math.round(allScores.reduce((s, x) => s + x.sc, 0) / allScores.length);
    const leadIn = leadDomains(selected);
    const profDom = PROFILE[domainId]?.[selected] ?? null;

    const domRows = allScores.map(({ d, sc }) => {
      const isCur = d.id === domainId;
      const barColor = isCur ? 'var(--accent)' : sc >= 80 ? 'var(--accent)' : sc >= 60 ? 'var(--gold)' : 'var(--fg-2)';
      return `<div class="tech-domain-row" data-domain="${d.id}">
        <span style="font-family:var(--mono);font-size:10.5px;letter-spacing:.08em;
          color:${isCur?'var(--accent)':'var(--fg-1)'}">${d.name}</span>
        <div class="tech-domain-bar">
          <div class="tech-domain-bar-fill" style="width:${sc}%;background:${barColor}${isCur?';opacity:1':''}"></div>
        </div>
        <span style="font-family:var(--mono);font-size:11px;color:var(--fg-0);
          font-variant-numeric:tabular-nums;text-align:right">${sc}</span>
      </div>`;
    }).join('');

    const forcesSvg = profDom ? `
      <div style="display:flex;flex-direction:column;gap:8px;padding-top:10px;border-top:1px solid var(--line-1)">
        <div class="tech-eyebrow">SUR ${dom.name.toUpperCase()}</div>
        <div>
          <div class="tech-forces-lbl" style="color:var(--green)">+ FORCES</div>
          <div class="tech-forces-text">${profDom.f}</div>
        </div>
        <div>
          <div class="tech-forces-lbl" style="color:var(--red)">− FAIBLESSES</div>
          <div class="tech-forces-text">${profDom.w}</div>
        </div>
      </div>` : '';

    profileHtml = `<div class="tech-profile">
      <div style="display:flex;align-items:baseline;justify-content:space-between">
        <span style="font-family:var(--mono);font-size:9.5px;letter-spacing:.18em;
          text-transform:uppercase;color:var(--accent)">FICHE PAYS</span>
        <button class="tech-jbtn" id="tech-profile-close" style="padding:4px 10px">FERMER ✕</button>
      </div>
      <div style="display:flex;align-items:baseline;gap:12px">
        <span class="tech-profile-code">${a.code}</span>
        <span class="tech-profile-name">${a.name}</span>
      </div>
      <div style="display:flex;gap:14px">
        <div class="tech-profile-stat">
          <div class="tech-profile-stat-lbl">SCORE GLOBAL</div>
          <div class="tech-profile-stat-val">${avg}</div>
        </div>
        <div class="tech-profile-stat">
          <div class="tech-profile-stat-lbl">LEADER DANS</div>
          <div class="tech-profile-stat-val${leadIn.length?' accent':''}">
            ${leadIn.length}<span style="font-family:var(--mono);font-size:12px;color:var(--fg-3);margin-left:4px">/ 8</span>
          </div>
        </div>
      </div>
      ${leadIn.length ? `<div class="tech-lead-pills">${leadIn.map(d => `<span class="tech-lead-pill">${d.name}</span>`).join('')}</div>` : ''}
      <div style="display:flex;flex-direction:column;gap:6px;padding-top:6px;border-top:1px solid var(--line-1)">
        <div class="tech-eyebrow" style="margin-bottom:4px">SCORES PAR DOMAINE</div>
        ${domRows}
      </div>
      ${forcesSvg}
    </div>`;
  }

  host.innerHTML = `<div class="tech-hero">
    <div style="display:flex;align-items:center;justify-content:space-between">
      <div style="display:flex;align-items:baseline;gap:14px">
        <span class="tech-eyebrow">CHOROPLETH</span>
        <span style="font-family:var(--serif);font-weight:300;font-size:22px;
          letter-spacing:-0.025em;color:var(--fg-0)">${dom.name}
          <span style="color:var(--fg-3);font-size:14px;font-family:var(--sans)"> · ${dom.eyebrow}</span>
        </span>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-family:var(--mono);font-size:9.5px;letter-spacing:.14em;color:var(--fg-3)">0</span>
        <div style="width:180px;height:8px;border-radius:2px;
          background:linear-gradient(90deg,rgba(220,232,255,0.03) 0%,rgba(184,150,62,0.16) 35%,rgba(184,150,62,0.32) 60%,rgba(74,158,255,0.42) 80%,rgba(74,158,255,0.85) 100%)"></div>
        <span style="font-family:var(--mono);font-size:9.5px;letter-spacing:.14em;color:var(--accent)">100 · LEADER</span>
      </div>
    </div>
    <div style="position:relative">
      <div class="tech-map-placeholder">CHOROPLETH · ${dom.name.toUpperCase()}</div>
      <div class="tech-map-overlay" style="position:absolute;left:16px;bottom:16px;padding:12px 14px;
        background:rgba(6,8,13,.78);border:1px solid var(--line-2);border-radius:8px;
        backdrop-filter:blur(12px);display:flex;align-items:center;gap:14px">
        <span class="tech-choropleth-label">LEADER</span>
        <span style="font-family:var(--serif);font-weight:300;font-size:22px;color:var(--accent);
          letter-spacing:-0.02em">${ACTOR_BY_CODE[leader.code]!.name}</span>
        <span style="font-family:var(--mono);font-size:11px;color:var(--fg-0);
          font-variant-numeric:tabular-nums">${scores[leader.code]} / 100</span>
      </div>
    </div>
    <div class="tech-top5">${top5}</div>
  </div>
  ${profileHtml}`;

  // Clicks
  host.querySelectorAll<HTMLElement>('[data-actor]').forEach(el => {
    el.addEventListener('click', () => onActor(el.dataset.actor!));
  });
  host.querySelectorAll<HTMLElement>('[data-domain]').forEach(el => {
    el.addEventListener('click', () => onDomain(el.dataset.domain!));
  });
  host.querySelector('#tech-profile-close')?.addEventListener('click', onClose);
}

function renderMatrix(
  host: HTMLElement,
  domainId: string,
  selected: string | null,
  onActor: (code: string) => void,
  onDomain: (id: string) => void,
): void {
  const actorCols = ACTORS.map(a =>
    `<button class="tech-matrix-actor-btn${selected === a.code ? ' selected' : ''}" data-actor="${a.code}">${a.code}</button>`
  ).join('');

  const rows = DOMAINS.map(d => {
    const rowScores = ACTORS.map(a => MATRIX[d.id]![a.code]!);
    const max = Math.max(...rowScores);
    const cells = ACTORS.map(a => {
      const sc = MATRIX[d.id]![a.code]!;
      const isLeader = sc === max;
      const isHi = d.id === domainId || selected === a.code;
      const fg = isLeader ? 'var(--accent)' : sc >= 60 ? 'var(--gold)' : sc >= 40 ? 'var(--fg-1)' : 'var(--fg-3)';
      const opacity = selected && selected !== a.code && !isLeader ? '0.5' : '1';
      return `<div class="tech-matrix-cell" style="
        background:${isLeader?'var(--accent-soft)':isHi?'var(--bg-2)':'transparent'};
        border-color:${isLeader?'var(--accent-line)':sc>=60?'rgba(184,150,62,.20)':'var(--line-1)'};
        opacity:${opacity};
        box-shadow:${isLeader?'inset 0 0 12px rgba(74,158,255,.18)':'none'}">
        <span class="tech-matrix-cell-score" style="color:${fg}">${sc}</span>
        <div class="tech-matrix-cell-bar">
          <div class="tech-matrix-cell-bar-fill" style="width:${sc}%;background:${fg}${isLeader?';opacity:1':''}"></div>
        </div>
      </div>`;
    }).join('');
    return `<button class="tech-matrix-domain-btn${d.id === domainId?' active':''}" data-domain="${d.id}">
      <span class="tech-matrix-domain-name" style="color:${d.id===domainId?'var(--accent)':'var(--fg-0)'}">${d.name}</span>
      <span style="font-family:var(--mono);font-size:9px;letter-spacing:.12em;color:var(--fg-3);text-transform:uppercase">${d.eyebrow}</span>
    </button>${cells}`;
  }).join('');

  host.innerHTML = `<div class="tech-eyebrow" style="margin-bottom:14px;display:flex;align-items:center;justify-content:space-between">
    <span>MATRICE COMPLÈTE · 8 DOMAINES × 9 ACTEURS</span>
    <span style="color:var(--fg-3);font-size:9.5px">cliquer ligne · changer domaine · cliquer col · sélectionner pays</span>
  </div>
  <div class="tech-matrix-grid" style="grid-template-columns:170px repeat(${ACTORS.length},1fr)">
    <div></div>${actorCols}${rows}
  </div>`;

  host.querySelectorAll<HTMLElement>('[data-actor]').forEach(el => {
    el.addEventListener('click', () => onActor(el.dataset.actor!));
  });
  host.querySelectorAll<HTMLElement>('[data-domain]').forEach(el => {
    el.addEventListener('click', () => onDomain(el.dataset.domain!));
  });
}

function renderNews(host: HTMLElement, selected: string | null, liveNews: TechNewsItem[]): void {
  const filtered = selected
    ? liveNews.filter(n => n.actors.includes(selected))
    : liveNews;
  const actorName = selected ? ACTOR_BY_CODE[selected]?.name?.toUpperCase() ?? '' : '';

  const rows = filtered.map((n) => {
    const c = colorFor(n.lvl);
    const glow = (n.lvl === 'red' || n.lvl === 'accent') ? `box-shadow:0 0 6px ${c}` : '';
    const actors = n.actors.map(code => `<span class="tech-news-actor">${code}</span>`).join('');
    return `<div class="tech-news-row">
      <span class="tech-news-dot" style="background:${c};${glow}"></span>
      <span class="tech-news-time">${n.t}</span>
      <span class="tech-news-src">${n.src}</span>
      <div class="tech-news-actors">${actors}</div>
      <div class="tech-news-body">
        <span class="tech-news-title">${n.title}</span>
        <span class="tech-news-desc">${n.body}</span>
      </div>
      <span class="tech-news-voir">VOIR ›</span>
    </div>`;
  }).join('');

  host.innerHTML = `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
    <span class="tech-eyebrow">FLUX · TOUS DOMAINES${selected?` · ${actorName}`:''}</span>
    <div style="display:flex;gap:6px">
      <button class="tech-jbtn active">TOUS</button>
      <button class="tech-jbtn">RUPTURE</button>
      <button class="tech-jbtn">POLITIQUE</button>
      <button class="tech-jbtn">MARCHÉS</button>
    </div>
  </div>
  ${rows}`;
}

// ─── Export ──────────────────────────────────────────────────────────
export function renderTech(host: HTMLElement, data?: JarvisViewData): () => void {
  injectStyles();

  const liveNews = newsToTech(data);

  // Mutable state
  let domainId = 'global';
  let selected: string | null = null;

  // Build shell
  host.innerHTML = `
    <div class="tech-wrap">
      <div class="tech-scroll">

        <!-- HEADER -->
        <div class="tech-header">
          <span class="tech-header-num">09</span>
          <div style="display:flex;flex-direction:column;gap:6px">
            <span class="tech-eyebrow">TECH · 12 MAI 2026 · 8 DOMAINES · CLIQUER UN PAYS</span>
            <div style="display:flex;align-items:baseline;gap:14px">
              <span class="tech-title">Qui mène la course · état mondial des technologies</span>
              <span class="tech-accent-line"></span>
            </div>
          </div>
        </div>

        <!-- PILLS -->
        <div class="tech-pills" id="tech-pills"></div>

        <!-- HERO -->
        <div id="tech-hero-layout" class="tech-hero-layout no-profile" style="margin-bottom:20px"></div>

        <!-- MATRIX -->
        <div class="tech-matrix-card" id="tech-matrix"></div>

        <!-- NEWS -->
        <div class="tech-news-card" id="tech-news"></div>

      </div>
    </div>`;

  const pillsEl = host.querySelector<HTMLElement>('#tech-pills')!;
  const heroEl = host.querySelector<HTMLElement>('#tech-hero-layout')!;
  const matrixEl = host.querySelector<HTMLElement>('#tech-matrix')!;
  const newsEl = host.querySelector<HTMLElement>('#tech-news')!;

  function refresh(): void {
    const scores = computeScores(domainId);
    const sorted = sortedByScore(scores);
    renderPills(pillsEl, domainId, (id) => { domainId = id; refresh(); });
    renderHero(
      heroEl, domainId, selected, scores, sorted,
      (code) => { selected = selected === code ? null : code; refresh(); },
      () => { selected = null; refresh(); },
      (id) => { domainId = id; refresh(); },
    );
    renderMatrix(matrixEl, domainId, selected,
      (code) => { selected = selected === code ? null : code; refresh(); },
      (id) => { domainId = id; refresh(); },
    );
    renderNews(newsEl, selected, liveNews);
  }

  refresh();

  return () => { host.innerHTML = ''; };
}
