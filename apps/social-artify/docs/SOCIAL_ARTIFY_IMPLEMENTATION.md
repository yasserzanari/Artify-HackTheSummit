# Social Artify — Frontend Implementation Plan

## Goal

Build a mobile-first social art platform where users can browse, discover, and interact with artworks posted by artists. The app supports three modes of access: guest browsing, logged-in viewer (likes, saves), and logged-in artist (post, like, save). The social feed is the core experience — a swipeable deck of artworks enriched with 3D previews and artist context.

The first demo supports a seed collection of classic artworks and a mock artist upload flow with a simulated 3D generation pipeline.

The demo must be stable enough for a live hackathon presentation on real phones, with a clean responsive layout for desktop judges.

## Guiding Principles

- The artwork is always the hero. UI chrome must stay minimal and non-intrusive.
- Social features are additive — the app is fully explorable as a guest.
- Auth-gated actions prompt login gracefully without hard redirects that lose context.
- The artist upload flow and 3D generation must feel real even if fully mocked for the demo.
- Mobile-first layout is a product requirement, not a polish step.
- No real backend is required for the hackathon. All state lives in Zustand + localStorage.

## Target Tech Stack

- Next.js 16 with React 19 and TypeScript
- Tailwind CSS v4 for styling
- Zustand for auth and feed state
- Framer Motion for swipe gestures and page transitions
- react-hook-form for the artist upload form
- localStorage for auth persistence and mock data

No real database, no real API, no real file storage. All social actions are optimistic and persisted locally.

## Real Limitations

### Auth Limitations

- Auth is fully mocked. Credentials are stored in localStorage and never sent to a server.
- Role selection (viewer vs. artist) happens at registration and cannot be changed during the demo.
- There is no password reset, email verification, or session expiry.
- Multiple users can be simulated by logging out and registering a new account.

### Upload Limitations

- Image files are read as local object URLs. They are not uploaded to any server.
- The 3D generation pipeline is entirely simulated with a timed animation.
- Artworks posted by artists are added to the in-memory Zustand store and disappear on hard refresh unless localStorage persistence is added.
- Voice description generation is a UI-only toggle with placeholder text.

### Swipe Limitations

- Swipe gestures use Framer Motion drag. They are designed for touch but also work with mouse drag on desktop.
- The card deck renders three cards at a time for performance. It does not virtualise a large list.
- Swipe-right triggers a like action, which is auth-gated for guest users.

### Next.js Integration Limitations

- The project uses the App Router. All interactive components must be client components (`"use client"`).
- Zustand stores must be initialised client-side to avoid hydration mismatches with localStorage.
- Image files from the local filesystem should use `URL.createObjectURL` and be revoked on unmount.

## Target File Structure

```text
src/
  app/
    layout.tsx
    page.tsx                          # root redirect based on auth state
    globals.css
    onboarding/
      page.tsx                        # Screen 01 · Splash / Get started
    discover/
      page.tsx                        # Screen 02 · Swipe feed
    artwork/
      [id]/
        page.tsx                      # Screen 03 · Artwork detail
    login/
      page.tsx
    register/
      page.tsx                        # role selector: viewer | artist
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
      TopBar.tsx                      # LiveArt logo + action icons
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
    authStore.ts                      # Zustand: user, role, isGuest
    feedStore.ts                      # Zustand: artworks, likes, saved, filter
  lib/
    mockData.ts                       # Seed artworks (5-6 classic paintings)
    mockAuth.ts                       # Fake login, register, logout via localStorage
    types.ts                          # Artwork, User, Role, Like interfaces
  hooks/
    useAuth.ts
    useSwipe.ts                       # Touch and drag gesture helpers
    useLike.ts                        # Like toggle with auth guard
```

If exact files already exist later, adapt to the existing structure instead of creating duplicates.

## Data Models

### `src/lib/types.ts`

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
  categories: string[]        // e.g. ['Baroque', 'Portraits']
  imageUrl: string
  has3D: boolean
  description?: string
  likes: number
  likedBy: string[]           // User IDs
  savedBy: string[]           // User IDs
  createdAt: string
}

