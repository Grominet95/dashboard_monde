/* france.ts — V6 FRANCE : port TS du proto v6_france.jsx */

import { sparkline, type JarvisViewData, isFrenchSource, isTechNews, fmtUtc, fmtPrice, fmtChange, threatColor } from './_shared.js';
import { fetchMultipleStocks } from '@/services/market/index.js';

const STYLE_ID = 'jarvis-france-styles';

// ─── Data ────────────────────────────────────────────────────────────
const KPIS = [
  { label: 'VIGIPIRATE',    v: 'URG. ATT.',  sub: 'depuis 07/10/23',    tone: 'red' },
  { label: 'OPEX ACTIVES',  v: '11',         sub: '≈ 12 400 militaires', tone: 'gold' },
  { label: 'PROD. NUCL.',   v: '42,1 GW',    sub: '82% du parc dispo',  tone: 'accent' },
  { label: 'CAC 40',        v: '7 942',      sub: '+0,38% · ▲',         tone: 'green' },
  { label: 'ALERTES MÉTÉO', v: '3',          sub: 'orange · vent SO',   tone: 'gold' },
  { label: 'CYBER / 24H',   v: '47',         sub: '+12%',               tone: 'red' },
];

const ALERT_COLOR: Record<string, { fg: string; bg: string; line: string }> = {
  red:     { fg: 'var(--red)',    bg: 'rgba(229,72,77,0.18)',   line: 'rgba(229,72,77,0.55)' },
  gold:    { fg: 'var(--gold)',   bg: 'rgba(184,150,62,0.14)',  line: 'rgba(184,150,62,0.45)' },
  accent:  { fg: 'var(--accent)', bg: 'var(--accent-soft)',     line: 'var(--accent-line)' },
  green:   { fg: 'var(--green)',  bg: 'rgba(54,211,153,0.14)',  line: 'rgba(54,211,153,0.42)' },
  neutral: { fg: 'var(--fg-2)',   bg: 'rgba(220,232,255,0.05)', line: 'var(--line-2)' },
};

const FR_REGIONS = [
  { code: 'HDF', name: 'Hauts-de-France',       q: 4, r: 0, alert: 'gold',    notes: 'Manif Lille 6 oct · vigi sites' },
  { code: 'IDF', name: 'Île-de-France',         q: 4, r: 1, alert: 'red',     notes: 'Garde renforcée · JOP héritage' },
  { code: 'NOR', name: 'Normandie',             q: 3, r: 1, alert: 'neutral', notes: 'RAS' },
  { code: 'GES', name: 'Grand Est',             q: 5, r: 1, alert: 'gold',    notes: 'Frontière · cyber DE/CH' },
  { code: 'BRE', name: 'Bretagne',              q: 2, r: 2, alert: 'neutral', notes: 'Brest · sous-marins' },
  { code: 'PDL', name: 'Pays de la Loire',      q: 3, r: 2, alert: 'neutral', notes: 'RAS' },
  { code: 'CVL', name: 'Centre-Val de Loire',   q: 4, r: 2, alert: 'neutral', notes: 'RAS' },
  { code: 'BFC', name: 'Bourgogne-Franche-C.',  q: 5, r: 2, alert: 'neutral', notes: 'RAS' },
  { code: 'NAQ', name: 'Nouvelle-Aquitaine',    q: 3, r: 3, alert: 'gold',    notes: 'Manif agri · A63' },
  { code: 'ARA', name: 'Auvergne-Rhône-Alpes',  q: 5, r: 3, alert: 'gold',    notes: 'Lyon · vigi tribunaux' },
  { code: 'OCC', name: 'Occitanie',             q: 4, r: 4, alert: 'neutral', notes: 'RAS' },
  { code: 'PAC', name: 'PACA',                  q: 5, r: 4, alert: 'red',     notes: 'Marseille · trafics armes' },
  { code: 'COR', name: 'Corse',                 q: 6, r: 5, alert: 'gold',    notes: 'Tensions Bastia' },
];
const DROM = [
  { code: 'GUA', name: 'Guadeloupe', alert: 'neutral' },
  { code: 'MTQ', name: 'Martinique', alert: 'neutral' },
  { code: 'GUF', name: 'Guyane',     alert: 'gold' },
  { code: 'REU', name: 'Réunion',    alert: 'neutral' },
  { code: 'MYT', name: 'Mayotte',    alert: 'red' },
];

const POLITIQUE = [
  { lbl: 'PRÉSIDENT',     v: 'E. Macron',    sub: 'Approbation 27% · −2' },
  { lbl: '1ER MIN.',      v: 'S. Lecornu',   sub: 'Approbation 31% · +1' },
  { lbl: 'AN · MAJ.',     v: 'RELATIVE',     sub: 'NFP 178 · ENS 168 · RN 142' },
  { lbl: 'PROCHAIN VOTE', v: 'BUDGET 2026',  sub: '49.3 probable · 18 nov' },
];

const OPEX = [
  { name: 'Chammal',    theater: 'Levant · Irak/Syrie', troops: 600,  ships: 1, status: 'active',   since: '2014' },
  { name: 'Daman',      theater: 'FINUL · Liban',       troops: 700,  ships: 0, status: 'active',   since: '1978' },
  { name: 'Lynx',       theater: 'Estonie · OTAN',      troops: 350,  ships: 0, status: 'active',   since: '2017' },
  { name: 'Aigle',      theater: 'Roumanie · OTAN',     troops: 1100, ships: 0, status: 'active',   since: '2022' },
  { name: 'Akila',      theater: 'Mer Noire',           troops: 240,  ships: 2, status: 'active',   since: '2024' },
  { name: 'Corymbe',    theater: 'Golfe de Guinée',     troops: 220,  ships: 1, status: 'active',   since: '1990' },
  { name: 'Antarès',    theater: 'Atlantique N · OTAN', troops: 320,  ships: 1, status: 'active',   since: '2023' },
  { name: 'Sagittaire', theater: 'Indo-Pacifique',      troops: 380,  ships: 2, status: 'active',   since: '2025' },
  { name: 'Barkhane',   theater: 'Sahel · partenariat', troops: 100,  ships: 0, status: 'résiduel', since: '2014' },
  { name: 'Sentinelle', theater: 'Métropole',           troops: 7000, ships: 0, status: 'active',   since: '2015' },
  { name: 'Harpie',     theater: 'Guyane',              troops: 350,  ships: 0, status: 'active',   since: '2008' },
];

