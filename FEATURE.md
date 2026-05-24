# LiveArt — Feature Documentation

> **HackTheSummit** · Plateforme sociale de découverte d'art avec expériences AR immersives

---

## Vue d'ensemble

LiveArt est un **monorepo** combinant deux applications complémentaires :

| App | Rôle |
|---|---|
| `apps/social-artify` | Plateforme sociale mobile-first : feed, likes, profil, quiz |
| `apps/ar-web` | Viewer AR/3D : scanner des œuvres pour les voir prendre vie |

L'idée centrale : l'utilisateur **découvre des œuvres** via un swipe-feed, puis peut les **vivre en réalité augmentée** en pointant son téléphone sur l'œuvre physique.

---

## Stack Technologique

### Framework & UI
| Catégorie | Technologie | Version |
|---|---|---|
| Framework | **Next.js** (App Router) | 16.2.6 |
| UI | **React** | 19.2.4 |
| Typage | **TypeScript** | 5 |
| Styles | **Tailwind CSS** (v4, PostCSS) | 4 |
| Animation | **Framer Motion** | 12.40.0 |
| Fonts | Playfair Display + Inter | Google Fonts |

### State & Données
| Catégorie | Technologie | Version |
|---|---|---|
| State management | **Zustand** (avec persistence) | 5.0.13 |
| Base de données | **JSON files** (`data/`) | — |
| Auth tokens | **Jose** (JWT HS256) | 6.2.3 |
| Hash passwords | **bcryptjs** | 3.0.3 |

### AR / 3D
| Catégorie | Technologie | Version |
|---|---|---|
| AR Image Tracking | **MindAR** | intégré |
| Rendu 3D | **Three.js** | 0.184.0 |
| Scène AR déclarative | **A-Frame** | 1.7.1 |
| Animations 3D | **GSAP** | 3.15.0 |
| Image Processing | **wasm-webp** | 0.1.0 |

### Intelligence Artificielle
| Catégorie | Technologie | Version |
|---|---|---|
| Génération / narration | **Google GenAI** | 2.6.0 |
| Reconnaissance vocale | **Google Cloud Speech** | 7.3.1 |
| Auth cloud | **Google Auth Library** | 10.6.2 |

---

## App `social-artify` — Fonctionnalités

### Authentification & Utilisateurs

- **Inscription** avec hachage bcrypt du mot de passe
- **Connexion** avec cookie httpOnly JWT (expiration 7 jours)
- **Vérification de session** automatique au chargement (`GET /api/auth/me`)
- **Mise à jour de profil** : nom, email, mot de passe
- **Déconnexion** avec suppression du cookie
- **Mode invité** : navigation sans compte, avec bannière de conversion persistante
- **3 rôles** : `guest` · `viewer` · `artist`
- **Modal auth flottante** : onglets login/register, gestion d'erreurs, replay automatique des actions en attente (ex: like déclenché avant connexion)

---

### Quiz de Goût Artistique (`/quiz`)

- **5 questions** à choix multiples pour cerner les préférences visuelles
- Chaque réponse est mappée à des **catégories d'art** (Renaissance, Baroque, Abstrait…)
- Résultat : attribution d'un **profil artistique** parmi :
  - `renaissance` — œuvres classiques, maîtrise technique
  - `moderne` — art moderne, expressionnisme
  - `abstrait` — art abstrait, contemporain
  - `surrealisme` — surréalisme, onirisme
- Le profil **filtre le feed de découverte** automatiquement
- Transitions animées avec **Framer Motion** (spring physics)

---

### Feed de Découverte (`/discover`)

- **Swipe-deck Tinder-style** : pile de cartes draggable
  - Détection de direction (seuil > 80px ou vitesse > 400px/s)
  - Animation de rejet gauche / approbation droite
  - Prévention du tap post-drag
- **Like / Pass** avec boutons en bas d'écran (ActionBar)
- **Mises à jour optimistes** : like immédiat, roll-back si erreur serveur
- **Filtre par catégorie** horizontal scrollable (All, Renaissance, Baroque, Portraits, Paysages, Mythologie…)
  - Masqué automatiquement si un profil quiz est défini
- **Tap sur carte** → navigation vers la page détail
- **Guest Banner** dismissible pour encourager l'inscription

---

### Détail d'Oeuvre (`/artwork/[id]`)

- **Image hero** plein écran avec overlay gradient
- **Métadonnées complètes** : titre, artiste, année, médium, dimensions, musée, localisation
- **Description** narrative de l'œuvre
- **Tags de catégories** visuels
- **Like** avec compteur en temps réel
- **Save** (bookmark) pour retrouver l'œuvre plus tard
- **Partage** via Web Share API natif (mobile) ou fallback clipboard
- **Voir en 3D** : bouton affiché si `has3D = true` → ouvre l'expérience AR dans `ar-web`
- Layout responsive : image à gauche / détails à droite sur desktop

---

### Profil Utilisateur (`/profile`)

- **Avatar** généré depuis les initiales + badge de rôle
- **Stats** : nombre d'œuvres likées, sauvegardées
- **Grille 2 colonnes** des œuvres likées
- **Lien** vers la page Saved
- **Formulaire d'édition inline** : nom, email, mot de passe
- **Déconnexion**
- États vides avec CTAs vers /discover

---

### Artworks Sauvegardées (`/saved`)

- **Grille 2 colonnes** des œuvres bookmarkées
- Même UI card que le profil
- État vide avec lien vers /discover

---

### State Management (Zustand)

**`useAuthStore`**
```
user · isGuest · quizDone · pendingAction · authModalOpen · authModalTab
```
Persisté en localStorage : `user`, `isGuest`, `quizDone`