export interface AuthState {
  user: User | null
  isGuest: boolean
}
```

### Seed Data — `src/lib/mockData.ts`

The seed collection includes:

- Girl with a Pearl Earring · Vermeer · 1665 · The Hague · Oil on canvas · Baroque · Portraits · 3D ready
- Judith Beheading Holofernes · Caravaggio · 1602 · Galleria Nazionale, Rome · Oil on canvas · Italian Baroque
- Mona Lisa · da Vinci · 1503 · Louvre, Paris · Oil on panel · Renaissance · Portraits · 3D ready
- The Starry Night · van Gogh · 1889 · MoMA, New York · Oil on canvas · Post-Impressionism
- The Birth of Venus · Botticelli · 1484–1486 · Uffizi, Florence · Tempera on canvas · Renaissance

All categories used in the seed data must match the pill labels in `CategoryFilter`.

## Auth Flow and Permissions

| Action | Guest | Viewer | Artist |
| --- | --- | --- | --- |
| Browse discover feed | Yes | Yes | Yes |
| View artwork detail | Yes | Yes | Yes |
| Like a painting | No → prompt login | Yes | Yes |
| Save an artwork | No → prompt login | Yes | Yes |
| Comment (future) | No → prompt login | Yes | Yes |
| Post an artwork | No → prompt login | No | Yes |
| See upload button | No | No | Yes |
| Edit own post (future) | No | No | Yes |

### Auth Implementation Rules

- `authStore` holds `{ user, isGuest }` and is initialised from localStorage.
- Attempting a social action as a guest slides up `AuthModal` without losing the current page.
- After login inside `AuthModal`, the pending action (like, save) is replayed immediately.
- Logout clears the store and returns to the discover feed in guest mode.
- Role is set at registration and stored in the user object in localStorage.

## Screen-by-Screen Breakdown

### Screen 01 — Onboarding (`/onboarding`)

- Full-bleed artwork background image that fades softly.
- Small caps tag: `A NEW WAY TO SEE ART`.
- Headline: **Step closer to the canvas.** in serif heavy italic.
- Sub-copy: Scan any work in the museum to see it in 3D. Discover new artists. Listen to every painting.
- **Get started** black pill CTA → `/register`.
- *Already have an account? Sign in* link → `/login`.
- Guest entry: small *Browse without signing in* text link → `/discover`.

### Screen 02 — Discover Feed (`/discover`)

- `TopBar`: LiveArt wordmark, `?` help icon, filter icon.
- `CategoryFilter`: horizontally scrollable pill bar (All · Baroque · Renaissance · Portraits · New 3D).
- `SwipeDeck`: stack of three visible cards.
  - Each card shows the artwork image, museum and year tags, a `3D READY` badge when applicable, artist name, title, and medium.
  - Swipe left = pass.
  - Swipe right = like (auth-gated for guests).
  - Tap card = open artwork detail page.
- `ActionBar` below the deck: ✗ pass · red 3D cube · ♥ like.
- `GuestBanner` at the bottom when the user is a guest.
- `BottomNav`: Feed · Discover · 3D · Saved · You.

### Screen 03 — Artwork Detail (`/artwork/[id]`)

- Full-bleed artwork image occupying the top 55 percent of the viewport.
- Back arrow (top left), bookmark (top right), share icon (top right).
- Category tag · title in bold serif · artist name · museum.
- **View in 3D** dark pill button when `has3D` is true.
- Floating `?` information button.
- Metadata row: medium on the left, dimensions on the right.
- `LikeButton` — shows count, auth-gated for guests.
- Description text when available.

### Screen 07 — Artist Upload (`/artist/upload`)

- Close ✗ button (top left) + `Draft` label (top right).
- Image picker zone showing file name, size, and a **Replace** button after selection.
- Form fields in this order: TITLE · MEDIUM · YEAR · DESCRIPTION.
- Two toggle switches:
  - *Generate 3D version* (sub-label: AI depth pass · ~2 min) — default on.
  - *Voice description* (sub-label: Auto-generated, editable) — default on.
- **Publish to LiveArt** red pill CTA.
  - If 3D toggle is on → navigate to `/artist/generating`.
  - If 3D toggle is off → add artwork to `feedStore` directly and navigate to the artwork detail page.

### Screen 08 — Generating 3D (`/artist/generating`)

- Close ✗ button.
- `GENERATING 3D` header in small caps.
- Floating artwork image with subtle shadow animation.
- Headline: **Lifting the canvas** *off the wall.*
- Progress bar (animated from 0 to 100 over ~5 seconds).
- Percentage counter + estimated time remaining.
- Step checklist (each step transitions through pending → in-progress → done):
  1. Color analysis
  2. Edge detection
  3. Depth estimation
  4. Mesh generation
  5. Texture baking
- On completion → artwork added to `feedStore` → navigate to `/artwork/[id]`.

## Social Feature Details

### Like System

- `useLike(artworkId)` checks auth state before acting.
- If guest → open `AuthModal` with context ("Sign in to like this artwork").
- If logged in → toggle like in `feedStore` and persist to localStorage.
- `LikeButton` shows filled heart + count when liked, outline heart when not liked.
- Swipe-right on a card calls the same `useLike` logic.

### Save System

- Works identically to the like system.
- Saved artworks appear in the `/saved` page as a grid.
- Bookmark icon on the artwork detail page reflects saved state.

### Feed and Filtering

- `feedStore` initialises from `mockData.ts` seed artworks.
- Artworks posted by artists during the session are prepended to the feed.
- `CategoryFilter` selection is stored in `feedStore` as `activeCategory`.
- `SwipeDeck` derives its card list from the filtered feed, excluding already-swiped cards for the current session.

## Design Tokens

All design tokens are defined in `globals.css` using Tailwind CSS v4 custom properties.

| Token | Value | Usage |
| --- | --- | --- |
| `--color-background` | `#F5F0E8` | Page and card backgrounds |
| `--color-primary` | `#C0392B` | CTA buttons, active icons, progress bar |
| `--color-text` | `#1A1A1A` | Body and headline text |
| `--color-muted` | `#5A5A5A` | Metadata and secondary labels |
| `--color-surface` | `#FFFFFF` | Card surfaces |
| `--color-border` | `#E0D8CC` | Dividers and input borders |
| `--font-serif` | Playfair Display | Headlines and artwork titles |
| `--font-sans` | Inter | All body copy and UI labels |
| `--radius-card` | `12px` | Card corners |
| `--radius-pill` | `9999px` | Buttons, filter pills, badges |