const MIX_ENERGY = [
  { src: 'Nucléaire',  pct: 68, color: 'var(--accent)' },
  { src: 'Hydraulique',pct: 11, color: 'var(--green)' },
  { src: 'Éolien',     pct: 9,  color: 'var(--gold)' },
  { src: 'Solaire',    pct: 4,  color: 'var(--gold)' },
  { src: 'Gaz',        pct: 5,  color: 'var(--red)' },
  { src: 'Autre',      pct: 3,  color: 'var(--fg-3)' },
];
const NUKE_PLANTS = [
  { name: 'Gravelines', units: 6, cap: '5460 MW', avail: 0.83 },
  { name: 'Cattenom',   units: 4, cap: '5200 MW', avail: 0.88 },
  { name: 'Tricastin',  units: 4, cap: '3660 MW', avail: 0.75 },
  { name: 'Paluel',     units: 4, cap: '5320 MW', avail: 0.71 },
  { name: 'Bugey',      units: 4, cap: '3580 MW', avail: 0.92 },
  { name: 'Civaux',     units: 2, cap: '2990 MW', avail: 0.66 },
];

// STATIC fallback marchés — remplacé par fetchMultipleStocks au mount
const MARCHES_STATIC = [
  { tk: 'CAC 40',   val: '—',    d: '…', up: true,  spark: [] as number[] },
  { tk: 'OAT 10Y',  val: '3,42', d: '+0,03', up: false, spark: [3.30,3.34,3.36,3.39,3.40,3.41,3.42] }, // STATIC — rendement OAT non dispo sans Bloomberg
  { tk: 'EUR/USD',  val: '—',    d: '…', up: false, spark: [] as number[] },
  { tk: 'Brent',    val: '—',    d: '…', up: true,  spark: [] as number[] },
  { tk: 'Gaz TTF',  val: '—',    d: '…', up: false, spark: [] as number[] },
  { tk: 'Or',       val: '—',    d: '…', up: true,  spark: [] as number[] },
];

type MarcheRow = { tk: string; val: string; d: string; up: boolean; spark: number[] };

// Symboles Yahoo Finance pour les marchés France
const FRANCE_MKT = [
  { symbol: '^FCHI',    name: 'CAC 40',  display: 'CAC 40' },
  { symbol: 'EURUSD=X', name: 'EUR/USD', display: 'EUR/USD' },
  { symbol: 'BZ=F',     name: 'Brent',   display: 'Brent' },
  { symbol: 'TTF=F',    name: 'Gaz TTF', display: 'Gaz TTF' },
  { symbol: 'GC=F',     name: 'Or',      display: 'Or' },
];
const SECTORS = [
  { name: 'Luxe',   d: '+1,2%', up: true,  big: 'LVMH · KER · RMS' },
  { name: 'Défense',d: '+2,1%', up: true,  big: 'DSY · THLS · SAF' },
  { name: 'Banque', d: '+0,4%', up: true,  big: 'BNP · GLE · ACA' },
  { name: 'Énergie',d: '−0,3%', up: false, big: 'TTE · ENGI · EDP' },
  { name: 'Auto',   d: '−1,1%', up: false, big: 'STLA · RNO · MICH' },
  { name: 'Tech',   d: '+0,9%', up: true,  big: 'CAP · ATO · STM' },
];

const TV_FR = [
  { id: 'lci', name: 'LCI',         tag: 'INFO 24/7',   live: 'Vote budget · AN' },
  { id: 'bfm', name: 'BFMTV',       tag: 'INFO 24/7',   live: 'Conf. presse PM · Matignon' },
  { id: 'f24', name: 'France 24',   tag: 'FR · EN · AR', live: 'Géopolitique · Iran' },
  { id: 'fi',  name: 'France Info', tag: 'INFO 24/7',   live: 'Direct AN · Hémicycle' },
  { id: 'rfi', name: 'RFI',         tag: 'RADIO',       live: 'Afrique · Sahel' },
  { id: 'tv5', name: 'TV5 Monde',   tag: 'INTL',        live: 'Journal Afrique' },
  { id: 'ps',  name: 'Public Sénat',tag: 'INSTITU.',    live: 'Question au gouv.' },
  { id: 'ln',  name: 'LCP',         tag: 'INSTITU.',    live: 'Commission Finances' },
];
const WEBCAMS = [
  { id: 'tro',  name: 'Trocadéro · Paris',       tag: '08:11' },
  { id: 'marc', name: 'Vieux Port · Marseille',   tag: '08:11' },
  { id: 'lyo',  name: 'Fourvière · Lyon',         tag: '08:11' },
  { id: 'rou',  name: 'Vieille ville · Rouen',    tag: '08:11' },
];

// Mapping EventCategory → code affiché + couleur
const CAT_COLOR: Record<string, string> = {
  POL: 'var(--accent)', ÉCO: 'var(--gold)', DÉF: 'var(--red)',
  SÉC: 'var(--red)', ÉNG: 'var(--accent)', INT: 'var(--gold)', DIP: 'var(--accent)',
  conflict: 'var(--red)', military: 'var(--red)', terrorism: 'var(--red)',
  economic: 'var(--gold)', diplomatic: 'var(--accent)',
  cyber: 'var(--red)', tech: 'var(--accent)',
  protest: 'var(--gold)', disaster: 'var(--gold)', environmental: 'var(--gold)',
  health: 'var(--accent)', crime: 'var(--red)', infrastructure: 'var(--gold)', general: 'var(--fg-3)',
};
const EVT_LABEL: Record<string, string> = {
  conflict: 'DÉF', military: 'DÉF', terrorism: 'SÉC',
  economic: 'ÉCO', diplomatic: 'DIP', cyber: 'CYB', tech: 'TECH',
  protest: 'SOC', disaster: 'ENV', environmental: 'ENV',
  health: 'SAN', crime: 'SÉC', infrastructure: 'INF', general: 'INFO',
};

