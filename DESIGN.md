# PropWeb — Design System

The locked, repeated rules. Values are exact and taken from `mockups/listing-screen-mobile.html`. Full rationale lives in `docs/superpowers/specs/2026-07-13-design-system-design.md`.

---

## Colors

| Token | Hex | Used for |
|---|---|---|
| Moontint | `#F3F6FF` | Page background |
| White | `#FFFFFF` | Cards, elevated surfaces |
| Blue harbor | `#3770BF` | **Primary buttons, links, active state, map price-pin (active)** |
| Ice blue | `#8DC2FF` | Match-% chip background, secondary surfaces |
| Lime glow | `#C3EA4F` | **Verified badge; Trust Score high band (75–98)** |
| Amber | `#E8A13D` | Trust Score medium band (50–74); "pending verification" |
| Muted red | `#E5533D` | Trust Score low band (35–49) |
| Graphite | `#1B1E23` | Primary text; dark map pin |
| Cool grey | `#5B6470` | Secondary / muted text, icons in feature chips |
| Line | `#DDE3EE` | Borders, dividers, card edges |

**Rules (do not break):**
- **Lime = trust only.** Never a button, link, or generic accent.
- **Blue harbor = the single primary action** per screen. Nothing competes with it.
- Text is graphite `#1B1E23`, never pure black.
- **Trust Score text color:** graphite on lime & amber; **white on muted red** (contrast).

---

## Typography

Two families. Load both from Google Fonts.

| Role | Font | Weights |
|---|---|---|
| **Display** | Manrope | 600 / 700 / 800 |
| **Body / UI** | Inter | 400 / 500 / 600 / 700 |

**Base:** Inter, `line-height: 24px`, color graphite.
**Use Manrope only for:** brand wordmark, headings, card titles, rent/price. Everything else is Inter.

| Element | Font | Size | Weight | Color | Notes |
|---|---|---|---|---|---|
| Brand wordmark | Manrope | 20px | 800 | graphite (`WEB` = blue harbor) | letter-spacing 1.5px |
| Section heading (h1) | Manrope | 16px | 800 | graphite | |
| Card title | Manrope | 15px | 700 | graphite | |
| Rent / price | Manrope | 21px | 800 | graphite | `/mo` = 13px Inter, cool grey |
| Body / labels | Inter | 13px | 500–600 | graphite / cool grey | line-height 24px |
| Chips & badges | Inter | 12px | 700 | per component | |
| Button label | Inter | 15px | 700 | white / blue | |
| Muted meta (posted, address) | Inter | 12–13px | 600 | cool grey | |

---

## Radius & elevation

| Token | Value |
|---|---|
| Card radius | `16px` |
| Panel radius (trust strip, small blocks) | `14px` |
| Pill radius (buttons, chips, badges, tokens) | `999px` |
| Card shadow | `0 2px 12px rgba(27,30,35,.07)` |
| Overlay chip shadow (on photos) | `0 1px 4px rgba(0,0,0,.15)` |

---

## Cards

- Background white, `1px solid Line` border, radius **16px**, `overflow: hidden`, card shadow.
- **Photo:** height `186px`, `object-fit: cover`. Overlays: Trust Score token top-left (12px inset), Match chip top-right; carousel dots bottom-center.
- **Body padding:** `14px 15px 15px`.
- Vertical gap between cards: `16px`.
- Whole card is tappable → detail.

---

## Buttons

| Variant | Background | Text | Border | Padding | Radius | Font |
|---|---|---|---|---|---|---|
| **Primary** | Blue harbor | White | none | `13px` | 999px | Inter 15/700 |
| **Secondary** | White | Blue harbor | `1.5px` blue harbor | `11px 20px` | 999px | Inter 14/700 |

- Primary: full-width in cards; `:active` → `filter: brightness(.94)`.
- Icon + label: gap `7px`, icon ~18px (Phosphor bold/fill).
- Only one primary (blue) button visible per screen.

---

## Badges & chips

**Verified badge** (spiked seal + tick + label):
- Icon: Phosphor `SealCheck` (fill), 16px.
- Verified: bg lime glow, text graphite, padding `5px 11px`, radius 999px, Inter 12/700. Label `Verified Owner` / `Verified Tenant`.
- Pending: transparent bg, `1.5px solid Amber` border, amber text/icon, label "Verification pending".
- Tappable → what was verified + when.

**Trust Score token:**
- Icon: Phosphor `ShieldCheck` (fill), 14px + the number.
- Padding `5px 10px`, radius 999px, Inter 13/800, overlay shadow.
- Band color = background: lime (75–98) / amber (50–74) / muted red (35–49). Text graphite, **white on red**.
- Display style (ring vs number) still DEFERRED — currently a number pill.

**Match chip:** bg ice blue, text graphite, padding `5px 11px`, radius 999px, Inter 12/700. Reads `NN% match`.

**Feature chip:** `1px solid Line` border, no fill, padding `5px 11px`, radius 999px, Inter 12/600 cool grey; icon 15px graphite (Phosphor `Ruler`/`Bed`/`Armchair`).

**Filter chip:** white bg, `1px solid Line`, padding `7px 13px`, radius 999px, Inter 13/600 graphite. "Filters" variant: blue-harbor text.

---

## Icons

- **Phosphor only** (`@phosphor-icons/react` in app; `@phosphor-icons/web` in mockups).
- Weights in use: regular (`ph`), bold (`ph-bold`), fill (`ph-fill`).
- Common set: `SealCheck`, `ShieldCheck`, `MapPin`, `Bed`, `Ruler`, `Armchair`, `MagnifyingGlass`, `SlidersHorizontal`, `Prohibit`, `PhoneSlash`, `ArrowRight`.

---

## Trust strip (brand reassurance band)

White bg, `1px solid Line`, radius 14px, padding `11px 14px`. Items Inter 12/700 graphite; icons 17px blue harbor. Copy: "Verified only · No fakes · No spam calls".
