# PropWeb — Project Plan (session memory)

**One-liner:** Package PropWeb — India's trust-first, AI rental platform (Bayut-grade quality, NoBroker-style direct model) — for an internal pitch to two co-founder CEOs. *"Existing portals sell leads. PropWeb sells trust."*

My role: build the pitch package. Not the real product.

## The box: exactly 4 deliverables (nothing else is in scope)
1. **Deck** — 16–18 slides, 2 acts (product 1–9, tech 10–16). Presenter notes on every slide.
2. **Wireframes** — 11 screens, mobile-first @390px then desktop. Trust marks are the hero.
3. **Costing slides** — 2 slides. Reproduce Handover Brief §7 tables. No new math.
4. **Demo web app** — clickable front-end, 3 journeys, local JSON only, deployed to a link.

## Hard OUT-of-scope (don't build)
No backend / DB / auth / real payments / AWS / native apps / ML (rule-based match only) / resale / multi-city. Demo app = local JSON only.

## Dependency order (how we avoid overwhelm)
3 core wireframes → **design system locked** → demo app tenant journey → remaining wireframes + owner journey → deck (mostly edits to existing v2) → costing slides.

- **Deck is lowest risk** — 9 solid slides already exist in `PropWeb_Pitch_v2.pptx`.
- **Demo app is highest risk/value** — the live walkthrough the whole pitch hangs on.

## Starting point (current)
Lock the **design system** via the 3 core wireframes: Home/search → Results (list+map) → Listing detail. These = Day-2 checkpoint, the demo's tenant journey, and the visual language everything inherits.

## The 11 wireframe screens (Brief §6)
Home/search · Results(list+map) · Listing detail · Pay-to-connect modal · Tenant onboarding · Tenant KYC · Owner listing wizard(4-step) · Owner KYC · Owner dashboard · Trust-Score explainer · Match-Score view.

## Demo app spec (Brief §8)
Vite+React or Next static export + Tailwind. `/data/listings.json` (25–30 Bengaluru listings ₹18k–85k, Trust Scores 35–98), owners.json, tenants.json. Leaflet + OpenStreetMap (no paid keys). Unsplash/Pexels local images. One demo tenant profile hardcoded. Match Score = budget 40% + locality 25% + family/bachelor 15% + furnishing 10% + move-in 10%.
Journeys: (1) tenant search→results→detail; (2) owner 4-step wizard→published; (3) trust badges + score everywhere, tappable.
Demo script: Koramangala 2BHK ₹35k → open 95-score listing → tap badge → Connect → mock pay → masked number → switch to owner → wizard → "pending" → flip "Verified" → close on Trust-Score explainer ("this is the moat").

## Facts I must not fumble
- **Legal:** private cos can't call Aadhaar eKYC directly (Puttaswamy 2018). Legal route = Aadhaar offline XML / DigiLocker / licensed KYC partner.
- **Budget (0–12mo):** Lean ₹68L · Base ₹1.14 Cr · Comfortable ₹1.78 Cr.
- **Design:** Bayut-inspired calm/clarity (whitespace, cards, map-right), NOT a clone. Every badge tappable → what was verified + when.

## Checkpoints (Brief §8.4) — 10-day timeline
Day2 deck skeleton + wireframes 1–3 · Day4 all wireframes + app scaffold running · Day7 journeys 1–2 clickable + deck 80% · Day9 full dry run · Day10 lock + deploy.

## Definition of done
Explain every slide and screen without Yogesh in the room.

## Known gaps
Two source files referenced but MISSING from `docs/`: the Solution-Pitch markdown (slide script) + 2 research reports (number sources). Flag to Yogesh.

## Design system (locked 2026-07-13)
Spec: `docs/superpowers/specs/2026-07-13-design-system-design.md`
Palette: Moontint `#F3F6FF` bg · Blue harbor `#3770BF` CTA/links · Ice blue `#8DC2FF` secondary · Lime glow `#C3EA4F` = trust (verified badges + high Trust Score) · Graphite `#1B1E23` text · Cool grey `#5B6470` muted · Line `#DDE3EE`.
Fonts: **Manrope** (display: brand/headings/titles/price) + **Inter** (body/UI, line-height 24px).
Rules: lime = trust only (never a button); blue = action; one blue CTA per screen. Icons = **Phosphor**. Verified badge = spiked seal + tick + "Verified". Listing card modeled on `References/Listing Card.jpg`. Trust Score display (ring vs number) = DEFERRED.
Mockup: `mockups/listing-screen-mobile.html` (mobile Results screen preview).
Existing v2 deck (teal+sand) must be reskinned to this later.

## Progress log

- [x] Demo app: added owner listing verification. Aadhaar Offline XML/DigiLocker and property-document controls are mocked for the pitch flow; owners can continue without uploads, while listings remain queued and hidden until verification is completed. The badge explains what was checked when tapped.
- [x] Read all docs, scoped the work, wrote PLAN.md + CLAUDE.md.
- [x] Brainstormed + locked design system (palette, components, 3 core screen layouts).
- [x] Design spec approved.
- [x] Wrote implementation plan for demo-app foundation + tenant journey (3 core screens).
  Plan: `docs/superpowers/plans/2026-07-13-demo-app-tenant-journey.md` (8 tasks, Vite+React+TS+Tailwind, app in `app/`).
- [x] Execute the plan (build the tenant journey).
- [x] Deck deliverable complete: `docs/PropWeb_Pitch_v2.pptx` extended from 9 to 16 slides (Act 1 Product
  1–8, Act 2 Technology 9–16), real presenter notes on every slide, teal+sand/Calibri grammar preserved.
  Built via a Python/python-pptx pipeline in `docs/deck_build/` (`build_deck.py` rebuilds it from
  `source.pptx`; `verify_deck.py` is the 11-check-group acceptance test, all passing).
  Plan: `docs/superpowers/plans/2026-07-14-pitch-deck-build.md`. Merged to master.
  Outstanding: a manual visual QA pass in PowerPoint/LibreOffice on slides 4, 10, 14 is recommended before
  the real pitch — the automated canvas-bounds check can't detect PowerPoint table auto-growth pushing
  content past its declared box.
- [ ] Later: owner journey + wizard/KYC (in progress elsewhere) · remaining wireframes · costing slides · deploy.