const FR_TECH = [
  { id: 'fusion',  name: 'Fusion',    score: 76, rank: 2, total: 9, eyebrow: 'ITER · WEST · CEA',            tone: 'accent',  hero: 'ITER · 1er plasma Q4-2026' },
  { id: 'quantum', name: 'Quantique', score: 70, rank: 3, total: 9, eyebrow: 'Pasqal · Alice&Bob · Quandela', tone: 'accent',  hero: 'Plan €1.8Md · 132 qbits' },
  { id: 'energy',  name: 'Énergie',   score: 68, rank: 4, total: 9, eyebrow: 'EDF · ORANO · 56 réacteurs',   tone: 'gold',    hero: 'EPR2 · 6 réacteurs lancés' },
  { id: 'space',   name: 'Spatial',   score: 64, rank: 4, total: 9, eyebrow: 'ArianeGroup · CNES · Kourou',  tone: 'gold',    hero: 'Ariane 7 · vol 2029' },
  { id: 'bio',     name: 'Biotech',   score: 64, rank: 5, total: 9, eyebrow: 'Sanofi · Pasteur · INSERM',    tone: 'gold',    hero: 'Sanofi · ARN messager next-gen' },
  { id: 'cyber',   name: 'Cyber',     score: 62, rank: 6, total: 9, eyebrow: 'ANSSI · Thales · Campus Cyber',tone: 'gold',    hero: 'Thales × Cellebrite · UE' },
  { id: 'ai',      name: 'IA',        score: 58, rank: 6, total: 9, eyebrow: 'Mistral · INRIA · LightOn',    tone: 'neutral', hero: 'Mistral × Orange €450M' },
  { id: 'robo',    name: 'Robotique', score: 50, rank: 7, total: 9, eyebrow: 'Aldebaran · CEA-List · NG',    tone: 'neutral', hero: 'Naval Group · drones sous-marins' },
];
const FR_TECH_KPI = [
  { label: 'R&D / PIB',    v: '2,22%', sub: 'obj 3% · UE moy 2,3%',     tone: 'gold' },
  { label: 'BREVETS / AN', v: '16 240',sub: 'OEB · rang 4 mondial',      tone: 'accent' },
  { label: 'FRANCE 2030',  v: '54 Md€',sub: 'engagés sur 5 ans',         tone: 'accent' },
  { label: 'LICORNES',     v: '31',    sub: '+4 / 12 mois',              tone: 'green' },
  { label: 'CLOUD SOUV.',  v: '37%',   sub: 'SecNumCloud certifiés',     tone: 'gold' },
  { label: 'TALENTS IA',   v: '32k',   sub: 'vs 280k US · 180k CN',     tone: 'red' },
];
// TECH_NEWS_FR est généré dynamiquement depuis allNews dans renderFrance

// ─── Hex helper ──────────────────────────────────────────────────────
function hexPath(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return `M${pts[0]} L${pts.slice(1).join(' L')} Z`;
}

function toneFor(tone: string): string {
  if (tone === 'accent') return 'var(--accent)';
  if (tone === 'gold')   return 'var(--gold)';
  if (tone === 'red')    return 'var(--red)';
  if (tone === 'green')  return 'var(--green)';
  return 'var(--fg-2)';
}

// ─── Styles ──────────────────────────────────────────────────────────
function injectStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
.fr-wrap {
  position:absolute; inset:0;
  background:var(--bg-0); color:var(--fg-0);
  font-family:var(--sans);
  display:flex; flex-direction:column;
  overflow:hidden;
}
.fr-scroll { flex:1; overflow-y:auto; padding:56px 18px 32px; display:flex; flex-direction:column; gap:16px; }
.fr-eyebrow { font-family:var(--mono);font-size:9.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--fg-3); }
.fr-card { background:var(--bg-1);border:1px solid var(--line-1);border-radius:14px; }

