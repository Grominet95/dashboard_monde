/* atlas.ts — V1 ATLAS : port TS du proto v1_atlas.jsx */

import { sparkline, type JarvisViewData, threatColor, threatLabel, fmtUtc, geoRegion } from './_shared.js';

const STYLE_ID = 'jarvis-atlas-styles';

// ─── Static data ─────────────────────────────────────────────────────
// LAYERS: structure statique — activation pilote les couches MapLibre à venir
const LAYERS = [
  { id: 'hot',   name: 'Points chauds',      n: 9,   tone: 'red',    active: true },
  { id: 'conf',  name: 'Zones de conflit',   n: 5,   tone: 'red',    active: true },
  { id: 'base',  name: 'Bases militaires',   n: 412, tone: 'accent', active: true },
  { id: 'nuke',  name: 'Sites nucléaires',   n: 38,  tone: 'gold',   active: true },
  { id: 'sanct', name: 'Sanctions',          n: 27,  tone: 'neutral',active: false },
  { id: 'econ',  name: 'Tensions éco.',      n: 14,  tone: 'neutral',active: false },
  { id: 'weat',  name: 'Météo · alertes',    n: 6,   tone: 'neutral',active: false },
  { id: 'cab',   name: 'Câbles sous-marins', n: 482, tone: 'neutral',active: false },
];

// STATIC fallbacks utilisés quand allNews est vide au mount
const BRIEFINGS_STATIC = [
  { lvl: 'HAUTE',  lkind: 'red',    time: '—',
    title: 'Chargement des briefings…',
    body: 'Les données géopolitiques en temps réel se chargent.' },
];

const TICKER_STATIC = [
  { src: 'JARVIS', srcColor: 'var(--accent)', text: 'Chargement du flux d\'actualités…' },
];

// ─── Styles ──────────────────────────────────────────────────────────
function injectStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
.atlas-wrap {
  position:absolute; inset:0;
  background:var(--bg-0); color:var(--fg-0);
  font-family:var(--sans);
  display:flex; flex-direction:column;
  overflow:hidden;
}
.atlas-eyebrow { font-family:var(--mono);font-size:10px;letter-spacing:.18em;
  text-transform:uppercase;color:var(--fg-3); }
.atlas-jbtn { font-family:var(--mono);font-size:10px;letter-spacing:.12em;
  text-transform:uppercase;padding:6px 12px;border-radius:5px;cursor:pointer;
  background:transparent;border:1px solid var(--line-2);color:var(--fg-2);transition:.15s; }
.atlas-jbtn.active { background:var(--accent-soft);border-color:var(--accent-line);color:var(--accent); }
.atlas-jbtn:hover { border-color:var(--line-3);color:var(--fg-0); }

.atlas-band { padding:18px 22px 14px;border-bottom:1px solid var(--line-1);
  display:flex;align-items:center;gap:22px;flex-shrink:0; }
.atlas-band-num { font-family:var(--mono);font-size:11px;letter-spacing:.14em;
  color:var(--accent);font-weight:500; }
.atlas-band-subtitle { font-family:var(--serif);font-weight:300;font-size:22px;
  letter-spacing:-0.025em;color:var(--fg-0); }
.atlas-band-line { width:28px;height:1px;background:var(--accent);
  box-shadow:0 0 8px var(--accent);align-self:center; }

.atlas-grid { flex:1;display:grid;grid-template-columns:260px 1fr 320px;min-height:0; }

/* LAYERS */
.atlas-layers { border-right:1px solid var(--line-1);padding:22px;
  display:flex;flex-direction:column;gap:14px;background:rgba(10,14,22,0.5);overflow:hidden; }
.atlas-filter-wrap { position:relative; }
.atlas-filter-input { width:100%;background:var(--bg-2);border:1px solid var(--line-2);
  border-radius:6px;padding:8px 10px 8px 28px;color:var(--fg-0);
  font-family:var(--mono);font-size:10.5px;letter-spacing:.04em;outline:none; }
.atlas-filter-icon { position:absolute;left:10px;top:50%;transform:translateY(-50%);
  color:var(--fg-4);font-family:var(--mono);font-size:11px;pointer-events:none; }
.atlas-layer-item { display:flex;align-items:center;gap:10px;padding:9px 10px;
  border-radius:6px;cursor:pointer;transition:.15s; }
.atlas-layer-check { width:14px;height:14px;border-radius:3px;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;font-size:9px;font-family:var(--mono); }
.atlas-layer-n { font-family:var(--mono);font-size:9.5px;letter-spacing:.08em;
  font-variant-numeric:tabular-nums; }
