/* pulse.ts — V4 PULSE : port TS du proto v4_pulse.jsx */

import { sparkline, colorFor, type JarvisViewData, threatColor, geoRegion, fmtUtc, isWithinHours } from './_shared.js';

const STYLE_ID = 'jarvis-pulse-styles';

// ─── Types ───────────────────────────────────────────────────────────
type TlEvent = { t: number; h: string; reg: string; lvl: string; title: string; body: string };

// ─── Data ────────────────────────────────────────────────────────────
// STATIC fallback utilisé quand allNews est vide au mount
const TIMELINE_STATIC: TlEvent[] = [
  { t: 0,    h: '—',     reg: 'MONDE',   lvl: 'neutral', title: 'Chargement du flux…', body: 'Les données se chargent.' },
  { t: 1.00, h: 'MAINT.', reg: 'JARVIS', lvl: 'accent',  title: 'Pulse · en attente', body: 'Les événements apparaîtront ici.' },
];

const REGIONS = [
  { name: 'MOY-ORIENT',  evt: 28, hot: 5, lvl: 'red',    spark: [10,12,14,18,22,28,32,38,42,48] },
  { name: 'EUROPE EST',  evt: 22, hot: 3, lvl: 'gold',   spark: [20,21,22,23,24,24,25,26,27,28] },
  { name: 'ASIE EST',    evt: 14, hot: 2, lvl: 'accent',  spark: [12,13,13,14,14,15,15,16,16,17] },
  { name: 'AFRIQUE',     evt: 11, hot: 2, lvl: 'gold',   spark: [8,9,9,10,11,11,12,13,13,14] },
  { name: 'AMÉRIQUES',   evt: 5,  hot: 0, lvl: 'neutral', spark: [4,4,5,4,5,5,4,5,4,5] },
  { name: 'OCÉANIE',     evt: 2,  hot: 0, lvl: 'neutral', spark: [1,1,1,2,1,2,1,2,1,1] },
];

const FEEDS: [string, string | null, string][] = [
  ['TÉHÉRAN','red','cam'],['NATANZ','red','cam'],['TEL AVIV','red','cam'],['JÉRUSALEM','gold','cam'],
  ['KYIV','gold','cam'],['KHARKIV','gold','cam'],['TAIPEI','accent','cam'],['DMZ','accent','cam'],
  ['BLOOMBERG','red','tv'],['AL JAZIRA','gold','tv'],['REUTERS','red','tv'],['FRANCE 24','gold','tv'],
  ['AP LIVE','red','tv'],['SKYNEWS',null,'tv'],['CNN',null,'tv'],['CCTV',null,'tv'],
];

// ─── Styles ──────────────────────────────────────────────────────────
function injectStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
.pulse-wrap {
  position: absolute; inset: 0;
  background: var(--bg-0); color: var(--fg-0);
  font-family: var(--sans);
  display: flex; flex-direction: column;
  overflow: hidden;
}
.pulse-scroll { flex: 1; overflow-y: auto; padding: 56px 26px 32px; }
.pulse-header { display:flex; align-items:flex-end; gap:22px; margin-bottom:26px; }
.pulse-header-num { font-family:var(--mono); font-size:11px; letter-spacing:.14em;
  color:var(--accent); font-weight:500; padding-bottom:6px; }
.pulse-header-eyebrow { font-family:var(--mono); font-size:10px; letter-spacing:.18em;
  text-transform:uppercase; color:var(--fg-3); }
.pulse-header-title { font-family:var(--serif); font-weight:300; font-size:28px;
  letter-spacing:-0.025em; color:var(--fg-0); }
.pulse-header-accent-line { width:32px; height:1px; background:var(--accent);
  box-shadow:0 0 8px var(--accent); align-self:center; }
.pulse-header-filters { display:flex; gap:8px; margin-left:auto; }
.pulse-jbtn { font-family:var(--mono); font-size:10.5px; letter-spacing:.12em;
  text-transform:uppercase; padding:7px 14px; border-radius:6px; cursor:pointer;
  background:var(--bg-1); border:1px solid var(--line-2); color:var(--fg-2);
  transition:.15s; }
