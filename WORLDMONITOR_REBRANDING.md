# Rebranding WorldMonitor → Jarvis Visual Identity

## Objectif
Remplacer intégralement le branding WorldMonitor par l'identité visuelle Jarvis.
Ne pas toucher à la logique, aux données, aux layers ou aux fonctionnalités.
Uniquement le CSS, les couleurs, les polices et les petits textes de branding.

---

## 1. Polices — remplacer les imports existants

Ajouter dans le `<head>` principal (ou le fichier CSS global) :

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
```

La police "Landasans" pour le brand name n'est pas disponible sur Google Fonts.
Utiliser Syne 800 en remplacement pour les titres forts.

Mapping des polices :
- Tout texte corps / labels → `font-family: 'DM Sans', sans-serif`
- Tout texte monospace, status, badges, timestamps, coordonnées → `font-family: 'DM Mono', monospace`
- Titres forts (headers de panels, DEFCON, scores) → `font-family: 'Syne', sans-serif; font-weight: 800`

---

## 2. Variables CSS — remplacer la palette complète

Trouver le fichier de variables CSS principal du projet (souvent `:root` dans `src/styles/` ou `src/index.css`).
Remplacer toutes les variables de couleur par :

```css
:root {
  /* === BACKGROUNDS === */
  --bg-primary:        #06080D;   /* Deep Navy — background principal */
  --bg-secondary:      #0A0E17;   /* légèrement plus clair */
  --bg-surface:        rgba(8, 12, 20, 0.85);  /* panneaux glassmorphism */
  --bg-surface-hover:  rgba(74, 158, 255, 0.06);

  /* === ACCENTS === */
  --accent-blue:       #4A9EFF;   /* Bright Blue — accent primaire */
  --accent-blue-mid:   #2D7DD2;   /* Medium Blue — accent secondaire */
  --accent-gold:       #B8963E;   /* Gold — alertes / premium */
  --accent-green:      #36D399;   /* Succès */
  --accent-red:        #ef4444;   /* Danger */

  /* === TEXTE === */
  --text-primary:      #DCE8FF;   /* Ice Blue */
  --text-secondary:    rgba(220, 232, 255, 0.55);
  --text-dim:          rgba(220, 232, 255, 0.25);
  --text-muted:        rgba(220, 232, 255, 0.12);

  /* === BORDERS === */
  --border-subtle:     rgba(74, 158, 255, 0.08);
  --border-default:    rgba(74, 158, 255, 0.15);
  --border-strong:     rgba(74, 158, 255, 0.30);

  /* === GLASSMORPHISM === */
  --glass-bg:          rgba(6, 8, 13, 0.80);
  --glass-blur:        blur(32px) saturate(180%);
  --glass-border:      1px solid rgba(74, 158, 255, 0.10);

  /* === SHADOWS === */
  --shadow-panel:      0 8px 32px rgba(0, 0, 0, 0.60);
  --shadow-modal:      0 20px 60px rgba(0, 0, 0, 0.75);
  --shadow-glow-blue:  0 0 12px rgba(74, 158, 255, 0.40);
  --shadow-glow-gold:  0 0 12px rgba(184, 150, 62, 0.40);

  /* === STATUS GLOW DOTS === */
  --glow-active:       #36D399;   /* vert — actif / en ligne */
  --glow-normal:       #4A9EFF;   /* bleu — normal */
  --glow-alert:        #B8963E;   /* or — alerte */
  --glow-danger:       #ef4444;   /* rouge — danger */
}
```

---

## 3. Background et body

```css
body, html {
  background-color: #06080D;
  color: #DCE8FF;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
}
```

---

## 4. Panneaux et cards — glassmorphism

Tout panneau, sidebar, card, modal doit avoir :

```css
.panel, .sidebar, .card, [class*="panel"], [class*="card"] {
  background: rgba(8, 12, 20, 0.85);
  backdrop-filter: blur(32px) saturate(180%);
  -webkit-backdrop-filter: blur(32px) saturate(180%);
  border: 1px solid rgba(74, 158, 255, 0.08);
  border-radius: 6px;
}
```

---

## 5. Scrollbar custom

```css
::-webkit-scrollbar {
  width: 3px;
  height: 3px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(74, 158, 255, 0.25);
  border-radius: 99px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(74, 158, 255, 0.45);
}
```

---

## 6. Film grain overlay — ajouter en fin de body

```html
<svg id="film-grain" style="
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9998;
  opacity: 0.025;