**`useFeedStore`**
```
artworks · activeCategory · setArtworks · setCategory · upsertArtwork · likeArtwork
```

**Hooks dérivés**
- `useAuth()` — validation JWT, login/logout/register, browseAsGuest
- `useArtworks(category?)` — fetch + sync du feed
- `useLike(artworkId)` — toggle like optimiste avec retry

---

### API REST

| Méthode | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Inscription, retourne user + token |
| `POST` | `/api/auth/login` | Connexion, retourne user + token |
| `GET` | `/api/auth/me` | Vérifie la session JWT |
| `PATCH` | `/api/auth/profile` | Met à jour nom / email / password |
| `POST` | `/api/auth/logout` | Supprime le cookie |
| `GET` | `/api/artworks` | Liste toutes les œuvres (filtre `?category=`) |
| `GET` | `/api/artworks/[id]` | Détail d'une œuvre |
| `POST` | `/api/artworks/[id]?action=like` | Toggle like (auth requis) |
| `POST` | `/api/artworks/[id]?action=save` | Toggle save (auth requis) |

---

### Design System

**Palette de couleurs**
| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#810B38` | Burgundy — accents, CTA |
| `--color-background` | `#F1E2D1` | Beige chaud — fond général |
| `--color-text` | `#1A1A1A` | Texte principal |
| `--color-border` | `#C2A07A` | Tan — séparateurs, bordures |
| `--color-muted` | `#6B4A36` | Brun — textes secondaires |

**Typographie**
- **Playfair Display** — titres d'œuvres, headers (serif élégant)
- **Inter** — corps de texte, labels, UI (sans-serif lisible)

**Layout**
- `TopBar` — header avec logo, titre de page, boutons contextuels
- `BottomNav` — navigation mobile flottante + sidebar desktop (Discover, Profile)

---

## App `ar-web` — Fonctionnalités

### Expériences AR Immersives

- **WebAR sans app native** : fonctionne directement dans le navigateur mobile
- **3 œuvres cibles** supportées :
  1. Mona Lisa (Léonard de Vinci)
  2. Starry Night (Van Gogh)
  3. The Scream (Edvard Munch)
- **MindAR** pour le tracking d'images : reconnaissance + ancrage 3D sur l'œuvre scannée
- **Three.js + A-Frame** pour le rendu des expériences visuelles
- **GSAP** pour les animations d'entrée et effets sur les layers 3D
- Chaque œuvre a ses propres **présets d'effets visuels**

---

### Workbench MindAR (`/workbench`)

- **Compilateur de targets** `.mind` directement dans le navigateur (via `window.MINDAR.IMAGE.Compiler`)
- **Éditeur de métadonnées** des œuvres (titre, effets, paramètres)
- **Présets d'effets** : `monaLisa` · `starryNight` · `scream`
- API dédiée : `/api/workbench/*`
- Output attendu : `apps/ar-web/public/ar/targets/artworks.mind`

---

### Intelligence Artificielle

- **Google GenAI** : génération de descriptions narratives et narrations vocales des œuvres
- **Google Cloud Speech** : reconnaissance vocale pour des interactions parlées avec les œuvres

---

### Infrastructure & Déploiement

- **HTTPS local** avec `mkcert` pour tester la caméra sur iOS (Safari)
- **Reverse proxy** Caddy ou Nginx recommandé en production (HTTPS automatique)
- **Déploiement VM** : script de déploiement + service `systemd`, sélection automatique de port libre
- **Déploiement distant** via script Python

---

## Modèles de Données

### User
```typescript
interface User {
  id: string
  name: string
  email: string
  role: "guest" | "viewer" | "artist"
  avatar?: string
  createdAt: string
  artProfile?: "renaissance" | "moderne" | "abstrait" | "surrealisme"
  password?: string  // stocké haché (bcrypt)
}
```

### Artwork
```typescript
interface Artwork {
  id: string
  title: string
  artistName: string
  artistId: string
  medium: string
  year: number
  dimensions?: string
  museum?: string
  location?: string
  categories: string[]        // ex: ["Renaissance", "Portraits"]
  imageUrl: string
  has3D: boolean
  arWebId?: string            // lien vers l'expérience ar-web
  description?: string
  likes: number
  likedBy: string[]           // IDs utilisateurs
  savedBy: string[]           // IDs utilisateurs
  isLikedByMe?: boolean       // calculé côté serveur
  isSavedByMe?: boolean       // calculé côté serveur
  createdAt: string
}
```

---

## Structure du Monorepo

```
LiveArt/
├── apps/
│   ├── social-artify/          # App principale (social + feed)
│   │   ├── src/app/            # Pages Next.js (App Router)
│   │   ├── src/components/     # Composants UI
│   │   ├── src/hooks/          # Hooks Zustand + fetch
│   │   └── data/               # artworks.json + users.json
│   ├── ar-web/                 # App AR/3D
│   │   ├── src/                # Pages, composants, data AR
│   │   ├── public/ar/          # Targets MindAR + images sources
│   │   └── docs/               # Guides HTTPS, déploiement VM
│   ├── front-ui/               # (placeholder — future UI principale)
│   └── social/                 # (placeholder — features sociales futures)
└── tools/
    └── mind-workshop/          # Workshop compilation targets .mind
```

---

## Intégration entre les Apps

```
social-artify  ──(has3D = true)──►  ar-web
                                    ↑
                    buildArExperienceUrl(arWebId)
                    Ouvre dans un nouvel onglet
```

Le champ `arWebId` sur une œuvre sert à construire l'URL de l'expérience AR. L'utilisateur reste dans `social-artify` et l'expérience s'ouvre dans `ar-web` au tap du bouton **"Voir en 3D"**.

---

*Généré automatiquement à partir des sources du projet · LiveArt / HackTheSummit 2025*