.atlas-legend-card { margin-top:auto;padding:12px;border-radius:8px;
  border:1px solid var(--line-1);background:var(--bg-2);display:flex;flex-direction:column;gap:8px; }
.atlas-legend-row { display:inline-flex;align-items:center;gap:8px;font-size:11.5px;color:var(--fg-1); }

/* MAP */
.atlas-map-zone { position:relative;overflow:hidden;background:var(--bg-0); }
.atlas-map-ph { position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  font-family:var(--mono);font-size:11px;letter-spacing:.14em;color:var(--fg-3); }
.atlas-chip { font-family:var(--mono);font-size:10px;letter-spacing:.14em;
  padding:5px 8px;background:rgba(6,8,13,0.62);border:1px solid var(--line-2);
  border-radius:4px;backdrop-filter:blur(8px);color:var(--fg-2); }
.atlas-chip.accent { color:var(--accent);background:var(--accent-soft);border-color:var(--accent-line); }
.atlas-zoom-btn { width:30px;height:30px;border-radius:6px;
  background:rgba(6,8,13,0.62);border:1px solid var(--line-2);color:var(--fg-1);
  font-family:var(--mono);font-size:13px;cursor:pointer;backdrop-filter:blur(8px);
  display:flex;align-items:center;justify-content:center; }
.atlas-legend-bar { position:absolute;bottom:14px;left:14px;right:14px;z-index:2;
  display:flex;align-items:center;gap:16px;
  background:rgba(6,8,13,0.72);border:1px solid var(--line-2);border-radius:8px;
  padding:8px 14px;backdrop-filter:blur(12px) saturate(140%);
  font-family:var(--mono);font-size:10px;letter-spacing:.12em;color:var(--fg-2); }

/* INSIGHTS */
.atlas-insights { border-left:1px solid var(--line-1);overflow:hidden;
  display:flex;flex-direction:column;background:rgba(10,14,22,0.5); }
.atlas-insights-head { padding:22px 22px 16px;border-bottom:1px solid var(--line-1);
  display:flex;flex-direction:column;gap:10px; }
.atlas-summary-card { padding:16px;border-radius:10px;border:1px solid var(--line-2);
  background:var(--bg-2);display:flex;flex-direction:column;gap:8px; }
.atlas-summary-text { font-family:var(--serif);font-weight:300;font-size:17px;
  letter-spacing:-0.02em;color:var(--fg-0);line-height:1.3; }
.atlas-badge { font-family:var(--mono);font-size:9px;letter-spacing:.14em;
  text-transform:uppercase;padding:3px 8px;border-radius:3px; }
.atlas-tag { font-family:var(--mono);font-size:9px;letter-spacing:.14em;
  text-transform:uppercase;padding:3px 6px;border-radius:3px; }
.atlas-briefings { flex:1;overflow:hidden;padding:16px 22px;
  display:flex;flex-direction:column;gap:10px; }
.atlas-briefing-card { padding:14px;border-radius:8px;border:1px solid var(--line-1);
  background:var(--bg-1);display:flex;flex-direction:column;gap:6px; }
.atlas-posture-card { padding:14px;border-radius:8px;border:1px solid var(--line-1);
  background:var(--bg-1);display:flex;flex-direction:column;gap:8px;margin-top:auto; }
.atlas-defcon { font-family:var(--serif);font-weight:300;font-size:30px;
  letter-spacing:-0.03em;color:var(--gold); }

/* Ticker */
.atlas-ticker { height:38px;border-top:1px solid var(--line-1);flex-shrink:0;
  background:rgba(6,8,13,0.72);backdrop-filter:blur(20px) saturate(140%);
  display:flex;align-items:center;padding:0 18px;gap:22px;overflow:hidden;
  font-family:var(--mono);font-size:10.5px;letter-spacing:.10em;color:var(--fg-2); }