">
  <filter id='grain'>
    <feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/>
    <feColorMatrix type='saturate' values='0'/>
  </filter>
  <rect width='100%' height='100%' filter='url(#grain)'/>
</svg>
```

---

## 7. Vignette — ajouter en fin de body

```html
<div id="vignette" style="
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9997;
  background: radial-gradient(ellipse at center,
    transparent 50%,
    rgba(6, 8, 13, 0.55) 100%
  );
"></div>
```

---

## 8. Boutons

```css
button, .btn, [class*="button"] {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  background: transparent;
  border: 1px solid rgba(74, 158, 255, 0.25);
  color: #DCE8FF;
  border-radius: 4px;
  padding: 6px 14px;
  cursor: pointer;
  transition: all 150ms ease;
}

button:hover, .btn:hover {
  border-color: #4A9EFF;
  color: #4A9EFF;
  background: rgba(74, 158, 255, 0.06);
}

/* Bouton primaire */
button.primary, .btn-primary {
  background: rgba(74, 158, 255, 0.15);
  border-color: #4A9EFF;
  color: #4A9EFF;
}
```

---

## 9. Badges / Pills de statut

```css
.badge, .pill, [class*="badge"], [class*="status"] {
  font-family: 'DM Mono', monospace;
  font-size: 9px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  border-radius: 99px;
  padding: 2px 8px;
  border: 1px solid;
}