## Implementation Phases

### Phase 1 — Foundation

**Objective**: Set up the project shell, design tokens, fonts, and shared layout components.

**Steps**:

1. Install additional dependencies: `zustand`, `framer-motion`, `react-hook-form`.
2. Define `src/lib/types.ts` with all interfaces.
3. Add design tokens to `globals.css` using Tailwind CSS v4 `@theme` block.
4. Add Google Fonts imports for Playfair Display and Inter.
5. Build `src/app/layout.tsx` with font classes and a providers wrapper.
6. Build `BottomNav.tsx` shell (five tabs, no active state yet).
7. Build `TopBar.tsx` shell (logo + icon placeholders).
8. Build `src/app/page.tsx` that redirects to `/onboarding` or `/discover` based on `authStore`.

**Done when**:

- `npm run dev` starts at port 3002.
- The app renders the cream background with the correct fonts.
- Bottom navigation and top bar appear.

### Phase 2 — Auth

**Objective**: Implement mock login, registration, role selection, and guest mode.

**Steps**:

1. Create `src/store/authStore.ts` with Zustand and localStorage persistence.
2. Create `src/lib/mockAuth.ts` with `login`, `register`, and `logout` functions.
3. Build `src/app/onboarding/page.tsx` (splash screen, Screen 01).
4. Build `src/app/login/page.tsx` with email and password fields.
5. Build `src/app/register/page.tsx` with role selection (viewer | artist) card toggle.
6. Build `AuthModal.tsx` as a bottom-sheet overlay triggered by auth-gated actions.
7. Create `useAuth.ts` hook exposing `user`, `isGuest`, `login`, `logout`, `register`.

**Done when**:

- Register as a viewer and be taken to the discover feed.
- Register as an artist and see the upload entry point.
- Log in as either role and have state persist through a browser refresh.
- Attempt to like a painting as a guest and see `AuthModal` appear.

### Phase 3 — Discover Feed

**Objective**: Build the swipe deck, category filter, and action bar.

**Steps**:

1. Create `src/lib/mockData.ts` with five seed artworks.
2. Create `src/store/feedStore.ts` with Zustand.
3. Build `CategoryFilter.tsx` with horizontal scroll and active pill state.
4. Build `ArtworkCard.tsx` with image, tags, badges, title, and artist.
5. Create `useSwipe.ts` hook wrapping Framer Motion drag for left/right detection.
6. Build `SwipeDeck.tsx` rendering three stacked cards with drag-to-swipe.
7. Build `ActionBar.tsx` with pass, 3D, and like buttons.
8. Build `GuestBanner.tsx` shown at the bottom when `isGuest` is true.
9. Assemble `src/app/discover/page.tsx` with all components.

**Done when**:

- Cards swipe left and right smoothly on touch and mouse.
- Swipe-right triggers a like (with auth guard for guests).
- Category filter updates the deck.
- The action bar buttons replicate the swipe actions.

### Phase 4 — Artwork Detail

**Objective**: Build the artwork detail page with like and save functionality.

**Steps**:

1. Build `src/app/artwork/[id]/page.tsx` with dynamic routing.
2. Build `ArtworkDetail.tsx` with the full image hero, metadata, and action buttons.
3. Create `useLike.ts` with auth guard.
4. Build `LikeButton.tsx` showing count and filled/outline state.
5. Wire bookmark icon to `feedStore` save action.
6. Add **View in 3D** button (stub or placeholder modal for now).
7. Add back navigation using Next.js router.

**Done when**:

