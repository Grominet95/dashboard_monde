/* router.ts — Shell de navigation Jarvis · Intel
 *
 * Port TS vanilla du composant React `ViewSwitcher` du proto.
 * Monté une fois au boot via `mountViewSwitcher({ host: document.body, onView })`.
 *
 * Hypothèses :
 *  - Le repo utilise du DOM API pur (pas de React).
 *  - Les tokens CSS Jarvis sont disponibles globalement (`--accent`, `--bg`, etc.).
 *  - Une instance MapLibre globale existe (ne pas la recréer entre les vues).
 */

// ────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────

export type ViewId = "atlas" | "pulse" | "tech" | "france";

export interface ViewMeta {
  id: ViewId;
  label: string;
  hint: string;
}

export const VIEWS: readonly ViewMeta[] = [
  { id: "atlas",  label: "Atlas",  hint: "Vue d'ensemble" },
  { id: "pulse",  label: "Pulse",  hint: "Timeline 24h" },
  { id: "tech",   label: "Tech",   hint: "État mondial tech" },
  { id: "france", label: "France", hint: "Vue nationale" },
] as const;

const VIEW_IDS = new Set<ViewId>(VIEWS.map((v) => v.id));

// ────────────────────────────────────────────────────────────────────
// URL state
// ────────────────────────────────────────────────────────────────────

export function currentView(): ViewId {
  try {
    const v = new URLSearchParams(window.location.search).get("view");
    if (v && VIEW_IDS.has(v as ViewId)) return v as ViewId;
  } catch {}
  return "atlas";
}

function writeView(v: ViewId): void {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set("view", v);
    window.history.pushState({ view: v }, "", url.toString());
  } catch {}
}

// ────────────────────────────────────────────────────────────────────
// Mount
// ────────────────────────────────────────────────────────────────────

export interface MountOptions {
  host: HTMLElement;
  onView: (v: ViewId) => void;
  accent?: string;
}

export interface ViewSwitcherHandle {
  setView: (v: ViewId) => void;
  current: () => ViewId;
  destroy: () => void;
}

export function mountViewSwitcher(opts: MountOptions): ViewSwitcherHandle {
  const accent = opts.accent ?? "var(--accent)";
  let view: ViewId = currentView();

  // ─── DOM ─────────────────────────────────────────────────────────
  const bar = document.createElement("nav");
  bar.setAttribute("role", "tablist");
  bar.setAttribute("aria-label", "Vues du dashboard");
  bar.className = "jarvis-view-switcher";
  bar.innerHTML = `
    <div class="vs-wordmark">
      <span class="vs-dot" style="background:${accent};box-shadow:0 0 10px ${accent}"></span>
      Jarvis · Intel
    </div>
    ${VIEWS.map((v) => `
      <button class="vs-tab" data-view="${v.id}" role="tab" title="${v.hint}">
        <span class="vs-active-dot" style="background:${accent};box-shadow:0 0 6px ${accent}"></span>
        <span class="vs-label">${v.label}</span>
      </button>
    `).join("")}
    <div class="vs-hint">1 · 2 · 3 · 4</div>
  `;

  // ─── Styles (scoped, injecté une seule fois) ────────────────────
  if (!document.getElementById("jarvis-view-switcher-styles")) {
    const style = document.createElement("style");
    style.id = "jarvis-view-switcher-styles";
    style.textContent = `
      .jarvis-view-switcher {
        position: fixed; top: 18px; left: 50%; transform: translateX(-50%);
        z-index: 10001; display: flex; align-items: center; gap: 2px; padding: 4px;
        background: rgba(11,15,23,0.78); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
        border: 1px solid rgba(255,255,255,0.08); border-radius: 999px;
        box-shadow: 0 1px 0 rgba(255,255,255,0.06) inset, 0 24px 60px rgba(0,0,0,0.45), 0 4px 18px rgba(0,0,0,0.35);
        font-family: var(--font-body, "DM Sans", system-ui, sans-serif);
        font-feature-settings: "ss01" 1, "cv11" 1;
      }
      .jarvis-view-switcher .vs-wordmark {
        padding: 0 14px 0 12px; margin-right: 4px;
        font-size: 11px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase;
        color: rgba(255,255,255,0.46); border-right: 1px solid rgba(255,255,255,0.08);
        height: 28px; display: flex; align-items: center; gap: 8px;
      }
      .jarvis-view-switcher .vs-dot { width: 6px; height: 6px; border-radius: 999px; display: inline-block; }
      .jarvis-view-switcher .vs-tab {
        position: relative; padding: 6px 16px; height: 28px; min-width: 76px;
        display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        font: inherit; font-size: 12.5px; font-weight: 500; letter-spacing: 0.02em;
        color: rgba(255,255,255,0.62); background: transparent;
        border: 1px solid transparent; border-radius: 999px; cursor: pointer;
        transition: color .15s ease, background .15s ease, border-color .15s ease;
      }
      .jarvis-view-switcher .vs-tab:hover { color: rgba(255,255,255,0.88); }
      .jarvis-view-switcher .vs-tab[aria-selected="true"] {
        font-weight: 600; color: rgba(255,255,255,0.98);
        background: linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04));
        border-color: rgba(255,255,255,0.12);
      }
      .jarvis-view-switcher .vs-active-dot {
        width: 4px; height: 4px; border-radius: 999px; display: none;
      }
      .jarvis-view-switcher .vs-tab[aria-selected="true"] .vs-active-dot { display: inline-block; }
      .jarvis-view-switcher .vs-hint {
        padding: 0 12px 0 14px; margin-left: 4px;
        font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase;
        color: rgba(255,255,255,0.30); border-left: 1px solid rgba(255,255,255,0.08);
        height: 28px; display: flex; align-items: center;
      }
    `;
    document.head.appendChild(style);
  }

  opts.host.appendChild(bar);

  // ─── State sync ──────────────────────────────────────────────────
  const setView = (v: ViewId, push = true): void => {
    if (!VIEW_IDS.has(v)) return;
    view = v;
    bar.querySelectorAll<HTMLButtonElement>(".vs-tab").forEach((btn) => {
      btn.setAttribute("aria-selected", btn.dataset.view === v ? "true" : "false");
    });
    if (push) writeView(v);
    opts.onView(v);
  };

  // Sélection initiale
  bar.querySelectorAll<HTMLButtonElement>(".vs-tab").forEach((btn) => {
    btn.setAttribute("aria-selected", btn.dataset.view === view ? "true" : "false");
  });

  // ─── Events ──────────────────────────────────────────────────────
  const onClick = (e: Event): void => {
    const target = (e.target as HTMLElement).closest<HTMLButtonElement>(".vs-tab");
    if (!target) return;
    const v = target.dataset.view as ViewId | undefined;
    if (v) setView(v);
  };
  bar.addEventListener("click", onClick);

  const onPop = (): void => setView(currentView(), false);
  window.addEventListener("popstate", onPop);

  const onKey = (e: KeyboardEvent): void => {
    const tag = (e.target as HTMLElement | null)?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;
    const idx = "1234".indexOf(e.key);
    if (idx >= 0) setView(VIEWS[idx]!.id);
  };
  window.addEventListener("keydown", onKey);

  // ─── Handle ──────────────────────────────────────────────────────
  return {
    setView: (v) => setView(v),
    current: () => view,
    destroy: () => {
      bar.removeEventListener("click", onClick);
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("keydown", onKey);
      bar.remove();
    },
  };
}