`;
  document.head.appendChild(s);
}

// ─── Helpers ─────────────────────────────────────────────────────────
function badgeStyle(kind: string): string {
  if (kind === 'red')
    return 'background:rgba(229,72,77,.18);border:1px solid rgba(229,72,77,.45);color:var(--red)';
  if (kind === 'gold')
    return 'background:rgba(184,150,62,.14);border:1px solid rgba(184,150,62,.40);color:var(--gold)';
  if (kind === 'accent')
    return 'background:var(--accent-soft);border:1px solid var(--accent-line);color:var(--accent)';
  return 'background:rgba(220,232,255,.05);border:1px solid var(--line-2);color:var(--fg-2)';
}

function legendRow(dot: string, glow: boolean, shape: string, text: string): string {
  let icon: string;
  if (shape === 'tri') {
    icon = `<span style="width:0;height:0;border-left:4px solid transparent;border-right:4px solid transparent;border-bottom:7px solid ${dot}"></span>`;
  } else if (shape === 'hex') {
    icon = `<span style="width:8px;height:8px;background:${dot};clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)"></span>`;
  } else if (shape === 'wash') {
    icon = `<span style="width:12px;height:6px;background:${dot}66;border:1px solid ${dot};border-radius:2px"></span>`;
  } else {
    icon = `<span style="width:6px;height:6px;border-radius:50%;background:${dot};box-shadow:${glow?`0 0 6px ${dot}`:'none'}"></span>`;
  }
  return `<span class="atlas-legend-row">${icon}<span>${text}</span></span>`;
}

function layerItemHtml(l: typeof LAYERS[0]): string {
  return `<div class="atlas-layer-item" data-lid="${l.id}"
      style="background:${l.active?'var(--accent-soft)':'transparent'};
        border:1px solid ${l.active?'var(--accent-line)':'transparent'}">
      <div class="atlas-layer-check"
        style="background:${l.active?'var(--accent)':'transparent'};
          border:1px solid ${l.active?'var(--accent)':'var(--line-3)'};color:#06080D">
        ${l.active?'✓':''}
      </div>
      <span class="atlas-layer-n" style="flex:1;font-size:12.5px;
        color:${l.active?'var(--fg-0)':'var(--fg-2)'}">
        ${l.name}
      </span>
      <span class="atlas-layer-n" style="color:${l.active?'var(--fg-1)':'var(--fg-3)'}">${l.n}</span>
    </div>`;
}

function applyLayerItemStyles(el: HTMLElement, active: boolean): void {
  el.style.background = active ? 'var(--accent-soft)' : 'transparent';
  el.style.borderColor = active ? 'var(--accent-line)' : 'transparent';
  const check = el.querySelector<HTMLElement>('.atlas-layer-check');
  if (check) {
    check.style.background = active ? 'var(--accent)' : 'transparent';
    check.style.borderColor = active ? 'var(--accent)' : 'var(--line-3)';
    check.textContent = active ? '✓' : '';
  }
  const spans = el.querySelectorAll<HTMLElement>('.atlas-layer-n');
  if (spans[0]) spans[0].style.color = active ? 'var(--fg-0)' : 'var(--fg-2)';
  if (spans[1]) spans[1].style.color = active ? 'var(--fg-1)' : 'var(--fg-3)';
}

// ─── Export ──────────────────────────────────────────────────────────
export function renderAtlas(host: HTMLElement, mapEl?: HTMLElement, data?: JarvisViewData): () => void {
  injectStyles();

  const layersState = LAYERS.map(l => ({ ...l }));

  // ─── Briefings depuis allNews (alertes haute/élevée, triées par date) ──
  const alertNews = (data?.news ?? [])
    .filter(n => n.isAlert || n.threat?.level === 'critical' || n.threat?.level === 'high')
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
    .slice(0, 3);

  const briefings = alertNews.length > 0
    ? alertNews.map(n => ({
        lvl:   threatLabel(n),
        lkind: threatColor(n),
        time:  fmtUtc(n.pubDate),
        title: n.title,
        body:  n.snippet ?? geoRegion(n),
      }))
    : BRIEFINGS_STATIC;

  const briefingCards = briefings.map(b =>
    `<div class="atlas-briefing-card">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <span class="atlas-badge" style="${badgeStyle(b.lkind)}">${b.lvl}</span>
        <span style="font-family:var(--mono);font-size:9.5px;letter-spacing:.08em;color:var(--fg-3)">${b.time}</span>
      </div>
      <span style="font-size:13px;font-weight:500;color:var(--fg-0);letter-spacing:-0.01em">${b.title}</span>
      <span style="font-size:11.5px;color:var(--fg-2);line-height:1.45">${b.body}</span>
    </div>`
  ).join('');

  // ─── Ticker depuis les 5 dernières actus ─────────────────────────────
  const tickerNews = (data?.news ?? [])
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
    .slice(0, 5);

  const tickerItems = tickerNews.length > 0
    ? tickerNews.map(n => ({
        src:      n.source.toUpperCase().slice(0, 12),
        srcColor: threatColor(n) === 'red' ? 'var(--red)' : 'var(--fg-0)',
        text:     n.title,
      }))
    : TICKER_STATIC;

  const tickerHtml = tickerItems.map((t, i) =>
    `${i>0?'<span style="color:var(--fg-4)">·</span>':''}
     <span><b style="color:${t.srcColor}">${t.src}</b> · ${t.text}</span>`
  ).join('');

  host.innerHTML = `
    <div class="atlas-wrap">

      <div class="atlas-band">
        <span class="atlas-band-num">07</span>
        <div style="display:flex;flex-direction:column;gap:4px">
          <span class="atlas-eyebrow">SITUATION MONDIALE · 9 POINTS CHAUDS · 5 CONFLITS</span>
          <div style="display:flex;align-items:baseline;gap:14px">
            <span class="atlas-band-subtitle">Ce qui bouge dans le monde aujourd'hui</span>
            <span class="atlas-band-line"></span>
          </div>
        </div>
        <div style="flex:1"></div>
        <div style="display:flex;gap:8px">
          <button class="atlas-jbtn active">MONDIAL</button>
          <button class="atlas-jbtn">EUROPE</button>
          <button class="atlas-jbtn">MOY-OR.</button>
          <button class="atlas-jbtn">ASIE</button>
          <button class="atlas-jbtn">AMÉR.</button>
          <span style="width:1px;background:var(--line-2);margin:0 4px;align-self:stretch"></span>
          <button class="atlas-jbtn">24H</button>
          <button class="atlas-jbtn active">7J</button>
          <button class="atlas-jbtn">30J</button>
        </div>
      </div>

      <div class="atlas-grid">

        <!-- LAYERS -->
        <div class="atlas-layers">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <span class="atlas-eyebrow">COUCHES · 8</span>
            <span style="font-family:var(--mono);font-size:10px;color:var(--accent);letter-spacing:.10em;cursor:pointer">+ AJOUTER</span>
          </div>
          <div class="atlas-filter-wrap">
            <input class="atlas-filter-input" placeholder="filtrer · couches" />
            <span class="atlas-filter-icon">›</span>
          </div>
          <div id="atlas-layer-list" style="display:flex;flex-direction:column;gap:2px">
            ${layersState.map(layerItemHtml).join('')}
          </div>
          <div class="atlas-legend-card">
            <span class="atlas-eyebrow">LÉGENDE</span>
            <div style="display:flex;flex-direction:column;gap:6px">
              ${legendRow('var(--red)',             true,  'dot', 'Haute alerte · 9')}
              ${legendRow('var(--gold)',            false, 'dot', 'Élevé · 14')}
              ${legendRow('rgba(220,232,255,.5)',   false, 'dot', 'Surveillance · 23')}
              ${legendRow('var(--accent)',          false, 'tri', 'Base militaire · 412')}
              ${legendRow('var(--gold)',            false, 'hex', 'Nucléaire · 38')}
            </div>
          </div>
        </div>

        <!-- MAP -->
        <div class="atlas-map-zone">
          ${mapEl ? '' : '<div class="atlas-map-ph">CARTE · MAPLIBRE GL</div>'}
          <div style="position:absolute;top:14px;left:14px;display:flex;gap:8px;z-index:2">
            <span class="atlas-chip">LAT 20.000 · LON 0.000 · Z 1.0</span>
            <span class="atlas-chip accent">PROJ · EQUIRECT</span>
          </div>
          <div style="position:absolute;top:14px;right:14px;z-index:2;
            display:flex;gap:0;background:rgba(6,8,13,0.62);border:1px solid var(--line-2);
            border-radius:6px;padding:4px;backdrop-filter:blur(8px)">
            <button style="padding:5px 10px;border-radius:4px;cursor:pointer;font-family:var(--mono);
              font-size:10px;letter-spacing:.14em;text-transform:uppercase;font-weight:500;
              background:var(--accent-soft);border:1px solid var(--accent-line);color:var(--accent)">2D</button>
            <button style="padding:5px 10px;border-radius:4px;cursor:pointer;font-family:var(--mono);
              font-size:10px;letter-spacing:.14em;text-transform:uppercase;font-weight:500;
              background:transparent;border:1px solid transparent;color:var(--fg-2)">3D</button>
          </div>
          <div style="position:absolute;top:70px;right:14px;z-index:2;display:flex;flex-direction:column;gap:4px">
            ${['+','−','⌖','◷'].map(c => `<button class="atlas-zoom-btn">${c}</button>`).join('')}
          </div>
          <div class="atlas-legend-bar">
            <span style="color:var(--fg-3);letter-spacing:.18em">LÉGENDE</span>
            ${legendRow('var(--red)',           true,  'dot',  'HAUTE · 9')}
            ${legendRow('var(--gold)',          false, 'dot',  'ÉLEVÉ · 14')}
            ${legendRow('rgba(220,232,255,.5)', false, 'dot',  'SURV · 23')}
            ${legendRow('var(--red)',           false, 'wash', 'ZONE CONFLIT · 5')}
            ${legendRow('var(--accent)',        false, 'tri',  'BASE · 412')}
            ${legendRow('var(--gold)',          false, 'hex',  'NUCLÉAIRE · 38')}
            <span style="flex:1"></span>
            <span style="color:var(--green)">● WEBGL</span>
            <span style="color:var(--fg-3)">OpenFreeMap · OSM</span>
          </div>
        </div>

        <!-- INSIGHTS -->
        <div class="atlas-insights">
          <div class="atlas-insights-head">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <span class="atlas-eyebrow">INSIGHTS · JARVIS</span>
              <span class="atlas-badge" style="${badgeStyle('accent')}">● IA · LIVE</span>
            </div>
            <div class="atlas-summary-card">
              <span class="atlas-eyebrow">SYNTHÈSE · 7J</span>
              <span class="atlas-summary-text">Escalade régionale Iran-Israël dominante.
                Pression continue sur Kharkiv. Activité PRC autour de Taïwan en hausse modérée.</span>
              <div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap">
                <span class="atlas-tag" style="color:var(--red);background:var(--red-soft);border:1px solid rgba(229,72,77,.32)">+34% MENACES</span>
                <span class="atlas-tag" style="color:var(--gold);background:var(--gold-soft);border:1px solid rgba(184,150,62,.32)">2 NOUVEAUX ACTEURS</span>
                <span class="atlas-tag" style="color:var(--fg-2);background:transparent;border:1px solid var(--line-2)">SOURCES · 41</span>
              </div>
            </div>
          </div>
          <div class="atlas-briefings">
            <span class="atlas-eyebrow">BRIEFINGS · 3</span>
            ${briefingCards}
            <div class="atlas-posture-card">
              <span class="atlas-eyebrow">POSTURE STRATÉGIQUE</span>
              <div style="display:flex;align-items:baseline;gap:8px">
                <span class="atlas-defcon">DEFCON 3</span>
                <span style="font-family:var(--mono);font-size:10px;letter-spacing:.08em;color:var(--fg-3)">· élevé</span>
              </div>
              ${sparkline([2,2,3,3,2,3,3,3,4,3,3,3], 'var(--gold)', 260, 22, true)}
            </div>
          </div>
        </div>
      </div>

      <div class="atlas-ticker">
        <span class="atlas-badge" style="${badgeStyle('red')}">LIVE · ${(data?.news ?? []).length || '—'}</span>
        ${tickerHtml}
        <span style="margin-left:auto;color:var(--fg-3)">${alertNews.length} alertes · ${briefings.length} briefings</span>
      </div>
    </div>`;

  // ─── Plug real map into map zone ────────────────────────────────────
  let mapElParent: HTMLElement | null = null;
  let mapElNextSib: ChildNode | null = null;
  let mapElStyleCache = '';

  const mapZone = host.querySelector<HTMLElement>('.atlas-map-zone');
  if (mapEl && mapZone) {
    mapElParent = mapEl.parentElement;
    mapElNextSib = mapEl.nextSibling;
    mapElStyleCache = mapEl.style.cssText;
    // Force map to fill the zone (ResizeObserver inside MapContainer will auto-resize)
    mapEl.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
    mapZone.prepend(mapEl);
  }

  // ─── Layer toggles (direct DOM, no full re-render) ──────────────────
  host.querySelectorAll<HTMLElement>('[data-lid]').forEach(el => {
    el.addEventListener('click', () => {
      const layer = layersState.find(l => l.id === el.dataset.lid);
      if (!layer) return;
      layer.active = !layer.active;
      applyLayerItemStyles(el, layer.active);
    });
  });

  // ─── Cleanup ────────────────────────────────────────────────────────
  return () => {
    if (mapEl && mapElParent) {
      mapEl.style.cssText = mapElStyleCache;
      if (mapElNextSib) mapElParent.insertBefore(mapEl, mapElNextSib);
      else mapElParent.appendChild(mapEl);
    }
    host.innerHTML = '';
  };
}