- Tapping a card opens the correct artwork detail.
- Like and save toggle correctly for logged-in users.
- Guests see `AuthModal` on like or save attempts.
- Back navigation returns to the discover feed.

### Phase 5 — Artist Upload Flow

**Objective**: Build the new work form, 3D generation screen, and feed injection.

**Steps**:

1. Add an upload entry point (plus icon in `BottomNav` or button on `/profile`) visible only to artists.
2. Build `src/app/artist/upload/page.tsx` and `UploadForm.tsx` using `react-hook-form`.
3. Add image picker with local file preview using `URL.createObjectURL`.
4. Add form fields: title, medium, year, description.
5. Add toggle switches for 3D generation and voice description using controlled inputs.
6. Add **Publish to LiveArt** CTA with form validation.
7. On submit with 3D on → navigate to `/artist/generating` with artwork data in store.
8. Build `GeneratingProgress.tsx` with animated progress bar and step checklist.
9. Build `src/app/artist/generating/page.tsx` using `GeneratingProgress`.
10. On generation complete → prepend artwork to `feedStore` → navigate to `/artwork/[id]`.

**Done when**:

- An artist can fill the form, tap Publish, and watch the 3D generation animation.
- The published artwork appears at the top of the discover feed.
- Guests and viewers cannot access the upload route.

### Phase 6 — Profile and Saved

**Objective**: Build the profile page and saved artworks grid.

**Steps**:

1. Build `src/app/profile/page.tsx` showing user name, role badge, post count, and like count.
2. Show the user's posted artworks grid for artist accounts.
3. Add logout button.
4. Build `src/app/saved/page.tsx` showing saved artworks in a two-column grid.
5. Empty states for no posts and no saved artworks.

**Done when**:

- Profile shows correct user data for viewers and artists.
- Saved page shows all bookmarked artworks.
- Logout returns to guest mode on the discover feed.

### Phase 7 — Polish and Transitions

**Objective**: Add page transitions, micro-interactions, and mobile refinements.

**Steps**:

1. Add Framer Motion `AnimatePresence` page transitions between routes.
2. Animate the `AuthModal` slide-up with spring easing.
3. Add press feedback to buttons (scale down on tap).
4. Animate the category filter pill sliding underline or fill.
5. Animate the like heart with a pop scale on toggle.
6. Animate the `GuestBanner` entrance.
7. Run a full mobile audit at 390px viewport width.
8. Verify `BottomNav` is safely above the iOS home indicator with `pb-safe`.
9. Verify tap targets are at least 44px in height.

**Done when**:

- All route transitions are smooth.
- Like and save interactions have satisfying micro-animation.
- The layout is clean and usable on a 390px iPhone viewport.

## Key Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Zustand localStorage hydration mismatch | Initialise store lazily client-side using `useEffect` or Zustand `persist` middleware with `skipHydration` |
| Swipe gesture conflicts with scroll | Constrain drag axis to horizontal only on the card deck and use a vertical scroll container for the rest of the page |
| Image object URLs leaking memory | Call `URL.revokeObjectURL` in the upload form cleanup on unmount |
| Guest state lost on hard refresh | Persist `isGuest: true` in localStorage as part of the `authStore` slice |
| Artist uploads disappearing on refresh | Persist the `feedStore` artworks array (minus the imageUrl blob) to localStorage, or note this as a known demo limitation |
| Role restricted routes accessible by URL | Add a redirect guard in each protected page that checks `authStore` on mount |
| Framer Motion swipe threshold too sensitive | Tune `dragElastic` and use velocity plus offset threshold together to decide swipe direction |
| Empty deck when all cards are swiped | Add a reset button or loop the deck silently for demo purposes |
| AuthModal losing context of the triggering action | Store the pending action in a `pendingAction` field in `authStore` and replay it after login |
| Mobile viewport height jumping on keyboard open | Use `dvh` units instead of `vh` for full-height layouts on mobile |

## Definition of Done

The social artify frontend is done when:

- `/onboarding` presents the splash screen with Get started and Sign in entry points.
- `/discover` shows a swipeable card deck with category filtering.
- Swipe right and the action bar like button are auth-gated for guests.
- `/artwork/[id]` shows full artwork detail with like, save, and View in 3D.
- `/login` and `/register` work with mock auth and localStorage persistence.
- Role selection at register determines artist vs. viewer capabilities.
- An artist can open the upload form, fill it, publish, watch the 3D generation animation, and see the artwork in the feed.
- `/profile` shows user data and posted artworks for artists.
- `/saved` shows bookmarked artworks.
- Guest mode allows full browsing but prompts login on social actions.
- `AuthModal` slides up in-context without losing the current page.
- The layout is usable on a 390px mobile viewport.
- Design tokens (cream background, red CTA, serif headlines) are consistent across all screens.
- `npm run build` passes with no type errors.
