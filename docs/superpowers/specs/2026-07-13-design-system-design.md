# PropWeb — Design System (3 core screens)

**Date:** 2026-07-13
**Scope:** The visual design system + the 3 core screens (Home/search, Results list+map, Listing detail). This is the foundation the remaining 8 wireframes and the demo web app both inherit. Grounded in Handover Brief §6/§8 and the reference card in `References/Listing Card.jpg`.

**Design mandate (from brief):** Bayut-inspired calm/clarity — generous whitespace, card-based, map-right on desktop — but NOT a Bayut clone. Trust marks are the hero on every screen. Where NoBroker feels cluttered/upsell-heavy, PropWeb feels calm and verified. Every trust claim is tappable.

---

## 1. Color system

| Token | Hex | Role |
|---|---|---|
| Moontint | `#F3F6FF` | Page background — calm, airy |
| Blue harbor | `#3770BF` | Primary CTA, links, active states |
| Ice blue | `#8DC2FF` | Secondary surfaces, info chips, hover |
| Lime glow | `#C3EA4F` | **Verified badges + Trust Score (high)** — the trust color |
| Graphite | `#1B1E23` | Primary text |
| Cool grey | `#5B6470` | Secondary / muted text |
| Line | `#DDE3EE` | Borders, dividers, card edges |
| White | `#FFFFFF` | Cards, elevated surfaces |

**Color-role rules:**
- **Lime = trust only** (verified badges, high Trust Score). Never a button color.
- **Blue harbor = action** (CTAs, links). Blue does the "action" work, lime does the "trust" work — they never compete.
- **One primary (blue) action visible per screen.**
- Text is graphite `#1B1E23`, never pure black.

**Trust Score scale** (score range 35–98, so it visibly matters):
- 75–98 → lime glow `#C3EA4F` (strong)
- 50–74 → amber `#E8A13D` (medium)
- 35–49 → muted red `#E5533D` (weak)

**Pending-verification state:** amber `#E8A13D` (owner KYC "pending" → flips to lime "Verified").

## 1a. Typography

- **Display font: Manrope** (weights 600/700/800) — brand wordmark, headings, card titles, rent/price. Premium, geometric.
- **Body/UI font: Inter** (weights 400–700) — all other text (addresses, chips, badges, buttons, labels). **Line-height 24px.**
- Load via Google Fonts in the demo app; system-ui fallback for both.

## 2. Icons

**Phosphor Icons** library throughout (single icon family, consistent weight). Examples in use: `MapPin`, `MagnifyingGlass`, `Bed`, `Ruler`, `Armchair`, `ShieldCheck`.

## 3. Core components

**Verified badge** — most-repeated element.
- Scalloped / spiked seal (Twitter/Instagram verified style) with a tick inside + "Verified" text.
- Lime glow `#C3EA4F` fill, graphite tick/text.
- Variants: `Verified Owner`, `Verified Tenant`.
- Tappable → popover: *what* was verified (Aadhaar/PAN, ownership proof) + *when*.
- Pending state: amber outline, "Verification pending."

**Trust Score token** — display style DEFERRED (ring vs. single number, decide later). Spec the rest so nothing depends on that choice.
- Value 35–98, colored by the Trust Score scale above.
- Tappable → Trust Score explainer (verification + response rate + freshness + reviews).
- Appears on every listing card and the detail header.

**Listing card** (adapted from `References/Listing Card.jpg`):
- Rounded white card, soft shadow, `Line` border, generous padding.
- Photo on top with carousel dots.
- Photo overlay: Trust Score token (top-left) + Match % chip (top-right).
- Rent bold `₹35,000` + "/mo" muted → `2BHK · Koramangala` + address with `MapPin`.
- Feature-chip row (bordered pills, Phosphor icons): `Ruler` area · `Bed` BHK · `Armchair` furnishing.
- Footer: Verified Owner seal (left) · freshness "2 days ago" (right).
- Full-width blue-harbor **View Details** button; whole card tappable.

**Match % chip:** ice blue `#8DC2FF` bg, graphite text ("92% match"). Tappable → Match Score breakdown (budget ✓ locality ✓ furnishing ✓ …).

**Buttons:** Primary = blue harbor fill, white text. Secondary = white fill, blue-harbor border + text.

**Trust-promise strip** (home only): calm band on moontint — "No brokers · No fake listings · No spam calls" with small icons.

## 4. The 3 core screens

Mobile-first @390px, then desktop. Map-right on desktop.

**Screen 1 — Home / search**
- Top: logo + city selector (Bengaluru) + `MagnifyingGlass`.
- Hero: locality search bar + quick filters (BHK · budget · family/bachelor).
- Trust-promise strip on moontint.
- Row of 2–3 featured listing cards.
- Desktop: centered wider hero; mobile: stacked, full-width search.

**Screen 2 — Search results (list + map)**
- Desktop: split view — scrollable card list left (~60%), sticky Leaflet map right (~40%) with price pins; hovering a card highlights its pin.
- Mobile: list view + floating "Map" toggle → full-screen map.
- Top: filter bar (locality, budget, BHK, furnishing, tenant type) + result count.
- Uses the listing card.

**Screen 3 — Listing detail**
- Photo gallery (carousel) at top.
- Header: rent, `2BHK · Koramangala`, Trust Score token + Verified Owner seal (both tappable).
- Amenities grid (Phosphor icons). Trust Score breakdown section (tappable → explainer).
- Owner card — masked: name + Verified Owner seal, phone `+91 ●●●●● ●●●●●`, sticky **Connect** CTA (blue harbor) → pay-to-connect modal.
- Desktop: two columns — gallery + details left, sticky owner/Connect card right. Mobile: stacked, Connect CTA pinned to bottom.

## 5. Deferred decisions
- **Trust Score display:** ring vs. single number — decide during wireframing.

## 6. Note on the existing deck
This palette replaces the KT/Pitch-v2 teal+sand. The existing 9-slide `PropWeb_Pitch_v2.pptx` will need reskinning to this system for visual consistency (tracked as later work, not part of this design).