/* Header */
.fr-header { display:flex;align-items:flex-end;justify-content:space-between; }
.fr-title { font-family:var(--serif);font-weight:300;font-size:36px;letter-spacing:-0.03em; }
.fr-jbtn { font-family:var(--mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;
  padding:7px 14px;border-radius:6px;cursor:pointer;
  background:var(--bg-1);border:1px solid var(--line-2);color:var(--fg-2); }
.fr-jbtn.danger { background:rgba(229,72,77,.12);border-color:rgba(229,72,77,.4);color:var(--red); }
.fr-jbtn.solid { background:var(--accent-soft);border-color:var(--accent-line);color:var(--accent); }

/* KPI strip */
.fr-kpis { display:grid;grid-template-columns:repeat(6,1fr);gap:16px; }
.fr-kpi { padding:14px;display:flex;flex-direction:column;gap:6px;border-radius:10px;
  border:1px solid var(--line-1);background:var(--bg-1); }
.fr-kpi-label { font-family:var(--mono);font-size:9.5px;letter-spacing:.14em;
  color:var(--fg-3);text-transform:uppercase; }
.fr-kpi-val { font-family:var(--serif);font-weight:300;font-size:26px;
  letter-spacing:-0.02em;font-variant-numeric:tabular-nums; }
.fr-kpi-sub { font-family:var(--mono);font-size:10px;letter-spacing:.08em;color:var(--fg-2); }

/* Row 1 — hex map | politique | opex */
.fr-row1 { display:grid;grid-template-columns:1.25fr 0.85fr 0.95fr;gap:16px; }

/* Hex map */
.fr-hexmap { padding:18px;display:flex;flex-direction:column;gap:10px; }
.fr-hexmap-head { display:flex;align-items:baseline;justify-content:space-between; }
.fr-hexmap-legend { display:flex;gap:8px; }
.fr-legend-item { display:flex;align-items:center;gap:6px;
  font-family:var(--mono);font-size:9px;letter-spacing:.12em;
  color:var(--fg-3);text-transform:uppercase; }
.fr-legend-swatch { width:8px;height:8px;border-radius:2px; }
.fr-region-info { border-top:1px solid var(--line-1);padding-top:10px;
  display:flex;align-items:flex-start;gap:14px; }
.fr-region-badge { font-family:var(--mono);font-size:11px;letter-spacing:.14em;
  padding:4px 10px;border-radius:4px;flex-shrink:0; }
.fr-region-name { font-family:var(--serif);font-weight:300;font-size:18px;
  letter-spacing:-0.02em;color:var(--fg-0); }
.fr-region-notes { font-family:var(--mono);font-size:10.5px;letter-spacing:.06em;
  color:var(--fg-2);margin-top:2px; }

/* Politique */
.fr-politique { padding:18px;display:flex;flex-direction:column;gap:12px; }
.fr-pol-row { display:flex;flex-direction:column;gap:2px;padding-bottom:10px;border-bottom:1px solid var(--line-1); }
.fr-pol-row:last-of-type { border-bottom:none; }
.fr-pol-lbl { font-family:var(--mono);font-size:9px;letter-spacing:.14em;color:var(--fg-3);text-transform:uppercase; }
.fr-pol-val { font-family:var(--serif);font-weight:300;font-size:20px;letter-spacing:-0.02em;color:var(--fg-0); }
.fr-pol-sub { font-family:var(--mono);font-size:10px;color:var(--fg-2); }
.fr-conseil { margin-top:auto;padding:10px;background:var(--bg-2);
  border:1px solid var(--accent-line);border-radius:6px;
  display:flex;align-items:center;gap:10px; }
.fr-conseil-dot { width:8px;height:8px;background:var(--accent);border-radius:50%;
  box-shadow:0 0 6px var(--accent); }

/* OPEX */
.fr-opex { padding:18px;display:flex;flex-direction:column;gap:8px; }
.fr-opex-row { display:grid;grid-template-columns:84px 1fr 56px;
  gap:8px;align-items:baseline;padding:6px 0;
  border-bottom:1px dashed var(--line-1); }
.fr-opex-row:last-child { border-bottom:none; }
.fr-opex-name { font-family:var(--mono);font-size:10.5px;letter-spacing:.06em;font-weight:500; }
.fr-opex-theater { font-family:var(--mono);font-size:10px;color:var(--fg-1);letter-spacing:.02em; }
.fr-opex-troops { font-family:var(--mono);font-size:10px;color:var(--fg-2);
  font-variant-numeric:tabular-nums;text-align:right; }

/* Row 2 — énergie | marchés | secteurs */
.fr-row2 { display:grid;grid-template-columns:1.1fr 1.1fr 0.9fr;gap:16px; }
.fr-energie { padding:18px;display:flex;flex-direction:column;gap:12px; }
.fr-mix-bar { display:flex;height:14px;border-radius:3px;overflow:hidden;border:1px solid var(--line-1); }
.fr-mix-seg { opacity:.85; }
.fr-mix-legend { display:grid;grid-template-columns:repeat(3,1fr);gap:6px; }
.fr-mix-item { display:flex;align-items:center;gap:6px; }
.fr-mix-swatch { width:8px;height:8px;border-radius:1px; }
.fr-mix-label { font-family:var(--mono);font-size:10px;color:var(--fg-2);letter-spacing:.04em; }
.fr-mix-pct { font-family:var(--mono);font-size:10px;color:var(--fg-0);
  margin-left:auto;font-variant-numeric:tabular-nums; }
.fr-nuke { margin-top:6px;padding-top:10px;border-top:1px solid var(--line-1);
  display:flex;flex-direction:column;gap:5px; }
.fr-nuke-row { display:grid;grid-template-columns:90px 60px 1fr 36px;gap:8px;align-items:center; }
.fr-nuke-name { font-family:var(--mono);font-size:10.5px;color:var(--fg-1);letter-spacing:.02em; }
.fr-nuke-cap  { font-family:var(--mono);font-size:10px;color:var(--fg-3); }
.fr-nuke-bar  { position:relative;height:4px;background:var(--bg-3);border-radius:2px;overflow:hidden; }
.fr-nuke-fill { position:absolute;inset:0;border-radius:2px; }
.fr-nuke-pct  { font-family:var(--mono);font-size:10px;color:var(--fg-0);
  text-align:right;font-variant-numeric:tabular-nums; }

/* Marchés */
.fr-marches { padding:18px;display:flex;flex-direction:column;gap:8px; }
.fr-marche-row { display:grid;grid-template-columns:80px 90px 1fr 72px;
  gap:10px;align-items:center;padding:8px 0;border-bottom:1px dashed var(--line-1); }
.fr-marche-row:last-child { border-bottom:none; }
.fr-tk { font-family:var(--mono);font-size:11px;color:var(--fg-0);letter-spacing:.06em;font-weight:500; }
.fr-val { font-family:var(--mono);font-size:11px;color:var(--fg-0);font-variant-numeric:tabular-nums; }
.fr-delta { font-family:var(--mono);font-size:11px;font-variant-numeric:tabular-nums;text-align:right; }

/* Secteurs */
.fr-sectors { padding:18px;display:flex;flex-direction:column;gap:8px; }
.fr-sector-row { display:flex;flex-direction:column;gap:2px;padding:6px 0;border-bottom:1px dashed var(--line-1); }
.fr-sector-row:last-child { border-bottom:none; }
.fr-sector-top { display:flex;align-items:baseline;justify-content:space-between; }
.fr-sector-name { font-size:13px;color:var(--fg-0);font-weight:500; }
.fr-sector-delta { font-family:var(--mono);font-size:11px;font-variant-numeric:tabular-nums; }
.fr-sector-big { font-family:var(--mono);font-size:10px;color:var(--fg-3);letter-spacing:.06em; }

/* Tech FR */
.fr-techfr { display:grid;grid-template-columns:1.05fr 0.95fr 1fr;gap:16px; }
.fr-techfr-left { padding:18px;display:flex;flex-direction:column;gap:10px; }
.fr-techfr-bar-row { display:grid;grid-template-columns:auto 1fr auto;column-gap:10px;row-gap:2px;align-items:center; }
.fr-techfr-bar-wrap { position:relative;height:7px;background:var(--bg-3);border-radius:2px;overflow:hidden; }
.fr-techfr-bar-fill { position:absolute;inset:0;opacity:.95;border-radius:2px; }
.fr-techfr-median { position:absolute;left:55%;top:-2px;bottom:-2px;width:1px;background:rgba(220,232,255,.30); }
.fr-kpi-card { padding:18px;display:flex;flex-direction:column;gap:12px; }
.fr-kpi-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:10px; }
.fr-kpi-tile { display:flex;flex-direction:column;gap:4px;padding-left:10px; }
.fr-kpi-tile-lbl { font-family:var(--mono);font-size:8.5px;letter-spacing:.14em;
  color:var(--fg-3);text-transform:uppercase; }
.fr-kpi-tile-val { font-family:var(--serif);font-weight:300;font-size:22px;
  letter-spacing:-0.025em;color:var(--fg-0);font-variant-numeric:tabular-nums; }
.fr-kpi-tile-sub { font-family:var(--mono);font-size:9px;letter-spacing:.06em; }
.fr-champions { padding:18px;display:flex;flex-direction:column;gap:10px; }
.fr-champion-row { display:grid;grid-template-columns:78px 1fr auto;gap:10px;
  padding:6px 0;align-items:center;border-bottom:1px dashed var(--line-1); }
.fr-techfr-news { padding:18px;display:flex;flex-direction:column;gap:8px; }
.fr-news-item { display:flex;flex-direction:column;gap:3px;padding:7px 0;border-bottom:1px dashed var(--line-1); }
.fr-news-item:last-child { border-bottom:none; }
.fr-news-meta { display:flex;align-items:center;gap:8px; }
.fr-news-cat { font-family:var(--mono);font-size:8.5px;letter-spacing:.14em;text-transform:uppercase;
  padding:2px 5px;border-radius:3px; }
.fr-news-src { font-family:var(--mono);font-size:9px;letter-spacing:.08em;
  color:var(--fg-3);text-transform:uppercase; }
.fr-news-time { font-family:var(--mono);font-size:9px;color:var(--fg-3);
  margin-left:auto;font-variant-numeric:tabular-nums; }
.fr-news-text { font-size:12px;color:var(--fg-1);line-height:1.35; }

