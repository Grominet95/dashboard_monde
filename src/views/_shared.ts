/* _shared.ts — composants Jarvis portés JSX → TS DOM */

import type { NewsItem, MarketData } from '@/types';

export function sparkline(
  data: number[],
  color: string,
  w = 200,
  h = 24,
  fill = false,
): string {
  if (!data.length) return '';
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    h - ((v - min) / range) * (h - 2) - 1,
  ] as [number, number]);
  const ptsStr = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  let fillSvg = '';
  if (fill) {
    const f0 = pts[0]!, fl = pts[pts.length - 1]!;
    fillSvg = `<polygon points="${f0[0].toFixed(1)},${h} ${ptsStr} ${fl[0].toFixed(1)},${h}" fill="${color}" opacity=".16"/>`;
  }
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;overflow:visible">
    ${fillSvg}<polyline points="${ptsStr}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

export function colorFor(lvl: string): string {
  if (lvl === 'red')    return 'var(--red)';
  if (lvl === 'gold')   return 'var(--gold)';
  if (lvl === 'accent') return 'var(--accent)';
  if (lvl === 'green')  return 'var(--green)';
  return 'var(--fg-3)';
}

// ─── View data interface ──────────────────────────────────────────────
export interface JarvisViewData {
  news: NewsItem[];
  markets: MarketData[];
}

// ─── News helpers ────────────────────────────────────────────────────

const FR_SOURCES = new Set([
  'France 24', 'Le Monde', 'AFP', 'RFI', 'BFMTV', 'BFM TV', 'LCI',
  'France Info', 'France Télévisions', 'TV5 Monde', 'L\'Express',
  'Le Point', 'Libération', 'L\'Obs', 'Mediapart', '20 Minutes',
  'Le Figaro', 'Challenges', 'L\'Humanité', 'Les Échos', 'Le Parisien',
  'L\'Usine Nouvelle', 'Usine Nouvelle', 'Jeune Afrique', 'BBC Afrique',
  'Courrier International', 'Slate.fr', 'France 24 LatAm',
]);

export function isFrenchSource(n: NewsItem): boolean {
  return n.lang === 'fr' || FR_SOURCES.has(n.source);
}

const TECH_CATEGORIES = new Set<string>(['cyber', 'tech']);
const TECH_SOURCES = new Set([
  'Wired', 'TechCrunch', 'The Verge', 'MIT Technology Review',
  'Ars Technica', 'Bloomberg Technology', 'FT Tech', 'SCMP Tech',
  'Nikkei Asia', 'STAT News', 'Nature', 'Science',
  'Les Échos', 'L\'Usine Nouvelle', 'Usine Nouvelle',
]);

export function isTechNews(n: NewsItem): boolean {
  if (n.threat?.category && TECH_CATEGORIES.has(n.threat.category)) return true;
  if (TECH_SOURCES.has(n.source)) return true;
  const t = n.title.toLowerCase();
  return (
    t.includes('ia ') || t.includes(' ai ') || t.includes('quantum') ||
    t.includes('cyber') || t.includes('chip') || t.includes('fusion') ||
    t.includes('robot') || t.includes('satellite') || t.includes('spatial') ||
    t.includes('nucleaire') || t.includes('nucléaire') || t.includes('spatial')
  );
}

/** Format a Date to "HH:MM UTC" */
export function fmtUtc(d: Date): string {
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')} UTC`;
}

/** ms since epoch → true if within last N hours */
export function isWithinHours(d: Date, hours: number): boolean {
  return Date.now() - d.getTime() < hours * 3_600_000;
}

/** threat.level → color string key used in views */
export function threatColor(n: NewsItem): 'red' | 'gold' | 'neutral' | 'accent' {
  const lvl = n.threat?.level;
  if (lvl === 'critical') return 'red';
  if (lvl === 'high')     return 'gold';
  if (n.isAlert)          return 'gold';
  return 'neutral';
}

/** threat → badge label */
export function threatLabel(n: NewsItem): string {
  const lvl = n.threat?.level;
  if (lvl === 'critical') return 'HAUTE';
  if (lvl === 'high')     return 'ÉLEVÉE';
  return 'SURV.';
}

/** Guess a broad geo region from news title/location */
export function geoRegion(n: NewsItem): string {
  const t = (n.title + ' ' + (n.locationName ?? '')).toLowerCase();
  if (/iran|israel|irak|syrie|gaza|liban|yémen|golfe|riyad|téhéran|natanz/.test(t)) return 'MOY-OR.';
  if (/ukraine|russia|russie|otan|nato|kharkiv|belgorod|bruxelles|europe/.test(t)) return 'EUROPE';
  if (/chine|taiwan|corée|tokyo|séoul|beijing|asie|cctv|prc/.test(t)) return 'ASIE';
  if (/afrique|sahel|mali|niger|soudanais|nairobi/.test(t)) return 'AFRIQUE';
  if (/amériques|usa|washington|mexique|brésil|venezuela|latam/.test(t)) return 'AMÉR.';
  if (/brent|pétrole|gaz|marchés|futures|forex/.test(t)) return 'MARCHÉS';
  return 'MONDE';
}

/** Pick market entry by symbol from a MarketData array */
export function findMkt(markets: MarketData[], symbol: string): MarketData | undefined {
  return markets.find(m => m.symbol === symbol);
}

/** Format a price number for display */
export function fmtPrice(v: number | null, decimals = 2): string {
  if (v === null) return '—';
  return v.toLocaleString('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/** Format change % for display */
export function fmtChange(c: number | null): string {
  if (c === null) return '—';
  const sign = c >= 0 ? '+' : '';
  return `${sign}${c.toFixed(2)}%`;
}