.pulse-jbtn.active { background:var(--accent-soft); border-color:var(--accent-line); color:var(--accent); }
.pulse-sep { width:1px; background:var(--line-2); align-self:stretch; }

/* Timeline card */
.pulse-tl-card { background:var(--bg-1); border:1px solid var(--line-1);
  border-radius:14px; padding:26px 26px 20px; margin-bottom:26px; }
.pulse-tl-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
.pulse-tl-eyebrow { font-family:var(--mono); font-size:9.5px; letter-spacing:.18em;
  text-transform:uppercase; color:var(--fg-3); }
.pulse-tl-legend { display:flex; gap:16px; font-family:var(--mono); font-size:10px;
  letter-spacing:.10em; color:var(--fg-2); }
.pulse-tl-axis { position:relative; height:120px; }
.pulse-tl-grid { position:absolute; inset:0; display:flex; }
.pulse-tl-grid-col { flex:1; border-left:1px dashed var(--line-1); }
.pulse-tl-grid-col:first-child { border-left:none; }
.pulse-tl-baseline { position:absolute; left:0; right:0; bottom:28px; height:1px; background:var(--line-2); }
.pulse-tl-now { position:absolute; right:-1px; top:0; bottom:28px; width:2px;
  background:var(--accent); box-shadow:0 0 8px var(--accent); }
.pulse-tl-labels { position:absolute; left:0; right:0; bottom:0; display:flex;
  font-family:var(--mono); font-size:9.5px; letter-spacing:.10em; color:var(--fg-3); }
.pulse-tl-lbl { flex:1; }

/* Events + side */
.pulse-main { display:grid; grid-template-columns:1.5fr 1fr; gap:20px; margin-bottom:26px; }
.pulse-events-card { background:var(--bg-1); border:1px solid var(--line-1);
  border-radius:14px; padding:26px; display:flex; flex-direction:column; }
.pulse-events-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
.pulse-events-row { display:grid; grid-template-columns:16px 56px 90px 1fr auto;
  gap:12px; padding:12px 0; border-top:1px solid var(--line-1); align-items:center; }
.pulse-events-row:first-child { border-top:none; }
.pulse-ev-dot { width:8px; height:8px; border-radius:50%; justify-self:center; }
.pulse-ev-time { font-family:var(--mono); font-size:10.5px; letter-spacing:.06em;
  color:var(--fg-2); font-variant-numeric:tabular-nums; }
.pulse-ev-reg { font-family:var(--mono); font-size:9.5px; letter-spacing:.14em;
  text-transform:uppercase; }
.pulse-ev-body { display:flex; flex-direction:column; gap:2px; }
.pulse-ev-title { font-size:13px; color:var(--fg-0); font-weight:500; }
.pulse-ev-desc { font-size:11.5px; color:var(--fg-2); }
.pulse-ev-voir { font-family:var(--mono); font-size:11px; color:var(--fg-3);
  cursor:pointer; letter-spacing:.08em; }

/* Side panel */
.pulse-side { display:flex; flex-direction:column; gap:20px; }
.pulse-map-card, .pulse-defcon-card { background:var(--bg-1); border:1px solid var(--line-1);
  border-radius:14px; padding:26px; display:flex; flex-direction:column; gap:12px; }
.pulse-map-placeholder { height:230px; background:var(--bg-0); border-radius:10px;
  border:1px solid var(--line-1); display:flex; align-items:center; justify-content:center;
  font-family:var(--mono); font-size:9px; letter-spacing:.14em; color:var(--fg-3); }
.pulse-defcon-num { font-family:var(--serif); font-weight:300; font-size:36px;
  letter-spacing:-0.03em; color:var(--gold); }
.pulse-defcon-sub { font-family:var(--mono); font-size:10px; letter-spacing:.14em; color:var(--fg-3); }
.pulse-defcon-desc { font-size:12px; color:var(--fg-2); line-height:1.5; }

