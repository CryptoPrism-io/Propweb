# PropWeb — Pitch Deck (Deliverable 1) Design

**Date:** 2026-07-14
**Scope:** Extend `docs/PropWeb_Pitch_v2.pptx` from 9 slides to a 16-slide, two-act deck with presenter notes on every slide. Deliverable 1 of 4 (Deck · Wireframes · Costing slides · Demo app). Grounded in Handover Brief §4 (slide outline), §5 (tech summary), §7.1–7.2 (budget/hiring), §2 (context/numbers).

**Explicit decision (overrides the 2026-07-13 design-system lock for this deliverable only):** the deck keeps its own existing **teal+sand** identity (`#0E6E5C` teal, `#F2F7F5` sand/mint, `#141821` graphite, `#5A6270` cool grey, `#E8A13D` amber, Calibri). It does **not** adopt the Moontint/Blue harbor/Lime glow + Manrope/Inter system used by the wireframes and demo app. The deck and the demo app are accepted to look like two different surfaces of the same pitch — the demo app is the live product-quality proof; the deck is the narrative document. Do not reskin the pptx to the locked system as part of this work.

**Build method:** extend the real `.pptx` in place via `python-pptx` / direct OOXML editing, matching the existing shape/font/color grammar exactly. Output stays a single `.pptx` file, opens as-is in PowerPoint/Keynote/Google Slides.

**Out of scope:** the standalone "2 costing slides" deliverable (PLAN.md deliverable 3) — that reproduces Brief §7 tables as its own slide-set later. This deck's own budget slide (14) is a summary view, not that deliverable.

---

## 1. Visual grammar (extracted from the existing 9 slides — do not deviate)

| Token | Value | Use |
|---|---|---|
| Teal | `#0E6E5C` | Eyebrow labels, big stat numbers, bold inline emphasis on light slides |
| Deep teal | `#0A4A3E` | Rare secondary accent (gradients/emphasis variation) |
| Sand | `#F2F7F5` | Card fill |
| Sand line | `#D8DEE4` | Card border (1px, `prstDash solid`) |
| Graphite | `#141821` | Slide background (dark slides), H1/H2 text, bold emphasis text |
| Cool grey | `#5A6270` | Body/muted text |
| Amber | `#E8A13D` | Dark-slide tagline accent; also used for "pending"-style emphasis |
| White | `#FFFFFF` | Light-slide background; text on dark slides |
| Light grey | `#C9D2D9` / `#8A94A0` | Subtext on dark slides (subtitle/footer) |

**Font:** Calibri only, everywhere. No other typeface.

**Slide canvas:** 12192000 × 6858000 EMU (13.33in × 7.5in, 16:9). Margins ~640080–868680 EMU (~0.7–0.95in) left/right.