/* Variantes */
.badge-blue   { color: #4A9EFF; border-color: rgba(74,158,255,0.3); background: rgba(74,158,255,0.08); }
.badge-gold   { color: #B8963E; border-color: rgba(184,150,62,0.3); background: rgba(184,150,62,0.08); }
.badge-green  { color: #36D399; border-color: rgba(54,211,153,0.3); background: rgba(54,211,153,0.08); }
.badge-red    { color: #ef4444; border-color: rgba(239,68,68,0.3);  background: rgba(239,68,68,0.08);  }
```

---

## 10. Status dots (glow)

```css
.dot, .status-dot, [class*="indicator"] {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.dot-active  { background: #36D399; box-shadow: 0 0 8px rgba(54, 211, 153, 0.6); }
.dot-normal  { background: #4A9EFF; box-shadow: 0 0 8px rgba(74, 158, 255, 0.6); }
.dot-alert   { background: #B8963E; box-shadow: 0 0 8px rgba(184, 150, 62, 0.6); }
.dot-danger  { background: #ef4444; box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);  }
```

---

## 11. Progress bars

```css
.progress, [class*="progress-bar"], [class*="bar-fill"] {
  height: 3px;
  border-radius: 99px;
  background: linear-gradient(90deg, #2D7DD2, #4A9EFF);
}

.progress-track, [class*="progress-track"] {
  height: 3px;
  background: rgba(74, 158, 255, 0.08);
  border-radius: 99px;
}
```

---

## 12. Inputs et champs de recherche

```css
input, .search, [class*="input"], [class*="search"] {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  background: rgba(6, 8, 13, 0.80);
  border: 1px solid rgba(74, 158, 255, 0.15);
  border-radius: 4px;
  color: #DCE8FF;
  padding: 8px 12px;
  outline: none;
  transition: border-color 150ms ease;
}

input:focus, .search:focus {
  border-color: #4A9EFF;
  box-shadow: 0 0 0 3px rgba(74, 158, 255, 0.08);
}

input::placeholder {
  color: rgba(220, 232, 255, 0.25);
}
```

---

## 13. Textes de branding à remplacer

Chercher et remplacer dans tous les fichiers HTML/JS/Vue/TS :

| Texte original | Remplacer par |
|---|---|
| `MONITOR` / `Monitor` | `JARVIS INTEL` |
| `World Monitor` | `Jarvis Intel` |
| `worldmonitor.app` | `localhost` |
| `@eliehabib` | `` (supprimer) |
| `Sign In` / `Create account` | `` (supprimer ces boutons) |
| `Join the Discord Community` | `` (supprimer) |
| `v2.8.0` | `v1.0` |
| `SITUATION MONDIALE` | `SITUATION MONDIALE` (garder) |

---

## 14. Header / Topbar

Le header WorldMonitor contient logo + navigation + Sign In.
Objectif : le simplifier pour qu'il ressemble aux topbars Jarvis.

```css
header, .topbar, nav {
  background: rgba(6, 8, 13, 0.95);
  backdrop-filter: blur(32px);
  border-bottom: 1px solid rgba(74, 158, 255, 0.08);
  height: 44px;
}
```

Supprimer ou masquer :
- Bouton "Sign In"
- Bouton "Create account"
- Lien GitHub star count
- "Join the Discord Community" banner

```css
/* Masquer les éléments non-Jarvis */
.sign-in-btn,
.create-account-btn,
.github-stars,
.discord-banner,
[href*="discord"],
[href*="github"] {
  display: none !important;
}
```

---

## 15. Couleurs spécifiques à la carte

La carte utilise des couleurs pour les layers (conflits, points chauds, etc.).
Ne pas changer les couleurs sémantiques de la carte — elles ont une signification
(rouge = danger réel, orange = élevé, etc.). Garder telles quelles.

Modifier uniquement :
- Le fond de la carte (si configurable) → `#06080D` ou très sombre
- Les contrôles de zoom → style Jarvis
- La légende → police DM Mono, fond glassmorphism

---

## 16. Panels latéraux (COUCHES, ACTUALITÉS, INSIGHTS IA)

```css
.layers-panel, .news-panel, .insights-panel,
[class*="sidebar"], [class*="panel-left"], [class*="panel-right"] {
  background: rgba(6, 8, 13, 0.90);
  backdrop-filter: blur(32px) saturate(180%);
  border-right: 1px solid rgba(74, 158, 255, 0.08);
}

/* Headers de panels */
.panel-header, [class*="panel-title"] {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(220, 232, 255, 0.45);
  border-bottom: 1px solid rgba(74, 158, 255, 0.08);
  padding: 10px 16px;
}
```

---

## 17. Checkboxes des layers (COUCHES)

```css
input[type="checkbox"] {
  accent-color: #4A9EFF;
  width: 13px;
  height: 13px;
}

.layer-item, [class*="layer-row"] {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  color: rgba(220, 232, 255, 0.65);
  padding: 6px 8px;
  border-radius: 4px;
  transition: background 120ms ease;
}

.layer-item:hover {
  background: rgba(74, 158, 255, 0.06);
  color: #DCE8FF;
}
```

---

## 18. DEFCON badge — recolorer en Jarvis

Le DEFCON badge garde sa logique de couleur (rouge/orange/jaune selon le niveau)
mais le fond et la police changent :

```css
.defcon-badge, [class*="defcon"] {
  font-family: 'Syne', sans-serif;
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 0.08em;
  border-radius: 4px;
  padding: 3px 8px;
}
```

---

## Ordre d'implémentation recommandé

1. Importer les Google Fonts (DM Sans, DM Mono, Syne)
2. Remplacer les variables CSS dans le fichier racine
3. Appliquer les styles globaux (body, scrollbar, film grain, vignette)
4. Styler les panneaux latéraux et le header
5. Remplacer les textes de branding
6. Masquer les éléments non-Jarvis (Sign In, Discord, GitHub)
7. Tester sur localhost:3001 avec un hard refresh

---

*Jarvis Visual Identity — 2026-05-01*