/* Feeds */
.pulse-feeds-card { background:var(--bg-1); border:1px solid var(--line-1);
  border-radius:14px; padding:26px; margin-bottom:26px; }
.pulse-feeds-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
.pulse-feeds-grid { display:grid; grid-template-columns:repeat(8,1fr); gap:8px; }
.pulse-feed-cell { aspect-ratio:16/10; border-radius:5px; border:1px solid var(--line-2);
  background:linear-gradient(135deg,var(--bg-2) 0%,var(--bg-3) 100%);
  position:relative; padding:6px; overflow:hidden;
  display:flex; flex-direction:column; justify-content:space-between; }
.pulse-feed-scanlines { position:absolute; inset:0; opacity:.12;
  background-image:repeating-linear-gradient(0deg,var(--fg-1) 0 1px,transparent 1px 3px); }
.pulse-feed-top { display:flex; justify-content:space-between; align-items:center; position:relative; }
.pulse-feed-live { font-family:var(--mono); font-size:7.5px; letter-spacing:.14em; }
.pulse-feed-type { font-family:var(--mono); font-size:7px; color:var(--fg-3); letter-spacing:.10em; }
.pulse-feed-name { font-family:var(--mono); font-size:8px; letter-spacing:.10em;
  color:var(--fg-1); position:relative; }

/* Regions */
.pulse-regions { display:grid; grid-template-columns:repeat(6,1fr); gap:12px; }
.pulse-region-card { background:var(--bg-1); border:1px solid var(--line-1);
  border-radius:12px; padding:16px; display:flex; flex-direction:column; gap:10px; }
.pulse-region-name { font-family:var(--mono); font-size:10px; letter-spacing:.16em;
  text-transform:uppercase; color:var(--fg-3); }
.pulse-region-num { font-family:var(--serif); font-weight:300; font-size:26px;
  letter-spacing:-0.03em; color:var(--fg-0); font-variant-numeric:tabular-nums; }
.pulse-region-num span { font-family:var(--mono); font-size:10px; color:var(--fg-3);
  letter-spacing:.08em; margin-left:4px; }
.pulse-region-foot { display:flex; justify-content:space-between;
  font-family:var(--mono); font-size:9.5px; letter-spacing:.12em; color:var(--fg-3); }
`;
  document.head.appendChild(s);
}

// ─── Builders ────────────────────────────────────────────────────────
function tlAxis(events: TlEvent[]): string {
  const hours = ['00:00','03:00','06:00','09:00','12:00','15:00','18:00','21:00','MAINT.'];
  const dots = events.map((e) => {
    const c = colorFor(e.lvl);
    const left = `${e.t * 100}%`;
    const high = e.lvl === 'red' ? 90 : e.lvl === 'gold' ? 65 : e.lvl === 'accent' ? 50 : 35;
    const glow = (e.lvl === 'red' || e.lvl === 'accent') ? `box-shadow:0 0 8px ${c}` : '';
    return `
      <div style="position:absolute;left:${left};bottom:28px;height:${high}px;width:1px;background:${c};opacity:.6"></div>
      <div style="position:absolute;left:${left};bottom:${28 + high - 4}px;transform:translateX(-50%);
        width:8px;height:8px;border-radius:50%;background:${c};${glow}"></div>`;
  }).join('');
  const gridCols = Array.from({length: 9}, () =>
    `<div class="pulse-tl-grid-col"></div>`).join('');
  const lbls = hours.map((h, i) =>
    `<div class="pulse-tl-lbl" style="text-align:${i===0?'left':i===8?'right':'center'};
      color:${i===8?'var(--accent)':'var(--fg-3)'}">${h}</div>`).join('');
  return `
    <div class="pulse-tl-axis">
      <div class="pulse-tl-grid">${gridCols}</div>
      <div class="pulse-tl-baseline"></div>
      <div class="pulse-tl-now"></div>
      ${dots}
      <div class="pulse-tl-labels">${lbls}</div>
    </div>`;
}

