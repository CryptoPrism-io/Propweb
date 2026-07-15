# Desktop Navbar + Hero — Design Spec

Reference: `References/deskstop hero.jpg` (Bayut desktop homepage). Goal: copy the navbar/hero
**separation pattern** and search-card layout exactly; content stays PropWeb's own (rentals-only,
no ML/AI backend — PLAN.md hard constraint).

## Scope
- `Navbar` component: new `lg:` (1024px+) desktop variant, applied site-wide.
- `Home` page hero: new `lg:` desktop layout.
- New `HeroSearchCard` component (desktop only, rendered inside `Home`'s hero).
- New shared `lib/searchFilters.ts` (extracted from `SearchPanel`, reused by `HeroSearchCard`).
- Mobile (`<lg`) behavior is unchanged everywhere — this is additive, not a rewrite.
- Out of scope: restyling Results/ListingDetail/wizard pages for desktop, real AI/NLP, video CTA.

## Responsive strategy
`lg:` Tailwind variants inside the existing components. No viewport-detection hook, no separate
mobile/desktop component tree — consistent with existing `sm:`/`lg:` usage elsewhere (e.g.
`ListingCard` grid). No SSR in this app (Vite CSR), so no hydration-mismatch risk.

## Navbar — desktop (`lg+`)
- Solid white, `border-b border-line`, **static** (normal flow, not `absolute`) — this is the key
  fix: navbar and hero become two separate stacked sections instead of an overlay.
- `h-20`, `max-w-7xl` container (wider than mobile's `max-w-5xl`), `px-8`.
- Layout, left to right:
  1. Logo — always graphite/blue harbor (no more transparent/"onHero" white-text branch needed at
     this size, since the bar is never transparent here).
  2. Direct nav links, immediately after the logo: **Browse rentals · How it works · Trust &
     verification · Pricing**. Inter 14/600 graphite, hover → blue harbor.
  3. Far right: hamburger icon button + "Sign in" button (existing pill style). Hamburger opens the
     same slide-in drawer already built (all 7 items, including the 3 not promoted to the bar).
- Below `lg`: unchanged (transparent/absolute overlay, 3-col hamburger/logo/sign-in grid, as today).

## Home hero — desktop (`lg+`)
- Hero image: full-bleed edge-to-edge (existing absolute-image-in-relative-section pattern already
  achieves this). Drop `rounded-b-2xl` at `lg+` to match the reference's flush edges.
- Heading: left-aligned (was centered), ~48px, plus a new subheading line: *"Verified listings
  only. Direct from owners."* (own copy — analogous to Bayut's "Real Data. Real Brokers. Real
  Properties.").
- Below the heading: `HeroSearchCard` (new component), left-aligned, replacing the mobile's
  single "tap to open search" button at this breakpoint.
- No CTA pill below the card (Bayut's "Experience the Journey" links to a video we don't have —
  cut, not a placeholder).
- Below `lg`: unchanged (centered heading, single search button opening the existing full-screen
  `SearchPanel`).

## `HeroSearchCard` (new, desktop only)

White rounded card, overlapping the hero image bottom edge, mirroring the reference's structure:

1. **Tab row** (Bayut-style pills, first active):
   - **Rentals** (default/active) — a real tab: shows the two tenant-side search bars below.
   - **Owners** — also a real tab (not a plain link): shows the owner-side AI search bar
     (see Addendum below). A small secondary link under it still offers the direct route to the
     listing wizard: "or list your property instead →" → `/owner/new`.
   - **Tenants** — stays a direct link (no search UI needed) → `/tenant/verify`.

## Addendum (2026-07-15): mocked AI search + owner→tenant search direction

Two additions on top of the above, both still rule-based/mocked — no real ML/NLP, per PLAN.md.

**1. Mocked "AI thinking" sequence.** Both AI bars (tenant-side on the Rentals tab, owner-side on
the Owners tab), instead of navigating immediately on submit, show a brief staged sequence of
status lines (e.g. "Reading your request…" → "Matching verified listings…" → "Found your
matches"), then navigate. Implemented as a small reusable `useAiThinking` hook (steps array +
`onDone` callback), driven by `setTimeout`, ~550ms per step. Purely cosmetic — the actual
rule-based parsing (`parseAiQuery`/`parseOwnerAiQuery`) already ran synchronously before the
sequence starts; the "thinking" is a UI-only delay to sell the AI framing for the pitch.

**2. Owner-side AI search for tenants.** A tenant-search-for-listings AI bar already existed
(Rentals tab). This adds the mirror direction: an owner types something like *"Tenants near me
willing to pay ₹30k min rent"*; `parseOwnerAiQuery` extracts `{ locality?, minRent? }` using the
same keyword/regex approach as `parseAiQuery`; after the thinking sequence, navigates to a new
`/owner/matches?locality=...&minRent=...` route.

- **New mock data:** `public/data/tenants.json` — a pool of 10 `TenantProfile` records (reusing
  the existing type as-is) spanning all 5 localities, budgets ₹15k–85k, mixed family/bachelor and
  furnishing preferences. (The existing `tenant.json` stays as the single demo *tenant's own*
  profile used elsewhere in the app; `tenants.json` is the separate pool owners search over.)
- **New scoring function**, `tenantMatchScore(tenant, { locality?, minRent? })` in
  `lib/matchScore.ts`, mirroring `matchScore`'s weighting style: locality match 50% (full if the
  tenant prefers the queried locality, or no locality was given), rent-willingness 50% (full if
  `tenant.budgetMax >= minRent`, linearly reduced to 0 at 50% under, or full if no `minRent`
  given).
- **New page**, `OwnerMatches` at `/owner/matches`: loads the tenant pool, ranks by
  `tenantMatchScore` descending, renders tenant cards (name, budget range, preferred localities,
  tenant type, furnishing) each with the existing `MatchChip` showing the score.
2. **AI search bar (mock)** — single input + "Ask AI" button (sparkle icon), placeholder text:
   *"Try asking for '2BHK under ₹35k in Koramangala, furnished'"*. On submit: simple keyword
   parsing against the known vocab (`LOCALITIES`, `BHKS`, `FURNISH`, `TENANTS` from
   `lib/searchFilters.ts`) — same rule-based matching PropWeb already uses, just framed as AI in
   the UI. Builds the same query params as manual search and navigates to `/results`. No real
   NLP/LLM call — PLAN.md is explicit that only rule-based matching is in scope.
3. **Manual filter search bar** — the existing `SearchPanel` fields (location, BHK, budget,
   furnishing, tenant type) laid out inline as a second row instead of a full-screen takeover.
   Search button navigates directly to `/results?...`.

Only the **Rentals** tab is interactive beyond navigation (Owners/Tenants are just links styled as
tabs — no separate content panel to build for them here, that content already exists at their
target routes).

## Shared filter data — `lib/searchFilters.ts`
Extract `LOCALITIES`, `BHKS`, `FURNISH`, `TENANTS` (currently inline in `SearchPanel.tsx`) into
this new module. Both `SearchPanel` (mobile) and `HeroSearchCard` (desktop) import from it —
avoids drift between the two search UIs' vocabularies.

## Testing
- Existing `SearchPanel`/mobile tests unaffected (no behavior change below `lg`).
- New: `HeroSearchCard` renders three tabs, Rentals active by default; Owners/Tenants links point
  to the right routes; AI bar keyword-parses at least locality + BHK correctly; manual bar submit
  produces the same query params as today's mobile `SearchPanel`.
