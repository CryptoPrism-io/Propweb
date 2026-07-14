# PropWeb Pitch Deck Build — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend `docs/PropWeb_Pitch_v2.pptx` from 9 slides to the 16-slide, two-act deck specified in `docs/superpowers/specs/2026-07-14-pitch-deck-design.md`, with real presenter notes on every slide, keeping the deck's existing teal+sand/Calibri visual grammar exactly.

**Architecture:** A small standalone Python build pipeline under `docs/deck_build/` — `deck_helpers.py` (reusable shape/notes/reorder primitives built on `python-pptx`, matching the exact colors/fonts/geometry observed in the source deck's OOXML), `build_deck.py` (one function per new/modified slide, orchestrated by `main()`, always rebuilding from a pristine source copy), `verify_deck.py` (plain-Python assertion checks used as the test cycle — no pytest dependency needed/available in this repo). Each task adds one slide-building function + one verification check + reruns the build, in TDD order (check fails → implement → check passes).

**Tech Stack:** Python 3, `python-pptx==1.0.2` (confirmed installed: `python -c "import pptx; print(pptx.__version__)"` → `1.0.2`). No other dependencies. Pure stdlib `zipfile`/`shutil` for the one-time source copy.

## Global Constraints

- Deck keeps its own **teal+sand** identity — do NOT use the Moontint/Blue harbor/Lime glow system from `DESIGN.md`. Colors: teal `#0E6E5C`, deep teal `#0A4A3E`, sand `#F2F7F5`, sand-line `#D8DEE4`, graphite `#141821`, cool grey `#5A6270`, amber `#E8A13D`, white `#FFFFFF`, light greys `#C9D2D9`/`#8A94A0`.
- Font: **Calibri only**, everywhere.
- Slide canvas: 12192000 × 6858000 EMU (16:9). No shape may exceed these bounds.
- No invented numbers — every figure traces to Handover Brief §2/§3/§5/§7 (already quoted verbatim in the spec and in this plan's task content).
- Every one of the 16 final slides must have a real presenter-note paragraph (not the placeholder page-number run that exists today).
- `build_deck.py` always rebuilds from `docs/deck_build/source.pptx` (a pristine, git-tracked copy of the original 9-slide deck) and overwrites `docs/PropWeb_Pitch_v2.pptx` — it is not incremental/idempotent-on-the-output, so re-running it after a manual PowerPoint edit of the output would clobber that edit. This is intentional for reproducibility; call it out if it ever matters.
- Out of scope: the standalone "2 costing slides" deliverable, wireframes, demo app. Do not touch `app/` (a separate session/agent is actively working there).

---

### Task 1: Build harness — helpers, orchestrator skeleton, verifier skeleton

**Files:**
- Create: `docs/deck_build/source.pptx` (pristine copy of the current 9-slide deck)
- Create: `docs/deck_build/deck_helpers.py`
- Create: `docs/deck_build/build_deck.py`
- Create: `docs/deck_build/verify_deck.py`

**Interfaces:**
- Produces (used by every later task): `deck_helpers.COLORS: dict`, `deck_helpers.hex_color(name_or_hex: str) -> RGBColor`, `deck_helpers.add_textbox(slide, x, y, cx, cy, text, size_pt=12.5, bold=False, color='graphite', align='l', anchor='ctr', spc=None, font='Calibri') -> shape`, `deck_helpers.add_mixed_textbox(slide, x, y, cx, cy, runs: list[dict], size_pt=14, align='l', anchor='ctr', font='Calibri') -> shape`, `deck_helpers.add_card(slide, x, y, cx, cy, fill='sand', border='sand_line', adj_raw=6061, border_w_emu=9525) -> shape`, `deck_helpers.set_dark_background(slide)`, `deck_helpers.set_light_background(slide)`, `deck_helpers.add_blank_slide(prs, light=True) -> slide`, `deck_helpers.add_header(slide, eyebrow_text, h1_text)`, `deck_helpers.set_notes(slide, text)`, `deck_helpers.get_slide_text(slide) -> str`, `deck_helpers.get_notes_text(slide) -> str`.
- Produces: `build_deck.SOURCE = 'docs/deck_build/source.pptx'`, `build_deck.OUTPUT = 'docs/PropWeb_Pitch_v2.pptx'`, `build_deck.build()`.
- Produces: `verify_deck.check(condition: bool, message: str)` (prints PASS/FAIL, raises `AssertionError` on failure), `verify_deck.find_slide_by_text(prs, substr: str) -> tuple[int, slide|None]`.

- [ ] **Step 1: Copy the pristine source deck**

```bash
mkdir -p docs/deck_build
cp docs/PropWeb_Pitch_v2.pptx docs/deck_build/source.pptx
```

- [ ] **Step 2: Write `deck_helpers.py`**

```python
"""Reusable primitives for building PropWeb deck slides that match the
existing teal+sand / Calibri visual grammar (see
docs/superpowers/specs/2026-07-14-pitch-deck-design.md section 1)."""

from pptx.util import Emu, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn

COLORS = {
    'teal': '0E6E5C',
    'deep_teal': '0A4A3E',
    'sand': 'F2F7F5',
    'sand_line': 'D8DEE4',
    'graphite': '141821',
    'grey': '5A6270',
    'amber': 'E8A13D',
    'white': 'FFFFFF',
    'grey_light': 'C9D2D9',
    'grey_dark': '8A94A0',
}

ALIGN = {'l': PP_ALIGN.LEFT, 'ctr': PP_ALIGN.CENTER, 'r': PP_ALIGN.RIGHT}


def hex_color(name_or_hex):
    return RGBColor.from_string(COLORS.get(name_or_hex, name_or_hex))


def add_textbox(slide, x, y, cx, cy, text, size_pt=12.5, bold=False, color='graphite',
                 align='l', anchor='ctr', spc=None, font='Calibri'):
    tb = slide.shapes.add_textbox(Emu(x), Emu(y), Emu(cx), Emu(cy))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE if anchor == 'ctr' else MSO_ANCHOR.TOP
    p = tf.paragraphs[0]
    p.alignment = ALIGN[align]
    run = p.add_run()
    run.text = text
    run.font.name = font
    run.font.size = Pt(size_pt)
    run.font.bold = bold
    run.font.color.rgb = hex_color(color)
    if spc is not None:
        run._r.get_or_add_rPr().set('spc', str(spc))
    return tb


def add_mixed_textbox(slide, x, y, cx, cy, runs, size_pt=14, align='l', anchor='ctr', font='Calibri'):
    tb = slide.shapes.add_textbox(Emu(x), Emu(y), Emu(cx), Emu(cy))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE if anchor == 'ctr' else MSO_ANCHOR.TOP
    p = tf.paragraphs[0]
    p.alignment = ALIGN[align]
    for r in runs:
        run = p.add_run()
        run.text = r['text']
        run.font.name = font
        run.font.size = Pt(r.get('size_pt', size_pt))
        run.font.bold = r.get('bold', False)
        run.font.color.rgb = hex_color(r.get('color', 'graphite'))
    return tb


def add_card(slide, x, y, cx, cy, fill='sand', border='sand_line', adj_raw=6061, border_w_emu=9525):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Emu(x), Emu(y), Emu(cx), Emu(cy))
    shape.fill.solid()
    shape.fill.fore_color.rgb = hex_color(fill)
    shape.line.color.rgb = hex_color(border)
    shape.line.width = Emu(border_w_emu)
    shape.shadow.inherit = False
    gd = shape._element.spPr.find(qn('a:prstGeom')).find(qn('a:avLst')).find(qn('a:gd'))
    gd.set('fmla', f'val {adj_raw}')
    return shape


def set_dark_background(slide):
    slide.background.fill.solid()
    slide.background.fill.fore_color.rgb = hex_color('graphite')


def set_light_background(slide):
    slide.background.fill.solid()
    slide.background.fill.fore_color.rgb = hex_color('white')


def add_blank_slide(prs, light=True):
    slide = prs.slides.add_slide(prs.slide_layouts[0])
    (set_light_background if light else set_dark_background)(slide)
    return slide


def add_header(slide, eyebrow_text, h1_text):
    add_textbox(slide, 640080, 502920, 7315200, 320040, eyebrow_text,
                size_pt=12, bold=True, color='teal', spc=300)
    add_textbox(slide, 640080, 868680, 10881360, 777240, h1_text,
                size_pt=30, bold=True, color='graphite')


def set_notes(slide, text):
    slide.notes_slide.notes_text_frame.text = text


def get_slide_text(slide):
    chunks = []
    for shape in slide.shapes:
        if shape.has_text_frame:
            for p in shape.text_frame.paragraphs:
                for r in p.runs:
                    chunks.append(r.text)
    return ' '.join(chunks)


def get_notes_text(slide):
    if not slide.has_notes_slide:
        return ''
    return slide.notes_slide.notes_text_frame.text
```

- [ ] **Step 3: Write `build_deck.py` skeleton**

```python
"""Rebuilds docs/PropWeb_Pitch_v2.pptx from the pristine 9-slide source,
adding the new Act 2 (+Market) slides and presenter notes per
docs/superpowers/specs/2026-07-14-pitch-deck-design.md."""

from pptx import Presentation

SOURCE = 'docs/deck_build/source.pptx'
OUTPUT = 'docs/PropWeb_Pitch_v2.pptx'


def build():
    prs = Presentation(SOURCE)
    prs.save(OUTPUT)


if __name__ == '__main__':
    build()
```

- [ ] **Step 4: Write `verify_deck.py` skeleton with the Task 1 baseline check**

```python
"""Verification checks for the pitch deck build. Run standalone:
    python docs/deck_build/verify_deck.py
Each check_taskN function is appended by its corresponding plan task."""

from pptx import Presentation
from deck_helpers import get_slide_text, get_notes_text

SOURCE = 'docs/deck_build/source.pptx'
OUTPUT = 'docs/PropWeb_Pitch_v2.pptx'


def check(condition, message):
    status = 'PASS' if condition else 'FAIL'
    print(f'[{status}] {message}')
    if not condition:
        raise AssertionError(message)


def find_slide_by_text(prs, substr):
    for i, slide in enumerate(prs.slides):
        if substr in get_slide_text(slide):
            return i, slide
    return None, None


def check_task1():
    prs = Presentation(SOURCE)
    check(len(prs.slides) == 9, 'source.pptx has 9 slides')
    i, _ = find_slide_by_text(prs, 'PROPWEB')
    check(i == 0, 'source.pptx slide 1 contains PROPWEB title')

    out = Presentation(OUTPUT)
    check(len(out.slides) == 9, 'output still has 9 slides (no new slides added yet)')


CHECKS = [check_task1]

if __name__ == '__main__':
    for fn in CHECKS:
        fn()
    print(f'\n{len(CHECKS)} check group(s) passed.')
```

- [ ] **Step 5: Run to verify baseline passes**

```bash
cd docs/deck_build && python build_deck.py && python verify_deck.py
```
Expected: both commands exit 0; verify prints `[PASS]` for all 3 checks.

- [ ] **Step 6: Commit**

```bash
git add docs/deck_build/
git commit -m "chore: add pitch deck build harness (deck_helpers, build_deck, verify_deck)"
```

---

### Task 2: Presenter notes on the 8 kept slides

**Files:**
- Modify: `docs/deck_build/build_deck.py`
- Modify: `docs/deck_build/verify_deck.py`

**Interfaces:**
- Consumes: `deck_helpers.set_notes(slide, text)`, `deck_helpers.get_slide_text(slide)`, `deck_helpers.get_notes_text(slide)`.
- Produces: `build_deck.add_notes_to_existing_slides(prs)`.

- [ ] **Step 1: Add the failing check first**

Append to `verify_deck.py` (above `CHECKS = [...]`):

```python
EXISTING_NOTES = {
    'PROPWEB': "Open cold: this is the one-line pitch. Say it, don't read it — \"PropWeb is India's trust-first, AI-powered rental platform: verified owners meet verified tenants directly, no brokers, no fake listings, no spam calls.\" Pause after the tagline before moving to the problem slide — let the promise land before you justify it.",
    'Renting in India is broken': "Walk both columns — don't just read the tenant side. The room already knows renting is broken; the point is naming both sides of the pain so the solution slide lands as a genuine two-sided fix, not a tenant-only app. If asked \"isn't this just NoBroker,\" hold that for the next slide.",
    'The hidden cost is trust': "These four numbers carry the slide — let them breathe, don't rush to the NoBroker line. The NoBroker callout is the pre-emptive answer to \"hasn't this already been solved\" — say revenue and loss together, in the same breath: proof of demand, proof the trust layer is still broken.",
    'A trust-first rental platform with an AI engine': "Six pillars, but only two are truly new to the room: Pay-to-Connect and the Trust Score — spend your time there. Verified badges and matchmaking are easy to nod along to; the pay-to-connect economics are what actually kills fake enquiries, so be ready to defend the fee-amount question.",
    'From verified profile to matched move-in': "This is the natural hand-off to the live demo — after \"Connect,\" say \"and I can show you this right now\" and switch to the demo app. Have it already loaded to the Koramangala search before this slide so the transition has no dead air.",
    'Problems no one in India solves well': "This slide is doing double duty as the moat argument, along with the closing slide — scam prevention, background checks and digital agreements are what a trust-first platform can sell that a lead-selling portal structurally can't retrofit. If a CEO asks \"why can't NoBroker just copy this,\" point back here.",
    'Two engines: connect today, services tomorrow': "Two engines, two timeframes — be explicit that \"today\" funds the company and \"tomorrow\" is where the real upside is, using NoBroker's own ~50% non-listing mix as the proof point. Don't let this slide turn into a pricing negotiation; final pricing is explicitly TBD with the CEOs.",
    'Existing portals sell leads': "This is the mic-drop — deliver the two lines slowly, then stop talking. Let \"Existing portals sell leads. PropWeb sells trust.\" sit before you open the floor. If the ask & close slide raised a decision, circle back to it once more before Q&A.",
}


def check_task2():
    prs = Presentation(OUTPUT)
    for marker, expected_note in EXISTING_NOTES.items():
        i, slide = find_slide_by_text(prs, marker)
        check(slide is not None, f'slide containing {marker!r} exists')
        notes = get_notes_text(slide)
        check(len(notes) > 80, f'slide {marker!r} has a real presenter note (got {len(notes)} chars)')
        check(notes == expected_note, f'slide {marker!r} note text matches exactly')
```

Add `check_task2` to `CHECKS`.

- [ ] **Step 2: Run to verify it fails**

```bash
cd docs/deck_build && python verify_deck.py
```
Expected: FAIL on `check_task2`'s first assertion (notes are still the placeholder page-number text).

- [ ] **Step 3: Implement `add_notes_to_existing_slides` in `build_deck.py`**

```python
from deck_helpers import set_notes, get_slide_text

EXISTING_NOTES = {
    'PROPWEB': "Open cold: this is the one-line pitch. Say it, don't read it — \"PropWeb is India's trust-first, AI-powered rental platform: verified owners meet verified tenants directly, no brokers, no fake listings, no spam calls.\" Pause after the tagline before moving to the problem slide — let the promise land before you justify it.",
    'Renting in India is broken': "Walk both columns — don't just read the tenant side. The room already knows renting is broken; the point is naming both sides of the pain so the solution slide lands as a genuine two-sided fix, not a tenant-only app. If asked \"isn't this just NoBroker,\" hold that for the next slide.",
    'The hidden cost is trust': "These four numbers carry the slide — let them breathe, don't rush to the NoBroker line. The NoBroker callout is the pre-emptive answer to \"hasn't this already been solved\" — say revenue and loss together, in the same breath: proof of demand, proof the trust layer is still broken.",
    'A trust-first rental platform with an AI engine': "Six pillars, but only two are truly new to the room: Pay-to-Connect and the Trust Score — spend your time there. Verified badges and matchmaking are easy to nod along to; the pay-to-connect economics are what actually kills fake enquiries, so be ready to defend the fee-amount question.",
    'From verified profile to matched move-in': "This is the natural hand-off to the live demo — after \"Connect,\" say \"and I can show you this right now\" and switch to the demo app. Have it already loaded to the Koramangala search before this slide so the transition has no dead air.",
    'Problems no one in India solves well': "This slide is doing double duty as the moat argument, along with the closing slide — scam prevention, background checks and digital agreements are what a trust-first platform can sell that a lead-selling portal structurally can't retrofit. If a CEO asks \"why can't NoBroker just copy this,\" point back here.",
    'Two engines: connect today, services tomorrow': "Two engines, two timeframes — be explicit that \"today\" funds the company and \"tomorrow\" is where the real upside is, using NoBroker's own ~50% non-listing mix as the proof point. Don't let this slide turn into a pricing negotiation; final pricing is explicitly TBD with the CEOs.",
    'Existing portals sell leads': "This is the mic-drop — deliver the two lines slowly, then stop talking. Let \"Existing portals sell leads. PropWeb sells trust.\" sit before you open the floor. If the ask & close slide raised a decision, circle back to it once more before Q&A.",
}


def add_notes_to_existing_slides(prs):
    for marker, note in EXISTING_NOTES.items():
        for slide in prs.slides:
            if marker in get_slide_text(slide):
                set_notes(slide, note)
                break
```

Update `build()`:

```python
def build():
    prs = Presentation(SOURCE)
    add_notes_to_existing_slides(prs)
    prs.save(OUTPUT)
```

- [ ] **Step 4: Run build then verify**

```bash
cd docs/deck_build && python build_deck.py && python verify_deck.py
```
Expected: all checks `[PASS]`, including `check_task2`.

- [ ] **Step 5: Commit**

```bash
git add docs/deck_build/build_deck.py docs/deck_build/verify_deck.py docs/PropWeb_Pitch_v2.pptx
git commit -m "feat: add real presenter notes to the 8 kept slides"
```

---

### Task 3: New slide — Market opportunity

**Files:**
- Modify: `docs/deck_build/deck_helpers.py` (add `add_stat_row`)
- Modify: `docs/deck_build/build_deck.py`
- Modify: `docs/deck_build/verify_deck.py`

**Interfaces:**
- Produces: `deck_helpers.add_stat_row(slide, stats: list[dict[number, label]], y=2103120, height=2377440)`.
- Consumes: `deck_helpers.add_blank_slide`, `add_header`, `add_mixed_textbox`, `set_notes`.
- Produces: `build_deck.add_market_slide(prs) -> slide`.

- [ ] **Step 1: Add the failing check**

Append to `verify_deck.py`:

```python
def check_task3():
    prs = Presentation(OUTPUT)
    i, slide = find_slide_by_text(prs, 'A large market with an unsolved trust gap')
    check(slide is not None, 'Market opportunity slide exists')
    text = get_slide_text(slide)
    for expected in ('THE OPPORTUNITY', '1.3–1.7B', '12–19%', '$20B', 'Bengaluru', '803 Cr'):
        check(expected in text, f'Market slide contains {expected!r}')
    check(len(get_notes_text(slide)) > 80, 'Market slide has presenter notes')
```

Add `check_task3` to `CHECKS`.

- [ ] **Step 2: Run to verify it fails**

```bash
cd docs/deck_build && python verify_deck.py
```
Expected: FAIL — no slide contains "A large market with an unsolved trust gap" yet.

- [ ] **Step 3: Add `add_stat_row` to `deck_helpers.py`**

```python
def add_stat_row(slide, stats, y=2103120, height=2377440):
    n = len(stats)
    margin = 640080
    gap = 209832
    card_w = (12192000 - 2 * margin - gap * (n - 1)) // n
    for i, s in enumerate(stats):
        x = margin + i * (card_w + gap)
        add_card(slide, x, y, card_w, height, fill='sand', border='sand_line', adj_raw=3077)
        add_textbox(slide, x, y + 274320, card_w, 868680, s['number'],
                    size_pt=36, bold=True, color='teal', align='ctr')
        add_textbox(slide, x + 182880, y + 1188720, card_w - 365760, 1051560, s['label'],
                    size_pt=12.5, color='grey', align='ctr', anchor='top')
```

- [ ] **Step 4: Add `add_market_slide` to `build_deck.py`**

```python
from deck_helpers import add_blank_slide, add_header, add_stat_row, add_mixed_textbox, set_notes

MARKET_NOTES = ("This slide exists to pre-empt the \"is this market even big enough\" question before it's asked — "
                "lead with the CAGR, not the dollar figure; growth rate is the more persuasive number in the room. "
                "Bengaluru isn't arbitrary: name the three reasons (rental velocity, brokerage pain, digital readiness) "
                "so it reads as a decision, not a default.")


def add_market_slide(prs):
    slide = add_blank_slide(prs, light=True)
    add_header(slide, 'THE OPPORTUNITY', 'A large market with an unsolved trust gap.')
    add_stat_row(slide, [
        {'number': '$1.3–1.7B', 'label': 'India proptech market size (2025)'},
        {'number': '12–19%', 'label': 'CAGR — proptech growth rate'},
        {'number': '$20B', 'label': 'Indian rental market size'},
        {'number': 'Bengaluru', 'label': 'launch wedge: highest rental velocity, highest brokerage pain, most digitally-ready renters'},
    ])
    add_mixed_textbox(slide, 640080, 4892040, 10972800, 914400, [
        {'text': 'NoBroker already proved renters will pay to skip brokers — ', 'color': 'grey'},
        {'text': '₹803 Cr revenue, 30M+ users', 'color': 'graphite', 'bold': True},
        {'text': ' — inside a market growing double-digit. Demand is proven; the trust gap PropWeb targets is still wide open.', 'color': 'grey'},
    ], size_pt=14, anchor='ctr')
    set_notes(slide, MARKET_NOTES)
    return slide
```

Update `build()` to call `add_market_slide(prs)` after `add_notes_to_existing_slides(prs)`.

- [ ] **Step 5: Run build then verify**

```bash
cd docs/deck_build && python build_deck.py && python verify_deck.py
```
Expected: all checks `[PASS]`.

- [ ] **Step 6: Commit**

```bash
git add docs/deck_build/
git commit -m "feat: add Market opportunity slide"
```

---

### Task 4: New slide — Architecture

**Files:**
- Modify: `docs/deck_build/build_deck.py`
- Modify: `docs/deck_build/verify_deck.py`

**Interfaces:**
- Consumes: `add_blank_slide`, `add_header`, `add_card`, `add_textbox`, `set_notes` (all exist — no new helper needed).
- Produces: `build_deck.add_architecture_slide(prs) -> slide`.

- [ ] **Step 1: Add the failing check**

```python
def check_task4():
    prs = Presentation(OUTPUT)
    i, slide = find_slide_by_text(prs, 'One well-organised building, not eleven services')
    check(slide is not None, 'Architecture slide exists')
    text = get_slide_text(slide)
    for expected in ('ARCHITECTURE', 'modular monolith', 'Listings & Search', 'Trust & KYC',
                      'Matching Engine', 'Connect & Payments', 'TypeScript'):
        check(expected in text, f'Architecture slide contains {expected!r}')
    check(len(get_notes_text(slide)) > 80, 'Architecture slide has presenter notes')
```

Add `check_task4` to `CHECKS`.

- [ ] **Step 2: Run to verify it fails**

```bash
cd docs/deck_build && python verify_deck.py
```
Expected: FAIL — slide doesn't exist yet.

- [ ] **Step 3: Add `add_architecture_slide` to `build_deck.py`**

```python
from deck_helpers import add_card

ARCHITECTURE_NOTES = ("Keep this slide short on stage — the point is reassurance, not a systems-design lecture. "
                       "One sentence: \"one well-built application, not eleven fragile services, because we're a "
                       "five-person team for the first year.\" If a CEO with a technical background pushes on "
                       "scaling, the honest answer is that a modular monolith splits into services later without "
                       "a rewrite — say that only if asked.")


def add_architecture_slide(prs):
    slide = add_blank_slide(prs, light=True)
    add_header(slide, 'ARCHITECTURE', 'One well-organised building, not eleven services.')
    add_card(slide, 640080, 2103120, 10911840, 3474720, fill='sand', border='sand_line', adj_raw=3000)
    add_textbox(slide, 868680, 2377440, 10454640, 365760,
                'PropWeb — modular monolith', size_pt=15, bold=True, color='graphite')
    blocks = ['Listings & Search', 'Trust & KYC', 'Matching Engine', 'Connect & Payments']
    n = len(blocks)
    gap = 182880
    inner_w = 10454640
    card_w = (inner_w - gap * (n - 1)) // n
    for idx, label in enumerate(blocks):
        x = 868680 + idx * (card_w + gap)
        add_card(slide, x, 2960000, card_w, 1000000, fill='white', border='sand_line', adj_raw=6061)
        add_textbox(slide, x, 2960000, card_w, 1000000, label, size_pt=13, bold=True,
                    color='teal', align='ctr')
    add_textbox(slide, 640080, 5738160, 10911840, 365760,
                'Small team, one codebase, one language (TypeScript) — ship fast without distributed-systems overhead.',
                size_pt=14, color='grey')
    set_notes(slide, ARCHITECTURE_NOTES)
    return slide
```

Update `build()` to call `add_architecture_slide(prs)` next.

- [ ] **Step 4: Run build then verify**

```bash
cd docs/deck_build && python build_deck.py && python verify_deck.py
```
Expected: all checks `[PASS]`.

- [ ] **Step 5: Commit**

```bash
git add docs/deck_build/
git commit -m "feat: add Architecture slide"
```

---

### Task 5: New slide — The stack (with why); retire old tech+budget slide

**Files:**
- Modify: `docs/deck_build/deck_helpers.py` (add `add_table`, `remove_slide`, `remove_slide_by_text`)
- Modify: `docs/deck_build/build_deck.py`
- Modify: `docs/deck_build/verify_deck.py`

**Interfaces:**
- Produces: `deck_helpers.add_table(slide, x, y, cx, cy, rows: list[tuple[str,...]], col_widths: tuple[int,...]) -> table`, `deck_helpers.remove_slide(prs, index: int)`, `deck_helpers.remove_slide_by_text(prs, substr: str)`.
- Produces: `build_deck.add_stack_slide(prs) -> slide`.

- [ ] **Step 1: Add the failing check**

```python
def check_task5():
    prs = Presentation(OUTPUT)
    matches = [i for i, s in enumerate(prs.slides)
               if 'A modern stack, corrected for India economics' in get_slide_text(s)]
    check(len(matches) == 1, f'exactly one Stack slide exists (found {len(matches)})')
    slide = list(prs.slides)[matches[0]]
    text = get_slide_text(slide)
    for expected in ('THE STACK', 'Next.js', 'Typesense', 'Algolia', 'Leegality', 'DigiLocker', 'AWS Mumbai'):
        check(expected in text, f'Stack slide contains {expected!r}')
    check('12-month build budget' not in text, 'old budget line removed from Stack slide (budget has its own slide now)')
    check(len(get_notes_text(slide)) > 80, 'Stack slide has presenter notes')
```

Add `check_task5` to `CHECKS`.

- [ ] **Step 2: Run to verify it fails**

```bash
cd docs/deck_build && python verify_deck.py
```
Expected: FAIL — the only slide with that H1 today is the old combined stack+budget slide, which still contains "12-month build budget" and lacks `Leegality`/`Algolia`/`AWS Mumbai` as separate concerns in the expanded table.

- [ ] **Step 3: Add `add_table`, `remove_slide`, `remove_slide_by_text` to `deck_helpers.py`**

```python
def add_table(slide, x, y, cx, cy, rows, col_widths):
    n_rows, n_cols = len(rows), len(rows[0])
    graphic_frame = slide.shapes.add_table(n_rows, n_cols, Emu(x), Emu(y), Emu(cx), Emu(cy))
    table = graphic_frame.table
    for c, w in enumerate(col_widths):
        table.columns[c].width = Emu(w)
    for r, row in enumerate(rows):
        for c, text in enumerate(row):
            cell = table.cell(r, c)
            cell.text = str(text)
            cell.fill.solid()
            cell.fill.fore_color.rgb = hex_color('sand' if (r == 0 or r % 2 == 0) else 'white')
            run = cell.text_frame.paragraphs[0].runs[0]
            run.font.name = 'Calibri'
            run.font.size = Pt(12 if r else 12.5)
            run.font.bold = (r == 0)
            run.font.color.rgb = hex_color('graphite' if r == 0 else 'grey')
    return table


def remove_slide(prs, index):
    xml_slides = prs.slides._sldIdLst
    slide_id_elements = list(xml_slides)
    r_id = slide_id_elements[index].get(qn('r:id'))
    prs.part.drop_rel(r_id)
    xml_slides.remove(slide_id_elements[index])


def remove_slide_by_text(prs, substr):
    for i, slide in enumerate(prs.slides):
        if substr in get_slide_text(slide):
            remove_slide(prs, i)
            return
    raise ValueError(f'no slide found containing {substr!r}')
```

- [ ] **Step 4: Add `add_stack_slide` to `build_deck.py`**

```python
from deck_helpers import add_table, remove_slide_by_text

STACK_NOTES = ("Don't read the table row by row — the room doesn't need to know what Typesense is. The only two "
               "numbers worth saying out loud are the Algolia cost comparison and the AWS Mumbai/DPDP compliance "
               "line, because those are the ones a CEO will actually remember and repeat to an investor.")


def add_stack_slide(prs):
    remove_slide_by_text(prs, 'A modern stack, corrected for India economics')
    slide = add_blank_slide(prs, light=True)
    add_header(slide, 'THE STACK', 'A modern stack, corrected for India economics.')
    rows = [
        ('Layer', 'Choice', 'Why it wins'),
        ('Frontend', 'Next.js (React)', 'SEO locality pages = free Google traffic'),
        ('Backend', 'Node.js + TypeScript', 'One language, small team moves fast'),
        ('Database', 'PostgreSQL + PostGIS', "'Flats within 3 km' queries, reliably"),
        ('Search', 'Typesense (self-hosted)', '≈$69/mo vs Algolia’s ≈$525/mo'),
        ('Maps', 'Ola Maps / MapmyIndia', 'Free tier + best Indian locality data'),
        ('Cloud', 'AWS Mumbai', 'KYC data stays in India (DPDP compliance)'),
        ('Payments', 'Razorpay (UPI-first)', 'UPI at 0% MDR by RBI mandate'),
        ('Call masking', 'Exotel', 'Virtual numbers keep owner phones private'),
        ('KYC APIs', 'Surepass/IDfy class vendors', 'PAN ≈₹1–3/check; Aadhaar via offline XML/DigiLocker'),
        ('Agreements', 'Leegality/Digio', 'Aadhaar eSign ₹10–40/signature + state-wise e-stamping'),
    ]
    add_table(slide, 640080, 2103120, 10911840, 3800000, rows,
              col_widths=(2743680, 3200000, 4968160))
    add_textbox(slide, 640080, 6100000, 10911840, 600000,
                'Cost traps avoided: Typesense keeps ~80% of Algolia’s power at ~20% of the cost; Google Maps '
                'stays a free-tier fallback, not the primary, ahead of its post-2027 pricing changes.',
                size_pt=12, color='grey', anchor='top')
    set_notes(slide, STACK_NOTES)
    return slide
```

Update `build()` to call `add_stack_slide(prs)` next (this removes the old slide as a side effect).

- [ ] **Step 5: Run build then verify**

```bash
cd docs/deck_build && python build_deck.py && python verify_deck.py
```
Expected: all checks `[PASS]`, including `check_task5`.

- [ ] **Step 6: Commit**

```bash
git add docs/deck_build/
git commit -m "feat: expand Stack slide with full table, retire old combined tech+budget slide"
```

---

### Task 6: New slide — The trust pipeline (crown jewel)

**Files:**
- Modify: `docs/deck_build/deck_helpers.py` (add `add_flow_steps`)
- Modify: `docs/deck_build/build_deck.py`
- Modify: `docs/deck_build/verify_deck.py`

**Interfaces:**
- Produces: `deck_helpers.add_flow_steps(slide, steps: list[dict[prefix, title, body]], y=2103120, height=2827656)`.
- Produces: `build_deck.add_trust_pipeline_slide(prs) -> slide`.

- [ ] **Step 1: Add the failing check**

```python
def check_task6():
    prs = Presentation(OUTPUT)
    i, slide = find_slide_by_text(prs, 'Verification, the legal way')
    check(slide is not None, 'Trust pipeline slide exists')
    text = get_slide_text(slide)
    for expected in ('THE TRUST PIPELINE', 'Aadhaar offline XML', 'DigiLocker', 'PAN', 'Puttaswamy', '2018'):
        check(expected in text, f'Trust pipeline slide contains {expected!r}')
    check(len(get_notes_text(slide)) > 80, 'Trust pipeline slide has presenter notes')
```

Add `check_task6` to `CHECKS`.

- [ ] **Step 2: Run to verify it fails**

```bash
cd docs/deck_build && python verify_deck.py
```
Expected: FAIL — slide doesn't exist yet.

- [ ] **Step 3: Add `add_flow_steps` to `deck_helpers.py`**

```python
def add_flow_steps(slide, steps, y=2103120, height=2827656):
    n = len(steps)
    margin = 640080
    gap = 228600
    card_w = (12192000 - 2 * margin - gap * (n - 1)) // n
    for i, step in enumerate(steps):
        x = margin + i * (card_w + gap)
        add_card(slide, x, y, card_w, height, fill='sand', border='sand_line', adj_raw=6061)
        add_textbox(slide, x + 228600, y + 228600, card_w - 457200, 320040,
                    step['prefix'], size_pt=12, bold=True, color='teal', spc=200)
        add_textbox(slide, x + 228600, y + 640080, card_w - 457200, 548640,
                    step['title'], size_pt=15, bold=True, color='graphite', anchor='top')
        add_textbox(slide, x + 228600, y + 1280160, card_w - 457200, height - 1280160 - 228600,
                    step['body'], size_pt=12, color='grey', anchor='top')
        if i < n - 1:
            add_textbox(slide, x + card_w, y + height // 2 - 200000, gap, 400000,
                        '→', size_pt=20, bold=True, color='teal', align='ctr')
```

- [ ] **Step 4: Add `add_trust_pipeline_slide` to `build_deck.py`**

```python
from deck_helpers import add_flow_steps

TRUST_PIPELINE_NOTES = ("This is the slide to slow down on — say the Puttaswamy line exactly as written on the "
                         "box, word for word, because it's the one legal fact that must not be garbled on stage. "
                         "If asked \"so we can't use Aadhaar at all,\" the answer is we can, just not by calling "
                         "the eKYC API directly — offline XML, DigiLocker, and licensed partners are all legal "
                         "and all in this pipeline.")


def add_trust_pipeline_slide(prs):
    slide = add_blank_slide(prs, light=True)
    add_header(slide, 'THE TRUST PIPELINE', 'Verification, the legal way.')
    add_flow_steps(slide, [
        {'prefix': '01 · IDENTITY', 'title': 'Aadhaar offline XML / DigiLocker',
         'body': 'Identity proof through the legal offline route — no direct Aadhaar eKYC call.'},
        {'prefix': '02 · PAN CHECK', 'title': 'PAN verification API',
         'body': '₹1–3 per check via a licensed KYC API partner.'},
        {'prefix': '03 · OWNERSHIP', 'title': 'Ownership-proof review',
         'body': 'Property tax receipt, electricity bill or sale deed — manual review.'},
        {'prefix': '04 · BADGE', 'title': 'Badge issued',
         'body': 'Verified Owner / Verified Tenant mark goes live on the profile and every listing.'},
    ])
    add_card(slide, 640080, 4892040, 10911840, 1280160, fill='white', border='amber', adj_raw=1500, border_w_emu=19050)
    add_textbox(slide, 868680, 4938840, 10454640, 1188720,
                'The one legal fact that must not be gotten wrong on stage: private companies cannot call Aadhaar '
                'eKYC APIs directly (Supreme Court, Puttaswamy 2018). PropWeb verifies identity only through the '
                'legal routes — Aadhaar offline XML, DigiLocker, or a licensed KYC partner.',
                size_pt=13, color='graphite', anchor='ctr')
    set_notes(slide, TRUST_PIPELINE_NOTES)
    return slide
```

Update `build()` to call `add_trust_pipeline_slide(prs)` next.

- [ ] **Step 5: Run build then verify**

```bash
cd docs/deck_build && python build_deck.py && python verify_deck.py
```
Expected: all checks `[PASS]`.

- [ ] **Step 6: Commit**

```bash
git add docs/deck_build/
git commit -m "feat: add Trust pipeline / KYC flow slide with Puttaswamy legal callout"
```

---

### Task 7: New slide — Build phases

**Files:**
- Modify: `docs/deck_build/build_deck.py`
- Modify: `docs/deck_build/verify_deck.py`

**Interfaces:**
- Consumes: `add_flow_steps` (from Task 6).
- Produces: `build_deck.add_build_phases_slide(prs) -> slide`.

- [ ] **Step 1: Add the failing check**

```python
def check_task7():
    prs = Presentation(OUTPUT)
    i, slide = find_slide_by_text(prs, 'Four phases, one city first')
    check(slide is not None, 'Build phases slide exists')
    text = get_slide_text(slide)
    for expected in ('ROADMAP', 'PHASE 0', 'weeks 0–4', 'PHASE 1', 'months 1–4', 'PHASE 3', 'multi-city'):
        check(expected in text, f'Build phases slide contains {expected!r}')
    check(len(get_notes_text(slide)) > 80, 'Build phases slide has presenter notes')
```

Add `check_task7` to `CHECKS`.

- [ ] **Step 2: Run to verify it fails**

```bash
cd docs/deck_build && python verify_deck.py
```
Expected: FAIL — slide doesn't exist yet.

- [ ] **Step 3: Add `add_build_phases_slide` to `build_deck.py`**

```python
BUILD_PHASES_NOTES = ("Anchor the room on the one-city, four-month MVP commitment — that's the number a CEO will "
                       "hold you to, so say \"4 months to a working one-city product\" explicitly rather than "
                       "letting the phase labels speak for themselves.")


def add_build_phases_slide(prs):
    slide = add_blank_slide(prs, light=True)
    add_header(slide, 'ROADMAP', 'Four phases, one city first.')
    add_flow_steps(slide, [
        {'prefix': 'PHASE 0 · weeks 0–4', 'title': 'Setup',
         'body': 'Team hiring starts, tooling and accounts provisioned, design system finalized.'},
        {'prefix': 'PHASE 1 · months 1–4', 'title': 'MVP, one city',
         'body': 'Bengaluru launch: search, listings, trust badges, pay-to-connect live.'},
        {'prefix': 'PHASE 2 · months 4–9', 'title': 'Depth',
         'body': 'AI Match Score, digital rent agreements, fraud/broker detection.'},
        {'prefix': 'PHASE 3 · months 9–15', 'title': 'Services + multi-city',
         'body': 'Affiliate services marketplace launches; expansion beyond Bengaluru.'},
    ])
    set_notes(slide, BUILD_PHASES_NOTES)
    return slide
```

Update `build()` to call `add_build_phases_slide(prs)` next.

- [ ] **Step 4: Run build then verify**

```bash
cd docs/deck_build && python build_deck.py && python verify_deck.py
```
Expected: all checks `[PASS]`.

- [ ] **Step 5: Commit**

```bash
git add docs/deck_build/
git commit -m "feat: add Build phases roadmap slide"
```

---

### Task 8: New slide — Team plan

**Files:**
- Modify: `docs/deck_build/build_deck.py`
- Modify: `docs/deck_build/verify_deck.py`

**Interfaces:**
- Consumes: `add_flow_steps`.
- Produces: `build_deck.add_team_plan_slide(prs) -> slide`.

- [ ] **Step 1: Add the failing check**

```python
def check_task8():
    prs = Presentation(OUTPUT)
    i, slide = find_slide_by_text(prs, 'Small team, sequenced hiring')
    check(slide is not None, 'Team plan slide exists')
    text = get_slide_text(slide)
    for expected in ('TEAM', '₹2.75L', '₹5.35L', '₹6.65L', '₹55–65 lakh'):
        check(expected in text, f'Team plan slide contains {expected!r}')
    check(len(get_notes_text(slide)) > 80, 'Team plan slide has presenter notes')
```

Add `check_task8` to `CHECKS`.

- [ ] **Step 2: Run to verify it fails**

```bash
cd docs/deck_build && python verify_deck.py
```
Expected: FAIL — slide doesn't exist yet.

- [ ] **Step 3: Add `add_team_plan_slide` to `build_deck.py`**

```python
TEAM_PLAN_NOTES = ("The headline is \"small team, sequenced hiring\" — resist the urge to justify each hire "
                    "individually. If asked why the founding engineer comes before a designer, the honest answer "
                    "is that the demo app already exists as proof the frontend/product work doesn't block on "
                    "that hire yet.")


def add_team_plan_slide(prs):
    slide = add_blank_slide(prs, light=True)
    add_header(slide, 'TEAM', 'Small team, sequenced hiring.')
    add_flow_steps(slide, [
        {'prefix': 'MONTHS 1–3', 'title': '₹2.75L / month',
         'body': 'Founding full-stack engineer (₹2L/mo) + contract designer (₹75k/mo).'},
        {'prefix': 'MONTHS 4–6', 'title': '₹5.35L / month',
         'body': '+ Backend engineer (₹1.6L/mo) + frontend engineer (₹1L/mo).'},
        {'prefix': 'MONTHS 7–12', 'title': '₹6.65L / month',
         'body': '+ QA/ops (₹70k/mo) + fractional DevOps (₹60k/mo).'},
    ])
    add_textbox(slide, 640080, 5400000, 10911840, 500000,
                '12-month engineering payroll: ₹55–65 lakh.', size_pt=16, bold=True, color='teal')
    set_notes(slide, TEAM_PLAN_NOTES)
    return slide
```

Update `build()` to call `add_team_plan_slide(prs)` next.

- [ ] **Step 4: Run build then verify**

```bash
cd docs/deck_build && python build_deck.py && python verify_deck.py
```
Expected: all checks `[PASS]`.

- [ ] **Step 5: Commit**

```bash
git add docs/deck_build/
git commit -m "feat: add Team plan slide"
```

---

### Task 9: New slide — The budget (3 scenarios)

**Files:**
- Modify: `docs/deck_build/build_deck.py`
- Modify: `docs/deck_build/verify_deck.py`

**Interfaces:**
- Consumes: `add_table` (from Task 5).
- Produces: `build_deck.add_budget_slide(prs) -> slide`.

- [ ] **Step 1: Add the failing check**

```python
def check_task9():
    prs = Presentation(OUTPUT)
    i, slide = find_slide_by_text(prs, 'Three scenarios, months 0–12')
    check(slide is not None, 'Budget slide exists')
    text = get_slide_text(slide)
    for expected in ('BUDGET', 'Lean', 'Base', 'Comfortable', '₹68L', '1.14 Cr', '1.78 Cr'):
        check(expected in text, f'Budget slide contains {expected!r}')
    check(len(get_notes_text(slide)) > 80, 'Budget slide has presenter notes')
```

Add `check_task9` to `CHECKS`.

- [ ] **Step 2: Run to verify it fails**

```bash
cd docs/deck_build && python verify_deck.py
```
Expected: FAIL — slide doesn't exist yet.

- [ ] **Step 3: Add `add_budget_slide` to `build_deck.py`**

```python
BUDGET_NOTES = ("Present all three scenarios before anyone asks which one to pick — this is a menu, not a "
                 "recommendation, and the ask on the next slide is a decision between them, not an approval of a "
                 "single number. If pressed for a personal recommendation, Base is the defensible middle: it "
                 "funds the full hiring sequence without the Lean scenario's slack risk.")


def add_budget_slide(prs):
    slide = add_blank_slide(prs, light=True)
    add_header(slide, 'BUDGET', 'Three scenarios, months 0–12.')
    rows = [
        ('Cost line', 'Lean', 'Base', 'Comfortable'),
        ('Engineering payroll', '₹40L', '₹60L', '₹90L'),
        ('CTO+CPO cash (reduced)', '₹12L', '₹24L', '₹36L'),
        ('Cloud & infrastructure', '₹3L', '₹6L', '₹12L'),
        ('Third-party APIs', '₹3L', '₹6L', '₹12L'),
        ('Tools & licenses', '₹1.5L', '₹3L', '₹5L'),
        ('Contingency (~15%)', '₹9L', '₹15L', '₹23L'),
        ('TOTAL (0–12 months)', '≈₹68L', '≈₹1.14 Cr', '≈₹1.78 Cr'),
    ]
    add_table(slide, 640080, 2103120, 10911840, 3800000, rows,
              col_widths=(4200000, 2237280, 2237280, 2237280))
    add_textbox(slide, 640080, 6100000, 10911840, 500000,
                'Team of 5–6 + fractional roles; one-city MVP achievable in 4 months.',
                size_pt=13, color='grey')
    set_notes(slide, BUDGET_NOTES)
    return slide
```

Update `build()` to call `add_budget_slide(prs)` next.

- [ ] **Step 4: Run build then verify**

```bash
cd docs/deck_build && python build_deck.py && python verify_deck.py
```
Expected: all checks `[PASS]`.

- [ ] **Step 5: Commit**

```bash
git add docs/deck_build/
git commit -m "feat: add Budget slide (3 scenarios, Brief section 7.1)"
```

---

### Task 10: New slide — The ask & close

**Files:**
- Modify: `docs/deck_build/build_deck.py`
- Modify: `docs/deck_build/verify_deck.py`

**Interfaces:**
- Consumes: `add_card`, `add_textbox` (existing).
- Produces: `build_deck.add_ask_close_slide(prs) -> slide`.

- [ ] **Step 1: Add the failing check**

```python
def check_task10():
    prs = Presentation(OUTPUT)
    i, slide = find_slide_by_text(prs, 'What we need from you, next 90 days')
    check(slide is not None, 'Ask & close slide exists')
    text = get_slide_text(slide)
    for expected in ('THE ASK', 'founding engineer', '200+', '>8%', '>40%', '>70%'):
        check(expected in text, f'Ask & close slide contains {expected!r}')
    check(len(get_notes_text(slide)) > 80, 'Ask & close slide has presenter notes')
```

Add `check_task10` to `CHECKS`.

- [ ] **Step 2: Run to verify it fails**

```bash
cd docs/deck_build && python verify_deck.py
```
Expected: FAIL — slide doesn't exist yet.

- [ ] **Step 3: Add `add_ask_close_slide` to `build_deck.py`**

```python
ASK_CLOSE_NOTES = ("This is the actual decision slide — say the ask in one sentence before showing the success "
                    "metrics: \"we need a budget scenario approved and a start date for the founding engineer "
                    "hire.\" The month-12 metrics exist to answer \"how will we know this worked,\" not to be "
                    "read verbatim.")


def add_ask_close_slide(prs):
    slide = add_blank_slide(prs, light=True)
    add_header(slide, 'THE ASK', 'What we need from you, next 90 days.')
    add_textbox(slide, 640080, 2103120, 10911840, 640080,
                'The decision: approve one budget scenario (Lean / Base / Comfortable) and a start date for the '
                'founding engineer hire.',
                size_pt=15, bold=True, color='graphite', anchor='top')
    add_card(slide, 640080, 2960000, 10911840, 1600000, fill='sand', border='sand_line', adj_raw=3000)
    add_textbox(slide, 868680, 3050000, 10454640, 365760,
                'Next 90 days', size_pt=15, bold=True, color='teal')
    add_textbox(slide, 868680, 3450000, 10454640, 1000000,
                'Phase 0 setup (weeks 0–4) → founding engineer hired and Phase 1 MVP build under way, '
                'targeting the one-city Bengaluru launch inside 4 months.',
                size_pt=13, color='grey', anchor='top')
    add_card(slide, 640080, 4740000, 10911840, 1750000, fill='white', border='sand_line', adj_raw=3000)
    add_textbox(slide, 868680, 4830000, 10454640, 365760,
                'What success looks like at month 12', size_pt=15, bold=True, color='teal')
    add_textbox(slide, 868680, 5230000, 10454640, 1200000,
                '200+ verified owner listings per launch locality  ·  >8% free-to-paid connect conversion  '
                '·  >40% contact-to-visit rate  ·  >70% of live inventory verified.',
                size_pt=13, color='grey', anchor='top')
    set_notes(slide, ASK_CLOSE_NOTES)
    return slide
```

Update `build()` to call `add_ask_close_slide(prs)` next.

- [ ] **Step 4: Run build then verify**

```bash
cd docs/deck_build && python build_deck.py && python verify_deck.py
```
Expected: all checks `[PASS]`.

- [ ] **Step 5: Commit**

```bash
git add docs/deck_build/
git commit -m "feat: add Ask and close slide"
```

---

### Task 11: Final reorder into the 16-slide Act 1 / Act 2 sequence + full-deck verification

**Files:**
- Modify: `docs/deck_build/deck_helpers.py` (add `reorder_slides`)
- Modify: `docs/deck_build/build_deck.py`
- Modify: `docs/deck_build/verify_deck.py`

**Interfaces:**
- Produces: `deck_helpers.reorder_slides(prs, markers: list[str])`.
- Produces: `verify_deck.check_task11()` (final full-deck acceptance check).

- [ ] **Step 1: Add the failing check**

```python
FINAL_ORDER_MARKERS = [
    'PROPWEB',
    'Renting in India is broken',
    'The hidden cost is trust',
    'A large market with an unsolved trust gap',
    'A trust-first rental platform with an AI engine',
    'From verified profile to matched move-in',
    'Problems no one in India solves well',
    'Two engines: connect today, services tomorrow',
    'One well-organised building, not eleven services',
    'A modern stack, corrected for India economics',
    'Verification, the legal way',
    'Four phases, one city first',
    'Small team, sequenced hiring',
    'Three scenarios, months 0–12',
    'What we need from you, next 90 days',
    'Existing portals sell leads',
]


def check_task11():
    prs = Presentation(OUTPUT)
    check(len(prs.slides) == 16, f'deck has 16 slides (found {len(prs.slides)})')
    for expected_index, marker in enumerate(FINAL_ORDER_MARKERS):
        text = get_slide_text(list(prs.slides)[expected_index])
        check(marker in text, f'slide {expected_index + 1} is {marker!r} (got: {text[:60]!r}...)')
    for i, slide in enumerate(prs.slides):
        notes = get_notes_text(slide)
        check(len(notes) > 60, f'slide {i + 1} has real presenter notes (got {len(notes)} chars)')
    W, H = prs.slide_width, prs.slide_height
    for i, slide in enumerate(prs.slides):
        for shape in slide.shapes:
            if shape.left is None:
                continue
            check(shape.left >= 0 and shape.top >= 0
                  and shape.left + shape.width <= W and shape.top + shape.height <= H,
                  f'slide {i + 1} shape "{shape.name}" within canvas bounds')
    # round-trip load sanity check: a corrupted pptx would raise here
    Presentation(OUTPUT)
```

Add `check_task11` to `CHECKS`.

- [ ] **Step 2: Run to verify it fails**

```bash
cd docs/deck_build && python verify_deck.py
```
Expected: FAIL on slide-count or slide-order (deck is currently 16 slides but in build order: 8 kept + Market + Architecture + Stack + Trust pipeline + Build phases + Team plan + Budget + Ask&close + Closing — Closing is not yet last).

- [ ] **Step 3: Add `reorder_slides` to `deck_helpers.py`**

```python
def reorder_slides(prs, markers):
    current = list(prs.slides)
    order_indices = []
    for marker in markers:
        idx = next(i for i, s in enumerate(current) if marker in get_slide_text(s))
        order_indices.append(idx)
    xml_slides = prs.slides._sldIdLst
    slide_id_elements = list(xml_slides)
    for el in slide_id_elements:
        xml_slides.remove(el)
    for idx in order_indices:
        xml_slides.append(slide_id_elements[idx])
```

- [ ] **Step 4: Wire it into `build_deck.py`**

```python
from deck_helpers import reorder_slides

FINAL_ORDER_MARKERS = [
    'PROPWEB',
    'Renting in India is broken',
    'The hidden cost is trust',
    'A large market with an unsolved trust gap',
    'A trust-first rental platform with an AI engine',
    'From verified profile to matched move-in',
    'Problems no one in India solves well',
    'Two engines: connect today, services tomorrow',
    'One well-organised building, not eleven services',
    'A modern stack, corrected for India economics',
    'Verification, the legal way',
    'Four phases, one city first',
    'Small team, sequenced hiring',
    'Three scenarios, months 0–12',
    'What we need from you, next 90 days',
    'Existing portals sell leads',
]


def build():
    prs = Presentation(SOURCE)
    add_notes_to_existing_slides(prs)
    add_market_slide(prs)
    add_architecture_slide(prs)
    add_stack_slide(prs)
    add_trust_pipeline_slide(prs)
    add_build_phases_slide(prs)
    add_team_plan_slide(prs)
    add_budget_slide(prs)
    add_ask_close_slide(prs)
    reorder_slides(prs, FINAL_ORDER_MARKERS)
    prs.save(OUTPUT)
```

- [ ] **Step 5: Run build then verify**

```bash
cd docs/deck_build && python build_deck.py && python verify_deck.py
```
Expected: all 11 check groups `[PASS]`, deck has exactly 16 slides in the exact Act 1 / Act 2 order from the spec.

- [ ] **Step 6: Manual visual QA pass**

Open `docs/PropWeb_Pitch_v2.pptx` in PowerPoint (or LibreOffice Impress / Google Slides) and click through all 16 slides plus the notes/presenter view. Confirm: no text overflow or clipped cards, teal+sand palette consistent throughout, table columns readable, amber legal callout box on the Trust Pipeline slide reads clearly. Fix any visual issue found by adjusting the relevant `add_*` function in `build_deck.py`, rerun Step 5, re-check visually.

- [ ] **Step 7: Update `PLAN.md` progress log**

Add a line noting the deck build is complete (16 slides, presenter notes, teal+sand grammar preserved) and pointing at this plan file.

- [ ] **Step 8: Commit**

```bash
git add docs/deck_build/ docs/PropWeb_Pitch_v2.pptx PLAN.md
git commit -m "feat: reorder deck into final 16-slide Act 1/Act 2 sequence, complete pitch deck deliverable"
```

---

## Plan self-review

- **Spec coverage:** every slide in spec §2 (1–16) has a corresponding task/function; presenter-note requirements from spec §3 are implemented per-slide (existing slides in Task 2, new slides inline in Tasks 3–10); technical approach from spec §4 (python-pptx, exact grammar, reorder, verification, no new media) is followed; palette/font constraints from spec §1 are encoded in `Global Constraints` and `deck_helpers.COLORS`.
- **Placeholder scan:** no TBD/TODO; every task shows complete runnable code and real content sourced from the Handover Brief.
- **Type/interface consistency:** `add_card`, `add_textbox`, `add_mixed_textbox`, `add_stat_row`, `add_flow_steps`, `add_table` signatures are defined once (Task 1/3/5/6) and reused identically by name in every later task — no renamed variants.
- **Scope:** deck-only; explicitly excludes wireframes, demo app, and the standalone costing-slides deliverable; explicitly does not touch `app/`.