function eventsRows(events: TlEvent[]): string {
  if (!events.length) return `<div class="pulse-events-row" style="color:var(--fg-3);border-top:none">Chargement des événements…</div>`;
  return [...events].reverse().map((e, i) => {
    const c = colorFor(e.lvl);
    const glow = (e.lvl === 'red' || e.lvl === 'accent') ? `box-shadow:0 0 6px ${c}` : '';
    const timeColor = e.t >= 0.99 ? 'var(--accent)' : 'var(--fg-2)';
    return `<div class="pulse-events-row${i===0?' style="border-top:none"':''}">
      <span class="pulse-ev-dot" style="background:${c};${glow}"></span>
      <span class="pulse-ev-time" style="color:${timeColor}">${e.h}</span>
      <span class="pulse-ev-reg" style="color:${c}">${e.reg}</span>
      <div class="pulse-ev-body">
        <span class="pulse-ev-title">${e.title}</span>
        <span class="pulse-ev-desc">${e.body}</span>
      </div>
      <span class="pulse-ev-voir">VOIR ›</span>
    </div>`;
  }).join('');
}

function feedCell([name, lvl, kind]: [string, string | null, string]): string {
  const tc = lvl === 'red' ? 'var(--red)' : lvl === 'gold' ? 'var(--gold)' : lvl === 'accent' ? 'var(--accent)' : 'var(--fg-3)';
  return `<div class="pulse-feed-cell">
    <div class="pulse-feed-scanlines"></div>
    <div class="pulse-feed-top">
      <span class="pulse-feed-live" style="color:${tc}">● LIVE</span>
      <span class="pulse-feed-type">${kind === 'tv' ? 'TV' : 'CAM'}</span>
    </div>
    <span class="pulse-feed-name">${name}</span>
  </div>`;
}

function regionCard(r: typeof REGIONS[0]): string {
  const c = colorFor(r.lvl);
  return `<div class="pulse-region-card" style="border-left:2px solid ${c}">
    <span class="pulse-region-name">${r.name}</span>
    <div class="pulse-region-num">${r.evt}<span>évts</span></div>
    ${sparkline(r.spark, c, 140, 20, true)}
    <div class="pulse-region-foot">
      <span>● ${r.hot} POINTS</span>
      <span>${r.lvl.toUpperCase()}</span>
    </div>
  </div>`;
}

// ─── Conversion allNews → TlEvent[] ──────────────────────────────────
function newsToTimeline(data: JarvisViewData | undefined): TlEvent[] {
  const items = (data?.news ?? [])
    .filter(n => isWithinHours(n.pubDate, 24) && (n.isAlert || (n.threat?.level && n.threat.level !== 'info')))
    .sort((a, b) => a.pubDate.getTime() - b.pubDate.getTime())
    .slice(-10); // max 10 événements
  if (!items.length) return TIMELINE_STATIC;
  return items.map((n, i, arr) => {
    const msAgo = Date.now() - n.pubDate.getTime();
    const hoursAgo = msAgo / 3_600_000;
    const t = Math.max(0, Math.min(0.99, 1 - hoursAgo / 24));
    const isLast = i === arr.length - 1;
    return {
      t,
      h: isLast ? 'MAINT.' : fmtUtc(n.pubDate),
      reg: geoRegion(n),
      lvl: threatColor(n) === 'neutral' ? 'neutral' : threatColor(n),
      title: n.title,
      body: n.snippet ?? '',
    };
  });
}