**Recurring shape patterns (reuse, don't invent new ones):**
- **Dark slide** (title/closing only): bg `#141821`, big centered/left headline white 60pt bold, amber 26pt tagline, light-grey 16pt subcopy, footer 12pt `#8A94A0`.
- **Light slide header:** eyebrow (12pt bold teal, caps, `spc=300`) → H1 (30pt bold graphite).
- **2-column card grid** (problem slide pattern): roundRect `adj≈6061`, fill sand, border sand-line; card title 15pt bold graphite; card body 12.5pt cool-grey. Two columns at x=640080 / x=6309360, card width 5303520.
- **4-up stat row** (why-it-matters pattern): roundRect `adj≈3077`, same fill/border; big number 40pt bold teal, centered; label 12.5pt cool-grey centered below, inside the same card.
- **Inline mixed-emphasis paragraph:** body runs in cool-grey `#5A6270`, with bold graphite `#141821` runs for numbers/proper nouns inline in the same paragraph (used for the NoBroker stat callout).
- **Table** (existing slide 8 stack table): header row bold graphite on sand, body rows white/sand alternating, thin sand-line borders, 3 columns (Layer / Choice / Why it wins).
- **4-step horizontal flow** (How It Works pattern, slide 5): 4 equal cards left-to-right with "→" connector glyphs between, step number prefix ("01 · Verify").

New slide types needed (not yet in the deck, must follow the same grammar — spec'd per-slide below): a single large diagram/box slide (Architecture), a linear pipeline/flow slide (Trust pipeline), a horizontal phase timeline (Build phases), a role-sequence list (Team plan), a 3-column scenario table (Budget).

---

## 2. Slide-by-slide content

Each entry: **title / eyebrow**, key content (verbatim or lightly adapted from the Brief — no invented numbers), and the layout pattern to reuse. Presenter notes are specified separately in §3 (one paragraph of speaking guidance per slide, not just a repeat of the on-slide text).

### Act 1 — Product (slides 1–8)

1. **Title** — *(existing slide 1, unchanged content)* "PROPWEB / India's trust-first rental platform / Verified owners meet verified tenants — directly..." Dark slide.
2. **The problem** — *(existing slide 2, unchanged)* Tenant/owner pain grid, 3+3 cards.
3. **Why it matters** — *(existing slide 3, unchanged)* 4 stat cards (10–20, 20–50, #1, ₹0) + NoBroker FY24 callout.
4. **Market opportunity — NEW.** Eyebrow "THE OPPORTUNITY". H1: "A large market with an unsolved trust gap." 4-up stat row (reuse pattern from slide 3): India proptech **~USD 1.3–1.7B (2025)**, growing **12–19% CAGR**; Indian rental market **~USD 20B**; launch wedge **Bengaluru** (highest rental velocity + brokerage pain + digital readiness). Closing line: same tone as slide-3 callout — demand and willingness-to-pay are proven (NoBroker); PropWeb targets the trust gap within a market already growing double-digit.
5. **Our solution** — *(existing slide 4, unchanged)* 6 pillars.
6. **How it works** — *(existing slide 5, unchanged)* Verify → Match → Connect → Transact + live-demo note (kept in notes, not on-slide, as today).
7. **Where venture-scale value sits** — *(existing slide 6, unchanged)* Scam prevention / background checks / digital rent agreements. This slide plus slide 16 together carry the "moat" argument — no separate moat slide, per approved slide map.
8. **Business model** — *(existing slide 7, unchanged)* Today (connect/listing) vs Tomorrow (services marketplace).

### Act 2 — Technology (slides 9–16)

9. **Architecture — NEW.** Eyebrow "ARCHITECTURE". H1: "One well-organised building, not eleven services." Plain-language modular-monolith framing: a single well-structured application (API + web + jobs) behind one deployment, organized into clear modules (listings, trust/KYC, matching, payments/connect) — not a premature microservices sprawl. Visual: single large sand card labeled "PropWeb — modular monolith" containing 4 smaller labeled sub-blocks (Listings & Search, Trust & KYC, Matching Engine, Connect & Payments), each a small roundRect in the teal-on-sand style. One line under it: "Small team, one codebase, one language (TypeScript) — ship fast without distributed-systems overhead."
10. **The stack (with why) — expand existing slide 8's table**, dropping the budget line (budget gets its own slide 14 now). Full Layer/Choice/Why table from Brief §5 (Frontend/Backend/Database/Search/Maps/Cloud/Payments/Call masking/KYC APIs/Agreements — 10 rows, Brief §5 has more detail than the current 8-row table). Add the two cost-trap callouts explicitly: Typesense ≈$69/mo vs Algolia ≈$525/mo; Google Maps free-tier now, flagged for post-2027 pricing risk (Ola Maps/MapmyIndia as the Indian-locality-data hedge).
11. **The trust pipeline — our crown jewel — NEW.** Eyebrow "THE TRUST PIPELINE". H1: "Verification, the legal way." Linear pipeline (reuse the 4-step "How it works" flow pattern): **Identity** (Aadhaar offline XML / DigiLocker) → **PAN check** (₹1–3/check via KYC API partner) → **Ownership proof** (property tax receipt / electricity bill / sale deed — manual review) → **Badge issued** (Verified Owner / Verified Tenant). Legal callout box (amber-bordered, matches the "pending" visual language already defined in DESIGN.md's amber usage — reuse card pattern with amber border instead of sand-line): "Private companies cannot call Aadhaar eKYC APIs directly (Supreme Court, Puttaswamy 2018). PropWeb only uses the legal routes: Aadhaar offline XML, DigiLocker, or a licensed KYC partner." This is the one fact that must not be gotten wrong on stage (Brief §5) — it gets its own emphasized box, not a footnote.
12. **Build phases — NEW.** Eyebrow "ROADMAP". H1: "Four phases, one city first." Horizontal 4-up timeline (reuse 4-step flow pattern with step-number prefixes): **Phase 0 · Setup** (weeks 0–4) → **Phase 1 · MVP, one city** (months 1–4) → **Phase 2 · Depth** (months 4–9) → **Phase 3 · Services + multi-city** (months 9–15). One line each from Brief §4 (Act 2 outline) — keep terse, this is a timeline not a feature list.
13. **Team plan — NEW.** Eyebrow "TEAM". H1: "Small team, sequenced hiring." Reuse the 2-column-card or stacked-row pattern for the 3 hiring-sequence stages from Brief §7.2: Months 1–3 (founding full-stack engineer ₹2L/mo + contract designer ₹75k/mo ≈ ₹2.75L/mo) → Months 4–6 (+ backend ₹1.6L/mo + frontend ₹1L/mo ≈ ₹5.35L/mo) → Months 7–12 (+ QA/ops ₹70k/mo + fractional DevOps ₹60k/mo ≈ ₹6.65L/mo). Closing line: "12-month payroll: ₹55–65 lakh" (Brief §4).
14. **The budget — NEW.** Eyebrow "BUDGET". H1: "Three scenarios, months 0–12." 3-column table/card layout — Lean / Base / Comfortable, reproducing Brief §7.1 exactly (Engineering payroll, CTO+CPO cash, Cloud & infra, Third-party APIs, Tools & licenses, Contingency ~15%, TOTAL: ₹68L / ₹1.14Cr / ₹1.78Cr). Reuse the existing table-shape grammar from old slide 8, 4 columns (line item + 3 scenarios) instead of 3.
15. **The ask & close — NEW.** Eyebrow "THE ASK". H1: "What we need from you, next 90 days." Content per Brief §4: the decision needed (approve budget scenario + hiring start), a next-90-days plan (Phase 0 setup + start of Phase 1 MVP build, founding engineer hired month 1), and what success looks like at month 12 (Brief §3.6 success metrics: 200+ verified listings/locality, >8% free-to-paid connect conversion, >40% contact-to-visit rate, >70% verified-listing share). Light-slide, sand card for the metrics, since this is a decision slide not a stat-flex slide.
16. **Closing** — *(existing slide 9, unchanged, moved from position 9 to 16)* Dark slide, "Existing portals sell leads. PropWeb sells trust." + 3 pillars (Trust-first / AI-native / Two revenue engines) + final tagline.

---

## 3. Presenter notes

None of the 9 existing slides currently have real presenter notes (only a stray page-number text run in each `notesSlide`). Every one of the 16 slides gets a genuine presenter-note paragraph:

- **Tone:** first-person, speaking to the two co-founder CEOs, plain language — the same tone as Brief §5's "you don't need to be an engineer to present this."
- **Content rule:** notes add *speaking* guidance (what to emphasize, what question to expect, how to transition to the next slide) — they do not just restate the bullet text verbatim.
- **Must-not-fumble facts get an explicit note reminder** where relevant: the Puttaswamy/Aadhaar legal point (slide 11), the budget scenario framing (slide 14 — these are inputs to a CEO decision, not final pricing).
- Slide 6 keeps its existing "live demo available" note and expands it: this is the cue to physically switch to the demo app.

---

## 4. Technical approach

- Read/modify `docs/PropWeb_Pitch_v2.pptx` directly with `python-pptx` (structural shapes) — fall back to raw OOXML string templates for shapes python-pptx handles awkwardly (e.g. exact `roundRect adj` gradients, multi-run mixed-color paragraphs), following the exact patterns captured in §1, copied from the real slide XML already inspected (slides 1, 2, 3, 8, 9).
- New slides are inserted by copying an existing slide's XML structure (same shape scaffolding: eyebrow textbox, H1 textbox, card shapes, body textboxes) and replacing text/colors per §2 — this guarantees pixel-identical grammar rather than approximating it.
- Slide order in `ppt/presentation.xml`'s `sldIdLst` is rewritten once all 16 slides exist, so slide 9 (closing) ends up last.
- Presenter notes: each slide's `notesSlide{n}.xml` gets its real paragraph (replacing the placeholder run), matching the notes-master layout already in the file.
- No new media/images — matches the existing deck (no embedded images today).
- Verification: re-extract all 16 slides' text + notes after building (same script pattern used to read the deck during this design pass) and diff against §2/§3 content to confirm nothing was dropped or mis-colored. Also spot-check EMU math (no shape overflows the 12192000×6858000 canvas or the established margins).

## 5. Self-review

- No placeholders/TBDs — every number is sourced from Brief §2/§3/§5/§7; nothing invented.
- Internal consistency: budget slide (14) figures match Brief §7.1 exactly; team-plan slide (13) matches §7.2; no contradiction with the existing slide 8 numbers being retired.
- Scope: single deliverable (deck only), consistent with PLAN.md's deliverable list; costing-slides and wireframe deliverables explicitly excluded.
- Ambiguity resolved: deck palette explicitly stays teal+sand (not the locked wireframe system) — stated up top so it can't be misread later.
