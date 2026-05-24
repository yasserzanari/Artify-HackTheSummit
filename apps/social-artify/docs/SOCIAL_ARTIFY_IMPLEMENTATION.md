# Social Artify — Frontend Implementation Plan

## Project Context

LiveArt is a hackathon monorepo with two applications sharing the same artwork universe.

```text
LiveArt/
  apps/
    ar-web/          ← WebAR museum experience (separate teammate)
    social-artify/   ← Social platform (this plan)
```

### ar-web (not your responsibility)

Built and owned by a separate teammate. It is a mobile-first WebAR app powered by MindAR + A-Frame. Visitors scan physical artworks in a museum and see real-time AR effects, audio narration, and history panels overlaid on the live camera feed.

Key facts relevant to social-artify:

- Runs on its own Next.js instance, port 3000 or behind a reverse proxy with a real HTTPS cert.
- Deployed on a VM via systemd for the hackathon demo.
- Supports three artworks with exact IDs: `mona-lisa`, `starry-night`, `the-scream`.
- Each artwork has defined colors used in the AR scene (golden for Mona Lisa, blue/yellow for Starry Night, red/orange for The Scream).
- The AR experience URL pattern is `/ar` on the ar-web host.

### social-artify (this plan)

Runs on port 3002. Two people share this app:

| Scope | Owner |
| --- | --- |
| Auth, database, API routes, backend logic | Teammate |
| Frontend pages, UI components, routing, client state | You |

**This document covers the frontend scope only.** Auth flows, API contracts, and DB schemas are documented separately by the teammate. This plan describes what the frontend expects from the backend, not how the backend implements it.

---

## Goal

Build the mobile-first social frontend for LiveArt. Users can browse a swipeable feed of artworks posted by artists, like and save pieces, and — if they are an artist — upload their own work with a simulated 3D generation flow.

The three seed artworks are the same ones used in ar-web. The **View in 3D** action in social-artify links directly to the ar-web AR experience for those artworks.

The demo must be presentable on real phones and legible on desktop for judges.

---

## Guiding Principles

- The artwork is always the hero. UI chrome must stay minimal.
- Social features are additive — the feed is fully browsable as a guest.
- Auth-gated actions prompt login in-context without hard redirects that lose the current page.
- The artist upload and 3D generation flow must feel real even if the 3D output is mocked.
- Mobile-first layout is a product requirement, not a polish step.
- The frontend talks to the backend through clean API boundaries. No auth or DB logic lives in UI components.

---

## Team Boundary — What the Frontend Expects From the Backend

The teammate owns all of the following. The frontend will consume them as HTTP endpoints or shared TypeScript types. The frontend does not implement or mock these.

### Auth Endpoints (teammate)

```
POST /api/auth/register   { name, email, password, role }  → { user, token }
POST /api/auth/login      { email, password }               → { user, token }
POST /api/auth/logout     {}                                → 200
GET  /api/auth/me                                           → { user } | 401
```

### Artwork Endpoints (teammate)

```
GET  /api/artworks                   → Artwork[]
GET  /api/artworks/:id               → Artwork
POST /api/artworks                   → Artwork          (artist only)
```

### Social Endpoints (teammate)

```
POST   /api/artworks/:id/like        → { likes: number }
DELETE /api/artworks/:id/like        → { likes: number }
POST   /api/artworks/:id/save        → 200
DELETE /api/artworks/:id/save        → 200
GET    /api/users/:id/saved          → Artwork[]
```

### Shared TypeScript Types

These types should live in a shared location both the frontend and backend agree on, or be defined once by the teammate and imported.