// ─── Export ──────────────────────────────────────────────────────────
export function renderPulse(host: HTMLElement, data?: JarvisViewData): () => void {
  injectStyles();

  const timeline = newsToTimeline(data);
  const alertCount = timeline.filter(e => e.lvl === 'red').length;
  const highCount  = timeline.filter(e => e.lvl === 'gold').length;
  const survCount  = timeline.filter(e => e.lvl === 'neutral' || e.lvl === 'accent').length;
  host.innerHTML = `
    <div class="pulse-wrap">
      <div class="pulse-scroll">

        <!-- HEADER -->
        <div class="pulse-header">
          <span class="pulse-header-num">07</span>
          <div style="display:flex;flex-direction:column;gap:6px">
            <span class="pulse-header-eyebrow">PULSE · 12 MAI 2026 · 93 ÉVÉNEMENTS · 7J GLISSANT</span>
            <div style="display:flex;align-items:baseline;gap:14px">
              <span class="pulse-header-title">Le pouls du monde, heure par heure</span>
              <span class="pulse-header-accent-line"></span>
            </div>
          </div>
          <div class="pulse-header-filters">
            <button class="pulse-jbtn">1H</button>
            <button class="pulse-jbtn active">24H</button>
            <button class="pulse-jbtn">7J</button>
            <button class="pulse-jbtn">30J</button>
            <span class="pulse-sep"></span>
            <button class="pulse-jbtn">◀</button>
            <button class="pulse-jbtn active">⏵ LIVE</button>
            <button class="pulse-jbtn">▶</button>
          </div>
        </div>

        <!-- TIMELINE -->
        <div class="pulse-tl-card">
          <div class="pulse-tl-head">
            <span class="pulse-tl-eyebrow">CHRONOLOGIE · 24H</span>
            <div class="pulse-tl-legend">
              <span><span style="color:var(--red)">●</span> HAUTE · ${alertCount}</span>
              <span><span style="color:var(--gold)">●</span> ÉLEVÉ · ${highCount}</span>
              <span><span style="color:var(--accent)">●</span> SURV. · ${survCount}</span>
            </div>
          </div>
          ${tlAxis(timeline)}
        </div>

        <!-- MAIN GRID -->
        <div class="pulse-main">
          <div class="pulse-events-card">
            <div class="pulse-events-head">
              <span class="pulse-tl-eyebrow">ÉVÉNEMENTS · ORDRE INVERSE</span>
              <div style="display:flex;gap:6px">
                <button class="pulse-jbtn active">TOUS</button>
                <button class="pulse-jbtn">HAUTE</button>
                <button class="pulse-jbtn">ÉLEVÉ</button>
                <button class="pulse-jbtn">SURV.</button>
              </div>
            </div>
            ${eventsRows(timeline)}
          </div>
          <div class="pulse-side">
            <div class="pulse-map-card">
              <div style="display:flex;align-items:center;justify-content:space-between">
                <span class="pulse-tl-eyebrow">CARTE · POINTS CHAUDS</span>
                <span style="font-family:var(--mono);font-size:9.5px;letter-spacing:.10em;color:var(--accent)">PLEIN ÉCRAN ›</span>
              </div>
              <div class="pulse-map-placeholder">CARTE · ATLAS</div>
            </div>
            <div class="pulse-defcon-card">
              <span class="pulse-tl-eyebrow">POSTURE STRATÉGIQUE · IA</span>
              <div style="display:flex;align-items:baseline;gap:10px">
                <span class="pulse-defcon-num">DEFCON 3</span>
                <span class="pulse-defcon-sub">· +1 EN 7J</span>
              </div>
              <span class="pulse-defcon-desc">Trois acteurs nucléaires impliqués simultanément.
                Seuil critique non atteint — surveillance active recommandée sur 72h.</span>
              ${sparkline([2,2,3,3,2,3,3,3,4,3,3,3], 'var(--gold)', 300, 26, true)}
            </div>
          </div>
        </div>

        <!-- FEEDS -->
        <div class="pulse-feeds-card">
          <div class="pulse-feeds-head">
            <span class="pulse-tl-eyebrow">FLUX LIVE · TV + WEBCAMS · 27 SOURCES</span>
            <div style="display:flex;gap:6px">
              <button class="pulse-jbtn active">TOUS</button>
              <button class="pulse-jbtn">TV</button>
              <button class="pulse-jbtn">WEBCAMS</button>
            </div>
          </div>
          <div class="pulse-feeds-grid">${FEEDS.map(feedCell).join('')}</div>
        </div>

        <!-- REGIONS -->
        <div class="pulse-regions">${REGIONS.map(regionCard).join('')}</div>
      </div>
    </div>`;

  return () => { host.innerHTML = ''; };
}
