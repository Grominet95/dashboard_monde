# World Monitor

**Tableau de bord mondial en temps réel** — agrégation d'actualités par IA, surveillance géopolitique et suivi des infrastructures dans une interface unifiée de veille situationnelle.

[![Licence: AGPL v3](https://img.shields.io/badge/Licence-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

<p align="center">
  <a href="https://github.com/Grominet95/jarvis-OS"><img src="https://img.shields.io/badge/Projet_Jarvis-jarvis--OS-4A9EFF?style=for-the-badge&logo=github&logoColor=white" alt="Jarvis OS"></a>
</p>

<p align="center">
  <a href="https://github.com/Grominet95/dashboard_monde/releases/latest"><img src="https://img.shields.io/badge/Télécharger-Windows_(.exe)-0078D4?style=for-the-badge&logo=windows&logoColor=white" alt="Télécharger Windows"></a>&nbsp;
  <a href="https://github.com/Grominet95/dashboard_monde/releases/latest"><img src="https://img.shields.io/badge/Télécharger-macOS_Apple_Silicon-000000?style=for-the-badge&logo=apple&logoColor=white" alt="Télécharger macOS ARM"></a>&nbsp;
  <a href="https://github.com/Grominet95/dashboard_monde/releases/latest"><img src="https://img.shields.io/badge/Télécharger-macOS_Intel-555555?style=for-the-badge&logo=apple&logoColor=white" alt="Télécharger macOS Intel"></a>&nbsp;
  <a href="https://github.com/Grominet95/dashboard_monde/releases/latest"><img src="https://img.shields.io/badge/Télécharger-Linux_(.AppImage)-FCC624?style=for-the-badge&logo=linux&logoColor=black" alt="Télécharger Linux"></a>
</p>

<p align="center">
  <a href="https://github.com/Grominet95/dashboard_monde"><strong>Code source</strong></a> &nbsp;·&nbsp;
  <a href="https://github.com/Grominet95/dashboard_monde/releases"><strong>Versions</strong></a> &nbsp;·&nbsp;
  <a href="https://github.com/Grominet95/jarvis-OS"><strong>Jarvis OS</strong></a>
</p>

![World Monitor Dashboard](docs/images/worldmonitor-7-mar-2026.jpg)

---

## Ce que ça fait

- **Plus de 500 flux d'actualités** dans 15 catégories, synthétisés par IA en briefings
- **Double moteur cartographique** — globe 3D (globe.gl) et carte WebGL plane (deck.gl) avec 45 couches de données
- **Corrélation inter-flux** — convergence des signaux militaires, économiques, catastrophes et escalades
- **Indice d'intelligence pays** — score de risque composite sur 12 catégories de signaux
- **Radar financier** — 92 bourses mondiales, matières premières, crypto et composite marché à 7 signaux
- **IA locale** — tout faire tourner avec Ollama, sans clé API requise
- **5 variantes** depuis une seule base de code (monde, tech, finance, matières premières, positif)
- **Application desktop native** (Tauri 2) pour macOS, Windows et Linux
- **21 langues** avec flux en langue native et support RTL

---

## Démarrage rapide

```bash
git clone https://github.com/Grominet95/dashboard_monde.git
cd dashboard_monde
npm install
npm run dev
```

Ouvrir [localhost:5173](http://localhost:5173). Aucune variable d'environnement requise pour une utilisation de base.

Pour le développement par variante :

```bash
npm run dev:tech       # variante tech
npm run dev:finance    # variante finance
npm run dev:commodity  # variante matières premières
npm run dev:happy      # variante positive
```

---

## Stack technique

| Catégorie | Technologies |
|-----------|--------------|
| **Frontend** | TypeScript vanilla, Vite, globe.gl + Three.js, deck.gl + MapLibre GL |
| **Desktop** | Tauri 2 (Rust) avec sidecar Node.js |
| **IA/ML** | Ollama / Groq / OpenRouter, Transformers.js (côté navigateur) |
| **Contrats API** | Protocol Buffers (92 protos, 22 services), annotations HTTP sebuf |
| **Déploiement** | Vercel Edge Functions (60+), relay Railway, Tauri, PWA |
| **Cache** | Redis (Upstash), cache 3 niveaux, CDN, service worker |

---

## Données de vol

Données de vol gracieusement fournies par [Wingbits](https://wingbits.com), la solution ADS-B la plus avancée du marché.

---

## Sources de données

Le dashboard agrège plus de 65 sources de données externes couvrant la géopolitique, la finance, l'énergie, le climat, l'aviation, la cybersécurité, le militaire, les infrastructures et l'intelligence actualités.

---

## Contribuer

```bash
npm run typecheck        # Vérification des types
npm run build:full       # Build de production
```

---

## Licence

**AGPL-3.0** pour un usage non commercial. **Licence commerciale** requise pour tout usage commercial.

| Cas d'usage | Autorisé ? |
|-------------|-----------|
| Personnel / recherche / éducation | Oui |
| Auto-hébergement (non commercial) | Oui, avec attribution |
| Fork et modification (non commercial) | Oui, partager le code source sous AGPL-3.0 |
| Usage commercial / SaaS / rebranding | Nécessite une licence commerciale |

Voir [LICENSE](LICENSE) pour les conditions complètes.

> Fork du projet open-source [WorldMonitor](https://github.com/koala73/worldmonitor) par Elie Habib, adapté en français, amélioré et créé sur mesure pour [Jarvis](https://github.com/Grominet95/jarvis-OS).