```ts
export type Role = 'guest' | 'viewer' | 'artist'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  avatar?: string
  createdAt: string
}

export interface Artwork {
  id: string
  title: string
  artistName: string
  artistId: string
  medium: string
  year: number
  dimensions?: string
  museum?: string
  location?: string
  categories: string[]         // e.g. ['Baroque', 'Portraits']
  imageUrl: string
  has3D: boolean               // true for the three AR artworks
  arWebId?: string             // matches ar-web artwork ID if has3D is true
  description?: string
  likes: number
  isLikedByMe: boolean         // resolved per authenticated request
  isSavedByMe: boolean         // resolved per authenticated request
  createdAt: string
}
```

The `arWebId` field connects a social-artify artwork to its ar-web counterpart. When `has3D` is true and `arWebId` is set, the **View in 3D** button links to ar-web.

---

## Seed Artworks

The seed artworks are the same three artworks supported by ar-web. The `arWebId` values must match the IDs in `apps/ar-web/src/data/artworks.ts`.

| Title | Artist | Year | arWebId | Categories |
| --- | --- | --- | --- | --- |
| Mona Lisa | Leonardo da Vinci | c. 1503 | `mona-lisa` | Renaissance, Portraits |
| Starry Night | Vincent van Gogh | 1889 | `starry-night` | Post-Impressionism |
| The Scream | Edvard Munch | 1893 | `the-scream` | Expressionism |

Additional seed artworks (not in ar-web, no AR experience):

| Title | Artist | Year | Categories |
| --- | --- | --- | --- |
| Girl with a Pearl Earring | Johannes Vermeer | 1665 | Baroque, Portraits |
| Judith Beheading Holofernes | Caravaggio | 1602 | Italian Baroque |

---

## View in 3D — ar-web Integration

When a user taps **View in 3D** on an artwork detail page, the frontend must:

1. Check that `artwork.has3D === true` and `artwork.arWebId` is set.
2. Construct the ar-web URL: `{AR_WEB_BASE_URL}/ar?artwork={arWebId}`.
3. Open that URL in a new tab or navigate to it.

The ar-web base URL is an environment variable:

```
NEXT_PUBLIC_AR_WEB_URL=https://ar-demo.yourdomain.com
```

During local development:

```
NEXT_PUBLIC_AR_WEB_URL=http://localhost:3000
```

**The frontend does not render any AR scene.** The ar-web app handles the full AR experience once the user lands there. The View in 3D button is just a deep link.

---

## Target File Structure

```text
apps/social-artify/
  src/
    app/
      layout.tsx                        # Root layout, fonts, auth provider
      page.tsx                          # Redirects: onboarding or discover
      globals.css                       # Design tokens (Tailwind v4 @theme)
      onboarding/
        page.tsx                        # Screen 01 · Splash
      discover/
        page.tsx                        # Screen 02 · Swipe feed
      artwork/
        [id]/
          page.tsx                      # Screen 03 · Artwork detail
      login/
        page.tsx
      register/
        page.tsx                        # Role selector: viewer | artist
      profile/
        page.tsx                        # Your posts, likes, settings
      saved/
        page.tsx                        # Saved artworks grid
      artist/
        upload/
          page.tsx                      # Screen 07 · New Work form
        generating/
          page.tsx                      # Screen 08 · 3D generation progress
    components/
      layout/
        BottomNav.tsx                   # Feed · Discover · 3D · Saved · You
        TopBar.tsx                      # LiveArt logo + icons
      artwork/
        ArtworkCard.tsx                 # Single swipeable card
        SwipeDeck.tsx                   # Stacked card deck with drag logic
        ArtworkDetail.tsx               # Full detail sheet component
        CategoryFilter.tsx              # Scrollable pill filter bar
      social/
        LikeButton.tsx                  # Heart toggle, auth-gated
        ActionBar.tsx                   # Pass · 3D · Like row under deck
      artist/
        UploadForm.tsx                  # Title, medium, year, description, toggles
        GeneratingProgress.tsx          # Animated step checklist with progress bar
      auth/
        AuthModal.tsx                   # Bottom-sheet login/register overlay
        GuestBanner.tsx                 # "Sign in to like" prompt strip
    store/
      authStore.ts                      # Client auth state (user, isGuest, token)
      feedStore.ts                      # Feed state (artworks, active category)
    hooks/
      useAuth.ts                        # Auth state + redirect helpers
      useSwipe.ts                       # Touch and drag gesture helpers
      useLike.ts                        # Like toggle with auth guard
      useArtworks.ts                    # Fetch feed artworks from API
      useArtwork.ts                     # Fetch single artwork from API
    lib/
      api.ts                            # Typed fetch wrappers for all API endpoints
      ar.ts                             # View in 3D URL builder using NEXT_PUBLIC_AR_WEB_URL
```