/* TV + webcams */
.fr-tv-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:10px; }
.fr-tv-cell { aspect-ratio:16/9;border-radius:6px;position:relative;overflow:hidden;cursor:pointer;
  background:linear-gradient(135deg,#0A0E16 0%,#0F1420 100%);
  border:1px solid var(--line-1);transition:all .15s; }
.fr-tv-cell.active { border-color:var(--accent);box-shadow:0 0 12px rgba(74,158,255,.35); }
.fr-tv-scanlines { position:absolute;inset:0;pointer-events:none;
  background-image:repeating-linear-gradient(180deg,rgba(255,255,255,0) 0 2px,rgba(255,255,255,.025) 2px 3px); }
.fr-tv-live { position:absolute;top:6px;left:6px;display:flex;align-items:center;gap:4px;
  padding:2px 5px;background:rgba(229,72,77,.85);border-radius:2px; }
.fr-tv-live-dot { width:4px;height:4px;background:#fff;border-radius:50%; }
.fr-tv-live-txt { font-family:var(--mono);font-size:7px;letter-spacing:.14em;color:#fff;font-weight:600; }
.fr-tv-center { position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  flex-direction:column;gap:2px; }
.fr-tv-name { font-family:var(--serif);font-weight:300;font-size:24px;
  letter-spacing:-0.02em;color:var(--fg-1); }
.fr-tv-tag { font-family:var(--mono);font-size:8px;letter-spacing:.14em;
  color:var(--fg-3);text-transform:uppercase; }
.fr-tv-lower { position:absolute;left:6px;right:6px;bottom:6px;
  padding:4px 7px;background:rgba(6,8,13,0.85);
  border-left:2px solid var(--accent);border-radius:2px; }
.fr-tv-lower-txt { font-family:var(--mono);font-size:8.5px;letter-spacing:.06em;
  color:var(--fg-1);display:block;line-height:1.25;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
.fr-cam-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:10px; }
.fr-cam-cell { aspect-ratio:16/9;border-radius:6px;position:relative;overflow:hidden;
  border:1px solid var(--line-1);
  background:linear-gradient(180deg,#0E1422 0%,#060810 100%); }
.fr-cam-stripes { position:absolute;inset:0;
  background-image:repeating-linear-gradient(135deg,transparent 0 8px,rgba(74,158,255,.04) 8px 9px); }
.fr-cam-badge { position:absolute;top:6px;left:6px;font-family:var(--mono);font-size:8px;
  letter-spacing:.14em;color:var(--accent);text-transform:uppercase;
  padding:2px 5px;background:rgba(74,158,255,.10);
  border:1px solid var(--accent-line);border-radius:2px; }
.fr-cam-name { position:absolute;left:6px;right:6px;bottom:6px;font-family:var(--mono);
  font-size:9.5px;letter-spacing:.06em;color:var(--fg-1); }

/* News FR */
.fr-news-fr { padding:18px;display:flex;flex-direction:column;gap:6px; }
.fr-news-fr-row { display:flex;flex-direction:column;gap:3px;padding:7px 0;border-bottom:1px dashed var(--line-1); }
.fr-news-fr-row:last-child { border-bottom:none; }
.fr-news-fr-meta { display:flex;align-items:center;gap:8px; }
.fr-news-fr-cat { font-family:var(--mono);font-size:8.5px;letter-spacing:.14em;text-transform:uppercase;
  padding:2px 5px;border-radius:3px;border:1px solid currentColor;opacity:.95; }
.fr-news-fr-src { font-family:var(--mono);font-size:9px;letter-spacing:.08em;
  color:var(--fg-3);text-transform:uppercase; }
.fr-news-fr-time { font-family:var(--mono);font-size:9px;color:var(--fg-3);
  margin-left:auto;font-variant-numeric:tabular-nums; }
.fr-news-fr-text { font-size:12.5px;color:var(--fg-1);line-height:1.35; }
`;
  document.head.appendChild(s);
}

// ─── Hex map SVG ─────────────────────────────────────────────────────
function buildHexMap(selected: string): string {
  const hexes = FR_REGIONS.map(r => {
    const cx = 50 + r.q * 46;
    const cy = 40 + r.r * 52;
    const off = (r.r % 2) * 23;
    const x = cx + off - 90;
    const y = cy + 10;
    const c = ALERT_COLOR[r.alert]!;
    const isSel = r.code === selected;
    const alertTxt = r.alert === 'red' ? '● URG' : r.alert === 'gold' ? '▲ VIG' : '○ RAS';
    return `<g data-code="${r.code}" style="cursor:pointer">
      <path d="${hexPath(x, y, 28)}" fill="${c.bg}"
        stroke="${isSel ? 'var(--accent)' : c.line}"
        stroke-width="${isSel ? 2.2 : 1}"
        style="filter:${isSel ? 'drop-shadow(0 0 8px var(--accent))' : 'none'};transition:all .15s"/>
      <text x="${x}" y="${y - 2}" text-anchor="middle"
        style="font-family:var(--mono);font-size:9px;letter-spacing:.06em;fill:${c.fg};font-weight:500">${r.code}</text>
      <text x="${x}" y="${y + 9}" text-anchor="middle"
        style="font-family:var(--mono);font-size:7px;fill:var(--fg-3)">${alertTxt}</text>
    </g>`;
  }).join('');

  const dromCells = DROM.map((d, i) => {
    const c = ALERT_COLOR[d.alert]!;
    const alertTxt = d.alert === 'red' ? 'URG' : d.alert === 'gold' ? 'VIG' : 'RAS';
    return `<g transform="translate(${i * 68}, 16)">
      <rect width="60" height="40" rx="4" fill="${c.bg}" stroke="${c.line}" stroke-width="1"/>
      <text x="30" y="18" text-anchor="middle"
        style="font-family:var(--mono);font-size:9px;fill:${c.fg};font-weight:500">${d.code}</text>
      <text x="30" y="30" text-anchor="middle"
        style="font-family:var(--mono);font-size:7px;fill:var(--fg-3)">${alertTxt}</text>
    </g>`;
  }).join('');

  return `<svg viewBox="0 0 380 360" style="width:100%;height:360px;display:block">
    ${hexes}
    <g transform="translate(20, 290)">
      <text x="0" y="0" style="font-family:var(--mono);font-size:9px;letter-spacing:.14em;fill:var(--fg-3);text-transform:uppercase">DROM</text>
      ${dromCells}
    </g>
  </svg>`;
}

// ─── RTE Eco2mix fetch (public, sans auth) ───────────────────────────
type MixItem = { src: string; pct: number; color: string };

async function fetchRteMix(): Promise<MixItem[]> {
  const url = 'https://odre.opendatasoft.com/api/records/1.0/search/?dataset=eco2mix-national-tr&q=&rows=1&sort=-date_heure&timezone=Europe%2FParis';
  const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
  const json = await r.json() as { records?: Array<{ fields?: Record<string, number> }> };
  const f = json?.records?.[0]?.fields;
  if (!f) return MIX_ENERGY;
  const sources: Array<[string, number, string]> = [
    ['Nucléaire',   f['nucleaire']   ?? 0, 'var(--accent)'],
    ['Hydraulique', f['hydraulique'] ?? 0, 'var(--green)'],
    ['Éolien',      f['eolien']      ?? 0, 'var(--gold)'],
    ['Solaire',     f['solaire']     ?? 0, 'var(--gold)'],
    ['Gaz',         f['gaz']         ?? 0, 'var(--red)'],
    ['Autre',       (f['fioul'] ?? 0) + (f['charbon'] ?? 0) + (f['bioenergies'] ?? 0), 'var(--fg-3)'],
  ];
  const total = sources.reduce((s, [,v]) => s + Math.max(0, v), 0) || 1;
  return sources
    .map(([src, mw, color]) => ({ src, pct: Math.round(Math.max(0, mw) / total * 100), color }))
    .filter(m => m.pct > 0);
}

// ─── Export ──────────────────────────────────────────────────────────
export function renderFrance(host: HTMLElement, data?: JarvisViewData): () => void {
  injectStyles();

  let selectedRegion = 'IDF';
  let tvIdx = 0;
  let liveMix: MixItem[] = MIX_ENERGY;
  let liveMarches: MarcheRow[] = MARCHES_STATIC;
  let liveKpiCac = '—';
  let liveKpiCacSub = '…';

  // news filtrées au mount (snapshot — les vues ne se re-montent pas à chaque refresh news)
  const frNews = (data?.news ?? [])
    .filter(isFrenchSource)
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
    .slice(0, 9);
  const techNewsFr = (data?.news ?? [])
    .filter(n => isFrenchSource(n) && isTechNews(n))
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
    .slice(0, 6);

  function refresh(): void {
    const sel = FR_REGIONS.find(r => r.code === selectedRegion) ?? FR_REGIONS[0]!;
    const selC = ALERT_COLOR[sel.alert]!;

    // Patch KPI CAC 40 avec valeur live si disponible
    const kpisDisplay = KPIS.map(k => {
      if (k.label === 'CAC 40') return { ...k, v: liveKpiCac, sub: liveKpiCacSub };
      return k;
    });
    const kpis = kpisDisplay.map(k => {
      const c = ALERT_COLOR[k.tone] ?? ALERT_COLOR['neutral']!;
      const borderColor = k.tone === 'red' ? c.line : 'var(--line-1)';
      const boxShadow = k.tone === 'red' ? `inset 0 0 24px ${c.bg}` : 'none';
      return `<div class="fr-kpi" style="border-color:${borderColor};box-shadow:${boxShadow}">
        <span class="fr-kpi-label">${k.label}</span>
        <span class="fr-kpi-val" style="color:${c.fg}">${k.v}</span>
        <span class="fr-kpi-sub">${k.sub}</span>
      </div>`;
    }).join('');

    const politiqueRows = POLITIQUE.map((p, i) =>
      `<div class="fr-pol-row" style="${i===POLITIQUE.length-1?'border-bottom:none':''}">
        <span class="fr-pol-lbl">${p.lbl}</span>
        <span class="fr-pol-val">${p.v}</span>
        <span class="fr-pol-sub">${p.sub}</span>
      </div>`
    ).join('');

    const opexRows = OPEX.map((o, i) =>
      `<div class="fr-opex-row" style="${i===OPEX.length-1?'border-bottom:none':''}">
        <span class="fr-opex-name" style="color:${o.status==='active'?'var(--accent)':'var(--gold)'}">${o.name}</span>
        <span class="fr-opex-theater">${o.theater}</span>
        <span class="fr-opex-troops">${o.troops.toLocaleString('fr')}${o.ships?` · ${o.ships}n`:''}</span>
      </div>`
    ).join('');

    const mixBar = liveMix.map((m, i) =>
      `<div class="fr-mix-seg" style="width:${m.pct}%;background:${m.color};
        border-right:${i<liveMix.length-1?'1px solid var(--bg-1)':'none'}"></div>`
    ).join('');
    const mixLegend = liveMix.map(m =>
      `<div class="fr-mix-item">
        <span class="fr-mix-swatch" style="background:${m.color}"></span>
        <span class="fr-mix-label">${m.src}</span>
        <span class="fr-mix-pct">${m.pct}%</span>
      </div>`
    ).join('');
    const nukeRows = NUKE_PLANTS.map(p => {
      const barColor = p.avail >= 0.8 ? 'var(--accent)' : p.avail >= 0.7 ? 'var(--gold)' : 'var(--red)';
      return `<div class="fr-nuke-row">
        <span class="fr-nuke-name">${p.name}</span>
        <span class="fr-nuke-cap">${p.cap}</span>
        <div class="fr-nuke-bar">
          <div class="fr-nuke-fill" style="width:${p.avail*100}%;background:${barColor}"></div>
        </div>
        <span class="fr-nuke-pct">${Math.round(p.avail*100)}%</span>
      </div>`;
    }).join('');

    const marcheRows = liveMarches.map((m, i) =>
      `<div class="fr-marche-row" style="${i===liveMarches.length-1?'border-bottom:none':''}">
        <span class="fr-tk">${m.tk}</span>
        <span class="fr-val">${m.val}</span>
        ${m.spark.length ? sparkline(m.spark, m.up?'var(--green)':'var(--red)', 130, 20) : ''}
        <span class="fr-delta" style="color:${m.up?'var(--green)':'var(--red)'}">${m.d}</span>
      </div>`
    ).join('');

    const sectorRows = SECTORS.map((s, i) =>
      `<div class="fr-sector-row" style="${i===SECTORS.length-1?'border-bottom:none':''}">
        <div class="fr-sector-top">
          <span class="fr-sector-name">${s.name}</span>
          <span class="fr-sector-delta" style="color:${s.up?'var(--green)':'var(--red)'}">${s.d}</span>
        </div>
        <span class="fr-sector-big">${s.big}</span>
      </div>`
    ).join('');

    const techRows = FR_TECH.map(d => {
      const c = toneFor(d.tone);
      return `<div class="fr-techfr-bar-row">
        <span style="font-family:var(--mono);font-size:11px;color:${c};letter-spacing:.06em;font-weight:500;min-width:78px">${d.name}</span>
        <div class="fr-techfr-bar-wrap">
          <div class="fr-techfr-bar-fill" style="width:${d.score}%;background:${c}"></div>
          <div class="fr-techfr-median"></div>
        </div>
        <span style="font-family:var(--mono);font-size:11px;color:var(--fg-0);font-variant-numeric:tabular-nums;min-width:64px;text-align:right">
          ${d.score} <span style="color:var(--fg-3);font-size:9.5px">· #${d.rank}/${d.total}</span>
        </span>
        <span></span>
        <span style="grid-column:2/span 2;font-family:var(--mono);font-size:9.5px;letter-spacing:.08em;
          color:${d.score<60?'var(--red)':'var(--fg-3)'};text-transform:uppercase;margin-top:-2px;margin-bottom:2px">${d.eyebrow}</span>
      </div>`;
    }).join('');

    const kpiTiles = FR_TECH_KPI.map(k => {
      const c = toneFor(k.tone);
      return `<div class="fr-kpi-tile" style="border-left:2px solid ${c}">
        <span class="fr-kpi-tile-lbl">${k.label}</span>
        <span class="fr-kpi-tile-val">${k.v}</span>
        <span class="fr-kpi-tile-sub" style="color:${c}">${k.sub}</span>
      </div>`;
    }).join('');

    const championRows = FR_TECH.slice(0, 6).map(d => {
      const c = toneFor(d.tone);
      return `<div class="fr-champion-row">
        <span style="font-family:var(--mono);font-size:10.5px;color:${c};letter-spacing:.08em">${d.name}</span>
        <span style="font-size:11.5px;color:var(--fg-1);line-height:1.3">${d.hero}</span>
        <span style="font-family:var(--mono);font-size:9px;letter-spacing:.10em;color:var(--fg-3)">#${d.rank}</span>
      </div>`;
    }).join('');

    const techSrc = techNewsFr.length > 0 ? techNewsFr : [];
    const techNewsRows = (techSrc.length > 0 ? techSrc.map((n, i) =>
      `<div class="fr-news-item" style="${i===techSrc.length-1?'border-bottom:none':''}">
        <div class="fr-news-meta">
          <span class="fr-news-cat" style="color:var(--accent);border-color:var(--accent-line);background:var(--accent-soft)">TECH</span>
          <span class="fr-news-src">${n.source}</span>
          <span class="fr-news-time">${fmtUtc(n.pubDate)}</span>
        </div>
        <span class="fr-news-text">${n.title}</span>
      </div>`) : [`<div class="fr-news-item" style="border-bottom:none;color:var(--fg-3)">Aucune actu tech FR · en attente</div>`]).join('');

    const tvCells = TV_FR.map((t, i) => {
      const isSel = i === tvIdx;
      return `<div class="fr-tv-cell${isSel?' active':''}" data-tvidx="${i}">
        <div class="fr-tv-scanlines"></div>
        <div class="fr-tv-live">
          <span class="fr-tv-live-dot"></span>
          <span class="fr-tv-live-txt">LIVE</span>
        </div>
        <div class="fr-tv-center">
          <span class="fr-tv-name">${t.name}</span>
          <span class="fr-tv-tag">${t.tag}</span>
        </div>
        <div class="fr-tv-lower">
          <span class="fr-tv-lower-txt">${t.live}</span>
        </div>
      </div>`;
    }).join('');

    const camCells = WEBCAMS.map(w =>
      `<div class="fr-cam-cell">
        <div class="fr-cam-stripes"></div>
        <div class="fr-cam-badge">WEBCAM · ${w.tag}</div>
        <div class="fr-cam-name">${w.name}</div>
      </div>`
    ).join('');

    const newsSource = frNews.length > 0 ? frNews : [];
    const newsRows = (newsSource.length > 0 ? newsSource.map((n, i) => {
      const cat = EVT_LABEL[n.threat?.category ?? ''] ?? 'INFO';
      const catColor = CAT_COLOR[n.threat?.category ?? ''] ?? CAT_COLOR[cat] ?? 'var(--fg-3)';
      const alertColor = threatColor(n) === 'red' ? 'var(--red)' : 'inherit';
      return `<div class="fr-news-fr-row" style="${i===newsSource.length-1?'border-bottom:none':''}">
        <div class="fr-news-fr-meta">
          <span class="fr-news-fr-cat" style="color:${catColor}">${cat}</span>
          <span class="fr-news-fr-src">${n.source}</span>
          <span class="fr-news-fr-time">${fmtUtc(n.pubDate)}</span>
        </div>
        <span class="fr-news-fr-text" style="color:${alertColor}">${n.title}</span>
      </div>`;
    }) : [`<div class="fr-news-fr-row" style="border-bottom:none;color:var(--fg-3)">Aucune actu française · en attente du flux</div>`]).join('');

    const hexMapLegend = ['red','gold','neutral'].map(t => {
      const c = ALERT_COLOR[t]!;
      const lbl = t==='red'?'URGENT':t==='gold'?'VIGI':'RAS';
      return `<span class="fr-legend-item">
        <span class="fr-legend-swatch" style="background:${c.bg};border:1px solid ${c.line}"></span>${lbl}
      </span>`;
    }).join('');

    host.innerHTML = `
      <div class="fr-wrap">
        <div class="fr-scroll">

          <!-- HEADER -->
          <div class="fr-header">
            <div style="display:flex;flex-direction:column;gap:4px">
              <span style="font-family:var(--mono);font-size:10.5px;letter-spacing:.18em;
                color:var(--accent);text-transform:uppercase">06 · FRANCE</span>
              <div style="display:flex;align-items:baseline;gap:14px">
                <span class="fr-title">République française</span>
                <span style="font-family:var(--mono);font-size:11px;letter-spacing:.14em;color:var(--fg-3)">
                  · 68,4 M HAB · 13 RÉGIONS · 5 DROM</span>
              </div>
            </div>
            <div style="display:flex;gap:8px">
              <button class="fr-jbtn danger">VIGIPIRATE · URG. ATT.</button>
              <button class="fr-jbtn">NOTE DE SYNTHÈSE</button>
              <button class="fr-jbtn solid">CONFIDENTIEL · DR</button>
            </div>
          </div>

          <!-- KPIS -->
          <div class="fr-kpis">${kpis}</div>

          <!-- ROW 1 -->
          <div class="fr-row1">

            <!-- Hex map -->
            <div class="fr-card fr-hexmap">
              <div class="fr-hexmap-head">
                <span class="fr-eyebrow">RÉGIONS · ALERTE / VIGILANCE</span>
                <div class="fr-hexmap-legend">${hexMapLegend}</div>
              </div>
              ${buildHexMap(selectedRegion)}
              <div class="fr-region-info">
                <span class="fr-region-badge" style="color:${selC.fg};background:${selC.bg};border:1px solid ${selC.line}">${sel.code}</span>
                <div>
                  <div class="fr-region-name">${sel.name}</div>
                  <div class="fr-region-notes">${sel.notes}</div>
                </div>
              </div>
            </div>

            <!-- Politique -->
            <div class="fr-card fr-politique">
              <span class="fr-eyebrow">POLITIQUE</span>
              ${politiqueRows}
              <div class="fr-conseil">
                <span class="fr-conseil-dot"></span>
                <span style="font-family:var(--mono);font-size:10px;letter-spacing:.08em;color:var(--fg-1)">
                  Conseil de défense · 14h00 · Élysée</span>
              </div>
            </div>

            <!-- OPEX -->
            <div class="fr-card fr-opex">
              <div style="display:flex;align-items:baseline;justify-content:space-between">
                <span class="fr-eyebrow">OPEX · 11 EN COURS</span>
                <span style="font-family:var(--mono);font-size:10px;letter-spacing:.08em;color:var(--accent);font-variant-numeric:tabular-nums">
                  ≈ 12 400 militaires</span>
              </div>
              ${opexRows}
            </div>
          </div>

          <!-- ROW 2 -->
          <div class="fr-row2">

            <!-- Énergie -->
            <div class="fr-card fr-energie">
              <div style="display:flex;align-items:baseline;justify-content:space-between">
                <span class="fr-eyebrow">ÉNERGIE · MIX TEMPS RÉEL</span>
                <span style="font-family:var(--serif);font-weight:300;font-size:22px;color:var(--accent);letter-spacing:-0.02em">62,4 GW</span>
              </div>
              <div class="fr-mix-bar">${mixBar}</div>
              <div class="fr-mix-legend">${mixLegend}</div>
              <div class="fr-nuke">
                <span class="fr-eyebrow" style="margin-bottom:2px">CENTRALES · TOP 6 / 18</span>
                ${nukeRows}
              </div>
            </div>

            <!-- Marchés -->
            <div class="fr-card fr-marches">
              <span class="fr-eyebrow">MARCHÉS · CLÔTURE J-1</span>
              ${marcheRows}
            </div>

            <!-- Secteurs -->
            <div class="fr-card fr-sectors">
              <span class="fr-eyebrow">SECTEURS CAC</span>
              ${sectorRows}
            </div>
          </div>

          <!-- TECH FR -->
          <div class="fr-techfr">
            <!-- Domain scores -->
            <div class="fr-card fr-techfr-left">
              <div style="display:flex;align-items:baseline;justify-content:space-between">
                <span class="fr-eyebrow">TECH FR · POSITION MONDIALE</span>
                <span style="font-family:var(--mono);font-size:9.5px;letter-spacing:.10em;color:var(--accent)">SCORE GLOBAL · 64 / RANG 4</span>
              </div>
              <div style="display:flex;flex-direction:column;gap:7px">${techRows}</div>
              <div style="display:flex;gap:6px;padding-top:6px;border-top:1px dashed var(--line-1);
                font-family:var(--mono);font-size:9px;letter-spacing:.12em;color:var(--fg-3)">
                <span>● BAR FR</span>
                <span style="margin-left:12px">│ MÉDIANE 9 ACTEURS</span>
              </div>
            </div>

            <!-- KPI + Champions -->
            <div style="display:flex;flex-direction:column;gap:16px">
              <div class="fr-card fr-kpi-card">
                <span class="fr-eyebrow">R&D · BREVETS · TALENT</span>
                <div class="fr-kpi-grid">${kpiTiles}</div>
              </div>
              <div class="fr-card fr-champions">
                <span class="fr-eyebrow">CHAMPIONS · ACTU PAR DOMAINE</span>
                ${championRows}
              </div>
            </div>

            <!-- News Tech FR -->
            <div class="fr-card fr-techfr-news">
              <div style="display:flex;align-items:baseline;justify-content:space-between">
                <span class="fr-eyebrow">FLUX TECH FR · 24H</span>
                <span style="font-family:var(--mono);font-size:9.5px;letter-spacing:.12em;color:var(--accent)">● 6 / 48</span>
              </div>
              ${techNewsRows}
            </div>
          </div>

          <!-- TV + news -->
          <div style="display:grid;grid-template-columns:1.35fr 0.65fr;gap:16px">

            <!-- TV + webcams -->
            <div class="fr-card" style="padding:18px;display:flex;flex-direction:column;gap:10px">
              <div style="display:flex;align-items:baseline;justify-content:space-between">
                <span class="fr-eyebrow">MÉDIAS FR · DIRECTS</span>
                <div style="display:flex;gap:8px">
                  <button class="fr-jbtn">SYNTHÈSE IA</button>
                  <button class="fr-jbtn">SON · LCI</button>
                </div>
              </div>
              <div class="fr-tv-grid" id="fr-tv-grid">${tvCells}</div>
              <div class="fr-cam-grid">${camCells}</div>
            </div>

            <!-- News FR -->
            <div class="fr-card fr-news-fr">
              <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:4px">
                <span class="fr-eyebrow">FLUX FR · 24H</span>
                <span style="font-family:var(--mono);font-size:9.5px;letter-spacing:.12em;color:var(--accent)">● 9 / 142</span>
              </div>
              ${newsRows}
            </div>
          </div>

        </div>
      </div>`;

    // Hex map clicks
    host.querySelectorAll<SVGGElement>('[data-code]').forEach(g => {
      g.addEventListener('click', () => {
        selectedRegion = g.dataset.code!;
        refresh();
      });
    });

    // TV clicks
    host.querySelectorAll<HTMLElement>('[data-tvidx]').forEach(el => {
      el.addEventListener('click', () => {
        tvIdx = parseInt(el.dataset.tvidx!, 10);
        refresh();
      });
    });
  }

  refresh();

  // ─── Fetches async au mount ──────────────────────────────────────────
  let destroyed = false;

  // Marchés France (CAC 40, EUR/USD, Brent, TTF, Or) via le service market existant
  fetchMultipleStocks(FRANCE_MKT).then(result => {
    if (destroyed || !result.data.length) return;
    const bySymbol = new Map(result.data.map(m => [m.symbol, m]));
    const rows: MarcheRow[] = [
      bySymbol.get('^FCHI'),
      { symbol: 'OAT_STATIC', name: 'OAT 10Y', display: 'OAT 10Y', price: 3.42, change: 0.03, sparkline: [3.30,3.34,3.36,3.39,3.40,3.41,3.42] } as import('@/types').MarketData,
      bySymbol.get('EURUSD=X'),
      bySymbol.get('BZ=F'),
      bySymbol.get('TTF=F'),
      bySymbol.get('GC=F'),
    ].map((m): MarcheRow => {
      if (!m) return { tk: '—', val: '—', d: '—', up: true, spark: [] };
      const dec = m.symbol === 'EURUSD=X' ? 4 : m.symbol === '^FCHI' ? 0 : 2;
      const up = (m.change ?? 0) >= 0;
      return {
        tk:    m.display,
        val:   fmtPrice(m.price, dec),
        d:     fmtChange(m.change),
        up,
        spark: m.sparkline ?? [],
      };
    });
    liveMarches = rows;
    // KPI CAC 40
    const cac = bySymbol.get('^FCHI');
    if (cac?.price != null) {
      liveKpiCac = fmtPrice(cac.price, 0);
      const sign = (cac.change ?? 0) >= 0 ? '+' : '';
      liveKpiCacSub = `${sign}${(cac.change ?? 0).toFixed(2)}% · ${(cac.change ?? 0) >= 0 ? '▲' : '▼'}`;
    }
    refresh();
  }).catch(() => { /* pas de fetch = affichage statique */ });

  // Mix énergétique RTE via ODRE (public, sans auth)
  fetchRteMix().then(mix => {
    if (destroyed) return;
    liveMix = mix;
    refresh();
  }).catch(() => { /* fallback statique */ });

  return () => {
    destroyed = true;
    host.innerHTML = '';
  };
}