---

## Auth — Frontend Responsibilities Only

The frontend does not implement auth logic. Its responsibilities are:

1. **`authStore.ts`** — Zustand store that holds `{ user, token, isGuest }`. Populated from the API response after login or registration. Token stored in an `httpOnly` cookie (set by the teammate's API) or in memory.
2. **`useAuth.ts`** — Hook exposing the current user, `isGuest`, `login(email, password)`, `logout()`. These call `lib/api.ts`, not any direct DB logic.
3. **`AuthModal.tsx`** — Bottom-sheet overlay with a login and register tab. Triggered by auth-gated actions. After a successful login it replays the pending action (like, save) immediately.
4. **Route guards** — Each protected page checks auth state on mount and redirects appropriately if the user lacks the required role.
5. **`GuestBanner.tsx`** — Strip shown at the bottom of the discover feed when `isGuest` is true.

### Auth Permission Table

| Action | Guest | Viewer | Artist |
| --- | --- | --- | --- |
| Browse discover feed | Yes | Yes | Yes |
| View artwork detail | Yes | Yes | Yes |
| Like a painting | No → AuthModal | Yes | Yes |
| Save an artwork | No → AuthModal | Yes | Yes |
| Post an artwork | No → AuthModal | No | Yes |
| See upload button | No | No | Yes |
| View in 3D (link to ar-web) | Yes | Yes | Yes |

---

## Design Tokens

All tokens are declared in `globals.css` using the Tailwind CSS v4 `@theme` block.

| Token | Value | Usage |
| --- | --- | --- |
| `--color-background` | `#F5F0E8` | Page and card backgrounds |
| `--color-primary` | `#C0392B` | CTA buttons, active icons, progress bar |
| `--color-text` | `#1A1A1A` | Body and headline text |
| `--color-muted` | `#5A5A5A` | Metadata and secondary labels |
| `--color-surface` | `#FFFFFF` | Card surfaces |
| `--color-border` | `#E0D8CC` | Dividers and input borders |
| `--font-serif` | Playfair Display | Headlines and artwork titles |
| `--font-sans` | Inter | Body copy and UI labels |
| `--radius-card` | `12px` | Card corners |
| `--radius-pill` | `9999px` | Buttons, filter pills, badges |

These colors deliberately echo the ar-web visual palette so the two apps feel like one product when a user moves from social-artify to the AR experience.

---

## Screen-by-Screen Breakdown

### Screen 01 — Onboarding (`/onboarding`)

- Full-bleed artwork background (Mona Lisa) with a soft dark gradient overlay.
- Small caps tag: `A NEW WAY TO SEE ART`.
- Headline: **Step closer to the canvas.** in serif heavy italic.
- Sub-copy: Scan any work in the museum to see it in 3D. Discover new artists. Listen to every painting.
- **Get started** black pill CTA → `/register`.
- *Already have an account? Sign in* link → `/login`.
- *Browse without signing in* text link → `/discover` (sets `isGuest: true` in `authStore`).

### Screen 02 — Discover Feed (`/discover`)

- `TopBar`: LiveArt wordmark, `?` icon, filter icon.
- `CategoryFilter`: horizontal scroll pills (All · Baroque · Renaissance · Portraits · New 3D).
- `SwipeDeck`: stack of three visible cards.
  - Each card shows artwork image, museum and year tags, artist name, title, medium.
  - `3D READY` badge when `has3D` is true.
  - Swipe left = pass.
  - Swipe right = like (auth-gated via `useLike`).
  - Tap = navigate to `/artwork/[id]`.
- `ActionBar` below deck: ✗ pass · red 3D cube (links to ar-web if card has3D) · ♥ like.
- `GuestBanner` shown at bottom when `isGuest`.
- `BottomNav`: Feed · Discover · 3D · Saved · You.

### Screen 03 — Artwork Detail (`/artwork/[id]`)

- Full-bleed artwork image occupying top 55 percent of the viewport.
- Back arrow (top left), bookmark (top right), share icon (top right).
- Category tag · title in bold serif · artist name · museum.
- **View in 3D** dark pill button shown only when `has3D` is true.
  - On tap → opens ar-web URL: `{NEXT_PUBLIC_AR_WEB_URL}/ar?artwork={arWebId}`.
- Floating `?` information button.
- Metadata row: medium left, dimensions right.
- `LikeButton` with count, auth-gated.
- Description text when available.

### Screen 07 — Artist Upload (`/artist/upload`)

- Route-guarded: redirects to `/discover` if user role is not `artist`.
- Close ✗ (top left) + `Draft` label (top right).
- Image picker: `<input type="file" accept="image/*">` rendered as a styled drop zone.
  - After selection shows filename, file size, and a **Replace** button.
  - Preview uses `URL.createObjectURL`; revoked on unmount.
- Form fields via `react-hook-form`: TITLE · MEDIUM · YEAR · DESCRIPTION.
- Toggle switches:
  - *Generate 3D version* (AI depth pass · ~2 min) — default on.
  - *Voice description* (Auto-generated, editable) — default on.
- **Publish to LiveArt** red pill CTA.
  - Calls `POST /api/artworks` with form data (handled by teammate's API).
  - If 3D toggle is on → navigate to `/artist/generating?id={newArtworkId}`.
  - If 3D toggle is off → navigate directly to `/artwork/{newArtworkId}`.

### Screen 08 — Generating 3D (`/artist/generating`)

- Route-guarded: artist only.
- Close ✗ button — returns to feed on confirm.
- `GENERATING 3D` small caps header.
- Floating artwork thumbnail with subtle pulse shadow animation.
- Headline: **Lifting the canvas** *off the wall.*
- Progress bar animated from 0 to 100 over ~5 seconds (purely frontend animation, no real 3D is generated).
- Percentage counter + estimated time remaining (`~32 sec remaining`).
- Step checklist — each step transitions through `pending → in-progress → done`:
  1. Color analysis
  2. Edge detection
  3. Depth estimation
  4. Mesh generation
  5. Texture baking
- On completion → navigate to `/artwork/{id}`.

---

## Component Details

### `SwipeDeck.tsx`

- Renders three cards stacked with z-index and subtle scale/translate for depth.
- The top card is draggable via Framer Motion `drag="x"`.
- On drag end, check combined velocity + offset threshold to determine pass or like.
- Swipe right calls `useLike(artworkId)`.
- After a swipe, the next card in the filtered feed becomes the top card.
- When all cards are swiped, show a reset prompt or loop the deck.

### `useLike.ts`

- Accepts an artwork ID.
- Reads current user from `authStore`.
- If guest → opens `AuthModal` and stores `pendingAction: { type: 'like', artworkId }` in `authStore`.
- If logged in → calls `POST /api/artworks/:id/like` or `DELETE /api/artworks/:id/like`.
- Updates `feedStore` optimistically and rolls back on API error.
- After `AuthModal` login success, `useAuth` checks for `pendingAction` and replays it.

### `AuthModal.tsx`

- Framer Motion slide-up bottom sheet.
- Two tabs: *Log in* and *Sign up*.
- Calls `useAuth().login()` or `useAuth().register()` on submit.
- On success: closes modal, replays any pending action.
- Dismissible by tapping the overlay backdrop.

### `GeneratingProgress.tsx`

- Accepts `artworkId` and an `onComplete` callback.
- Uses `useEffect` to drive a 5-second timed animation with `setInterval`.
- Steps array with status field: `'pending' | 'active' | 'done'`.
- Each step advances after a fixed time slice (5000ms / 5 steps = ~1 second per step with some variance for realism).
- Progress bar uses CSS transition on `width`.

### `lib/api.ts`

All HTTP calls go through here. Example shape:

```ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ''

export async function getArtworks(category?: string): Promise<Artwork[]> { ... }
export async function getArtwork(id: string): Promise<Artwork> { ... }
export async function likeArtwork(id: string): Promise<{ likes: number }> { ... }
export async function unlikeArtwork(id: string): Promise<{ likes: number }> { ... }
export async function saveArtwork(id: string): Promise<void> { ... }
export async function unsaveArtwork(id: string): Promise<void> { ... }
export async function postArtwork(form: FormData): Promise<Artwork> { ... }
export async function login(email: string, password: string): Promise<{ user: User; token: string }> { ... }
export async function register(name: string, email: string, password: string, role: Role): Promise<{ user: User; token: string }> { ... }
export async function logout(): Promise<void> { ... }
export async function getMe(): Promise<User> { ... }
```

### `lib/ar.ts`

```ts
const AR_WEB_URL = process.env.NEXT_PUBLIC_AR_WEB_URL ?? 'http://localhost:3000'

export function buildArExperienceUrl(arWebId: string): string {
  return `${AR_WEB_URL}/ar?artwork=${arWebId}`
}
```

---

## Implementation Phases

### Phase 1 — Foundation

**Objective**: Set up the project shell, design tokens, fonts, and shared layout.

**Steps**:

1. Install additional dependencies: `zustand`, `framer-motion`, `react-hook-form`.
2. Define design tokens in `globals.css` using Tailwind CSS v4 `@theme`.
3. Add Google Fonts for Playfair Display and Inter in `layout.tsx`.
4. Build `BottomNav.tsx` shell (five tabs, no active state logic yet).
5. Build `TopBar.tsx` shell (logo + icon placeholders).
6. Add `.env.local` with `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_AR_WEB_URL`.
7. Build `src/app/page.tsx` that reads `authStore` and redirects to `/onboarding` or `/discover`.

**Done when**:

- `npm run dev` starts at port 3002.
- Cream background with correct fonts renders.
- Bottom navigation and top bar are visible.

**Coordinate with teammate**: Confirm `NEXT_PUBLIC_API_URL` value and agree on cookie vs. bearer token for auth.

---

### Phase 2 — Auth Shell (Frontend Only)

**Objective**: Build the auth pages and the client auth state layer. Backend endpoints may not be ready yet — the frontend compiles and the UI is complete regardless.

**Steps**:

1. Create `authStore.ts` with Zustand holding `{ user, token, isGuest, pendingAction }`.
2. Create `lib/api.ts` with `login`, `register`, `logout`, `getMe` wrappers. These can return placeholder responses until the teammate's API is live.
3. Create `useAuth.ts` wrapping the store and the api calls.
4. Build `src/app/onboarding/page.tsx` (Screen 01).
5. Build `src/app/login/page.tsx` with email + password form.
6. Build `src/app/register/page.tsx` with role card toggle (viewer | artist).
7. Build `AuthModal.tsx` bottom-sheet with login and register tabs.
8. Build `GuestBanner.tsx`.

**Done when**:

- Onboarding, login, and register pages render correctly on mobile.
- `AuthModal` slides up and closes.
- `authStore` holds user state. Actual API integration is wired but will return errors until teammate's API is deployed.

**Coordinate with teammate**: Get the auth endpoint shapes and error response format early so `lib/api.ts` error handling is correct.

---

### Phase 3 — Discover Feed

**Objective**: Build the swipe deck, category filter, and action bar.

**Steps**:

1. Create `feedStore.ts` with artworks array and active category.
2. Create `useArtworks.ts` hook that fetches `GET /api/artworks` with category filter param.
3. Build `CategoryFilter.tsx` with horizontal scroll and active pill state.
4. Build `ArtworkCard.tsx` with image, tags, badges, title, artist, and 3D READY badge.
5. Create `useSwipe.ts` wrapping Framer Motion drag for direction detection.
6. Build `SwipeDeck.tsx` with three stacked cards and drag-to-swipe.
7. Create `useLike.ts` with auth guard and pending action.
8. Build `ActionBar.tsx` with pass, 3D cube (links to ar-web), and like buttons.
9. Assemble `discover/page.tsx`.

**Done when**:

- Cards render from API data (or empty state while API is not ready).
- Swipe left passes, swipe right likes (with AuthModal for guests).
- Category filter updates the displayed cards.
- 3D cube button opens the ar-web URL in a new tab for artworks with `has3D: true`.

---

### Phase 4 — Artwork Detail

**Objective**: Build the artwork detail page with like, save, and View in 3D.

**Steps**:

1. Create `useArtwork.ts` fetching `GET /api/artworks/:id`.
2. Build `artwork/[id]/page.tsx` with hero image, metadata, and actions.
3. Build `LikeButton.tsx` showing count and heart state, calling `useLike`.
4. Wire bookmark to `POST /api/artworks/:id/save` via `lib/api.ts`.
5. Wire **View in 3D** button to `buildArExperienceUrl(artwork.arWebId)` opening in a new tab.
6. Add back navigation.
7. Handle loading and error states.

**Done when**:

- Tapping a card opens the correct artwork detail.
- Like and save work for logged-in users, AuthModal appears for guests.
- View in 3D opens ar-web in a new tab for the three AR artworks.
- View in 3D button is hidden when `has3D` is false.

---

### Phase 5 — Artist Upload Flow

**Objective**: Build the upload form, 3D generation animation, and feed refresh.

**Steps**:

1. Add upload entry point visible to artists only (plus icon in BottomNav or profile button).
2. Build `artist/upload/page.tsx` with route guard (redirect non-artists).
3. Build `UploadForm.tsx` using `react-hook-form` with all fields and toggles.
4. Add image file picker with local `URL.createObjectURL` preview and cleanup on unmount.
5. On submit → call `POST /api/artworks` (teammate's endpoint) → get back new artwork ID.
6. If 3D toggle on → navigate to `/artist/generating?id={id}`.
7. If 3D toggle off → navigate to `/artwork/{id}`.
8. Build `GeneratingProgress.tsx` with 5-second timed animation and step checklist.
9. Build `artist/generating/page.tsx`.
10. On animation complete → navigate to `/artwork/{id}`.

**Done when**:

- Artist can fill form, tap Publish, and watch the generation animation.
- After generation, the artwork detail page loads.
- Upload route is inaccessible to guests and viewers.

**Coordinate with teammate**: Confirm the `POST /api/artworks` multipart form shape and response.

---

### Phase 6 — Profile and Saved

**Objective**: Build the profile page and saved artworks grid.

**Steps**:

1. Build `profile/page.tsx` showing name, role badge, post count, like count.
2. Fetch user's artworks for artist accounts.
3. Add logout button calling `useAuth().logout()`.
4. Build `saved/page.tsx` fetching `GET /api/users/:id/saved`.
5. Empty states for zero posts and zero saved artworks.

**Done when**:

- Profile shows correct user data for both roles.
- Saved page shows bookmarked artworks.
- Logout clears `authStore` and returns to guest mode on the discover feed.

---

### Phase 7 — Polish and Transitions

**Objective**: Add page transitions, micro-interactions, and mobile refinements.

**Steps**:

1. Add Framer Motion `AnimatePresence` transitions between routes.
2. Animate `AuthModal` slide-up with spring easing.
3. Add press scale feedback to all interactive buttons.
4. Animate the like heart with a pop-scale on toggle.
5. Animate `GuestBanner` entrance from below.
6. Add skeleton loading states for the feed and artwork detail while API responds.
7. Run a full mobile audit at 390px viewport width.
8. Ensure `BottomNav` clears the iOS home indicator (`pb-safe`, `env(safe-area-inset-bottom)`).
9. Verify all tap targets are at least 44px tall.
10. Add `<meta name="theme-color" content="#F5F0E8">` to the layout for browser chrome matching.

**Done when**:

- All route transitions feel smooth.
- Micro-interactions are satisfying on touch.
- Layout is clean and usable on a 390px iPhone viewport.
- No layout breaking on desktop for judge review.

---

## Key Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Teammate's API not ready when building UI | Build `lib/api.ts` with clear interfaces; stub responses locally for UI development |
| Auth token/cookie strategy not agreed | Agree early on cookie vs. bearer; `authStore` only holds user object, not cookie mechanics |
| Swipe gesture conflicts with scroll | Lock Framer Motion drag axis to horizontal on the card deck |
| Image object URLs leaking memory | Call `URL.revokeObjectURL` in upload form cleanup on unmount |
| View in 3D URL wrong if ar-web moves | Use `NEXT_PUBLIC_AR_WEB_URL` env var; never hardcode the ar-web host |
| ar-web artwork IDs drift from social-artify | Keep `arWebId` values documented here and matched to `apps/ar-web/src/data/artworks.ts` |
| Route guards missing for artist pages | Add auth check with redirect at the top of every protected page component |
| Empty deck when all cards are swiped | Loop the deck or show a clear "you have seen everything" empty state with a reset button |
| AuthModal loses context of pending action | Store `pendingAction` in `authStore`; replay in `useAuth` after successful login |
| Mobile viewport height jump on keyboard open | Use `dvh` units instead of `vh` for full-height layouts |
| ar-web HTTPS required for camera, social-artify on HTTP | View in 3D opens ar-web in a new tab — each app manages its own HTTPS independently |

---

## ar-web ↔ social-artify Integration Checklist

Before the hackathon demo, verify:

- [ ] `NEXT_PUBLIC_AR_WEB_URL` is set correctly in social-artify's production environment.
- [ ] `arWebId` values in the database seed match `apps/ar-web/src/data/artworks.ts` IDs exactly (`mona-lisa`, `starry-night`, `the-scream`).
- [ ] Tapping **View in 3D** on Mona Lisa, Starry Night, and The Scream opens the correct ar-web scene.
- [ ] ar-web accepts the `?artwork=` query param and lands on the right experience (coordinate with ar-web teammate).
- [ ] The visual transition between social-artify and ar-web feels intentional (consistent colors, not jarring).

---

## Definition of Done

The social-artify frontend is done when:

- `/onboarding` presents the splash with Get started, Sign in, and guest browse entry points.
- `/discover` shows a swipeable card deck with category filtering and skeleton loading states.
- Swipe-right and the like action are auth-gated for guests via `AuthModal`.
- `/artwork/[id]` shows full artwork detail with like, save, and **View in 3D** correctly linking to ar-web.
- `/login` and `/register` render correctly and call `lib/api.ts` auth endpoints.
- Role selection at register controls artist vs. viewer access.
- An artist can open the upload form, fill it, publish, watch the 3D generation animation, and land on the artwork detail page.
- `/profile` shows user data and posted artworks for artists.
- `/saved` shows bookmarked artworks.
- Guest mode allows full browsing but prompts login on social actions.
- `AuthModal` slides up in-context without losing the current page.
- **View in 3D** opens the ar-web experience for the three AR artworks and is hidden for all others.
- The layout is usable on a 390px mobile viewport.
- Design tokens are consistent with the ar-web visual language (cream background, red CTA, serif headlines).
- `npm run build` passes with no TypeScript errors.
