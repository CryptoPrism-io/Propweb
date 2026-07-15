# Desktop Navbar + Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the app a real desktop (`lg:` 1024px+) layout for the navbar and Home hero, matching the separated-navbar / hero-search-card structure of `References/deskstop hero.jpg`, without touching mobile behavior.

**Architecture:** Add `lg:` Tailwind variants directly inside the existing `Navbar` and `Home` components (no viewport-detection hook, no separate component tree). Add one new component, `HeroSearchCard` (desktop-only), and one new shared module, `lib/searchFilters.ts`, extracted from `SearchPanel` so the mobile and desktop search UIs share the same vocabulary.

**Tech Stack:** React 19 + TypeScript, React Router 7, Tailwind CSS, Vitest + React Testing Library, `@phosphor-icons/react`.

## Global Constraints

- No real AI/ML — the "Ask AI" bar does simple keyword/regex parsing only (PLAN.md: "rule-based match only").
- Mobile (`<lg`) behavior must not change — every change is additive via `lg:` variants.
- Desktop nav links that don't have a real destination page yet point to `/` (matches the existing mobile `MENU` array's convention in `Navbar.tsx` — do not invent new routes).
- Query param names for search results are fixed by `Results.tsx` (`app/src/pages/Results.tsx:28-34`): `locality`, `bhk`, `maxRent`, `furnishing`, `tenantType`. Both search bars must produce exactly these param names.
- Spec: `docs/superpowers/specs/2026-07-15-desktop-navbar-hero-design.md`.

---

### Task 1: Shared search vocabulary + AI mock query parser

**Files:**
- Create: `app/src/lib/searchFilters.ts`
- Create: `app/src/lib/searchFilters.test.ts`
- Modify: `app/src/components/SearchPanel.tsx:1-19` (remove inline consts, import shared ones)

**Interfaces:**
- Produces: `LOCALITIES: string[]`, `BHKS: string[]`, `FURNISH: {v: string; l: string}[]`, `TENANTS: {v: string; l: string}[]`, `parseAiQuery(text: string): AiParsedQuery` where `AiParsedQuery = { locality?: string; bhk?: string; furnishing?: string; tenantType?: string; maxRent?: string }`.
- Consumed by: Task 2 (`HeroSearchCard`).

- [ ] **Step 1: Write the failing test**

Create `app/src/lib/searchFilters.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { parseAiQuery, LOCALITIES, BHKS, FURNISH, TENANTS } from './searchFilters';

describe('searchFilters vocab', () => {
  it('exposes the shared locality/bhk/furnishing/tenant vocab', () => {
    expect(LOCALITIES).toContain('Koramangala');
    expect(BHKS).toEqual(['1', '2', '3', '3+']);
    expect(FURNISH.map(f => f.v)).toEqual(['', 'unfurnished', 'semi', 'furnished']);
    expect(TENANTS.map(t => t.v)).toEqual(['', 'family', 'bachelor']);
  });
});

describe('parseAiQuery', () => {
  it('extracts locality, bhk, furnishing, and budget from free text', () => {
    expect(parseAiQuery('2BHK under ₹35k in Koramangala, furnished')).toEqual({
      locality: 'Koramangala', bhk: '2', furnishing: 'furnished', maxRent: '35000',
    });
  });

  it('extracts tenant type and unfurnished (not confused with "furnished")', () => {
    expect(parseAiQuery('bachelor 1bhk unfurnished flat in HSR Layout')).toEqual({
      locality: 'HSR Layout', bhk: '1', furnishing: 'unfurnished', tenantType: 'bachelor',
    });
  });

  it('returns an empty object when nothing matches', () => {
    expect(parseAiQuery('looking for a nice place')).toEqual({});
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd app && npx vitest run src/lib/searchFilters.test.ts`
Expected: FAIL — `Failed to resolve import "./searchFilters"`.

- [ ] **Step 3: Write the implementation**

Create `app/src/lib/searchFilters.ts`:

```ts
export const LOCALITIES = ['Koramangala', 'HSR Layout', 'Indiranagar', 'Whitefield', 'JP Nagar'];
export const BHKS = ['1', '2', '3', '3+'];
export const FURNISH = [
  { v: '', l: 'Any' },
  { v: 'unfurnished', l: 'Unfurnished' },
  { v: 'semi', l: 'Semi' },
  { v: 'furnished', l: 'Furnished' },
];
export const TENANTS = [
  { v: '', l: 'Any' },
  { v: 'family', l: 'Family' },
  { v: 'bachelor', l: 'Bachelor' },
];

export type AiParsedQuery = {
  locality?: string;
  bhk?: string;
  furnishing?: string;
  tenantType?: string;
  maxRent?: string;
};

/**
 * Rule-based "AI" query parser — no ML/NLP. Matches known vocabulary and a
 * simple budget pattern out of free text typed into the mock AI search bar.
 */
export function parseAiQuery(text: string): AiParsedQuery {
  const lower = text.toLowerCase();
  const result: AiParsedQuery = {};

  const locality = LOCALITIES.find(l => lower.includes(l.toLowerCase()));
  if (locality) result.locality = locality;

  const bhk = BHKS.find(b => new RegExp(`\\b${b.replace('+', '\\+')}\\s*bhk`, 'i').test(lower));
  if (bhk) result.bhk = bhk;

  const furnishing = FURNISH.find(f => f.v && lower.includes(f.v));
  if (furnishing) result.furnishing = furnishing.v;

  const tenantType = TENANTS.find(t => t.v && lower.includes(t.v));
  if (tenantType) result.tenantType = tenantType.v;

  const kMatch = lower.match(/₹?\s*(\d{2,3})\s*k\b/);
  if (kMatch) {
    result.maxRent = String(Number(kMatch[1]) * 1000);
  } else {
    const rawMatch = lower.match(/₹\s*(\d{4,6})\b/) ?? lower.match(/\b(\d{4,6})\b/);
    if (rawMatch) result.maxRent = rawMatch[1];
  }

  return result;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd app && npx vitest run src/lib/searchFilters.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Refactor `SearchPanel.tsx` to use the shared vocab**

In `app/src/components/SearchPanel.tsx`, replace lines 1-19 (imports through the `TENANTS` const) with:

```tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, MagnifyingGlass } from '@phosphor-icons/react';
import { Select } from './Select';
import { LOCALITIES, BHKS, FURNISH, TENANTS } from '../lib/searchFilters';
```

Delete the old inline `LOCALITIES`, `BHKS`, `FURNISH`, `TENANTS` const declarations (previously lines 7-19) — the rest of the file (the `chip` helper, the `SearchPanel` component body) is unchanged.

- [ ] **Step 6: Run the full test suite to confirm no regression**

Run: `cd app && npm test -- --run`
Expected: PASS, same 12 test files / 51+ tests as before (no `SearchPanel` behavior changed, only where the constants come from).

- [ ] **Step 7: Commit**

```bash
git add app/src/lib/searchFilters.ts app/src/lib/searchFilters.test.ts app/src/components/SearchPanel.tsx
git commit -m "refactor: extract shared search vocab + add mock AI query parser"
```

---

### Task 2: `HeroSearchCard` component (desktop search card)

**Files:**
- Create: `app/src/components/HeroSearchCard.tsx`
- Create: `app/src/components/HeroSearchCard.test.tsx`

**Interfaces:**
- Consumes: `LOCALITIES`, `BHKS`, `FURNISH`, `TENANTS`, `parseAiQuery` from `../lib/searchFilters` (Task 1); `Select` from `./Select`.
- Produces: `export function HeroSearchCard(): JSX.Element` — no props. Navigates to `/results?locality=...&bhk=...&maxRent=...&furnishing=...&tenantType=...` on either bar's submit (only non-empty params are included). Renders three tabs: "Rentals" (active pill, no navigation), "Owners" (`Link` to `/owner/new`), "Tenants" (`Link` to `/tenant/verify`).
- Consumed by: Task 4 (`Home.tsx`).

- [ ] **Step 1: Write the failing test**

Create `app/src/components/HeroSearchCard.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HeroSearchCard } from './HeroSearchCard';
import { LOCALITIES } from '../lib/searchFilters';

function ResultsProbe() {
  const loc = useLocation();
  return <div data-testid="results-probe">{loc.search}</div>;
}

function renderCard() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<HeroSearchCard />} />
        <Route path="/results" element={<ResultsProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('HeroSearchCard', () => {
  it('shows Rentals as the active tab and links Owners/Tenants to their routes', () => {
    renderCard();
    expect(screen.getByText('Rentals')).toBeInTheDocument();
    expect(screen.getByText('Owners').closest('a')).toHaveAttribute('href', '/owner/new');
    expect(screen.getByText('Tenants').closest('a')).toHaveAttribute('href', '/tenant/verify');
  });

  it('parses the AI query and navigates to /results with the matched filters', () => {
    renderCard();
    fireEvent.change(screen.getByPlaceholderText(/Try asking for/), {
      target: { value: '2BHK under ₹35k in Koramangala, furnished' },
    });
    fireEvent.click(screen.getByText('Ask AI'));
    const search = screen.getByTestId('results-probe').textContent ?? '';
    expect(search).toContain('locality=Koramangala');
    expect(search).toContain('bhk=2');
    expect(search).toContain('furnishing=furnished');
    expect(search).toContain('maxRent=35000');
  });

  it('submits the manual search with the selected locality', () => {
    renderCard();
    fireEvent.click(screen.getByText('Search'));
    const search = screen.getByTestId('results-probe').textContent ?? '';
    expect(search).toContain(`locality=${LOCALITIES[0]}`);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd app && npx vitest run src/components/HeroSearchCard.test.tsx`
Expected: FAIL — `Failed to resolve import "./HeroSearchCard"`.

- [ ] **Step 3: Write the implementation**

Create `app/src/components/HeroSearchCard.tsx`:

```tsx
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MagnifyingGlass, Sparkle } from '@phosphor-icons/react';
import { Select } from './Select';
import { LOCALITIES, BHKS, FURNISH, TENANTS, parseAiQuery } from '../lib/searchFilters';

const BHK_OPTS = [{ v: '', l: 'Any BHK' }, ...BHKS.map(b => ({ v: b, l: `${b} BHK` }))];
const tabBase = 'rounded-full px-4 py-2 text-sm font-bold transition';

type SearchParams = {
  locality?: string;
  bhk?: string;
  maxRent?: string;
  furnishing?: string;
  tenantType?: string;
};

export function HeroSearchCard() {
  const nav = useNavigate();
  const [aiQuery, setAiQuery] = useState('');
  const [locality, setLocality] = useState(LOCALITIES[0]);
  const [bhk, setBhk] = useState('');
  const [maxRent, setMaxRent] = useState('');
  const [furnishing, setFurnishing] = useState('');
  const [tenantType, setTenantType] = useState('');

  const goToResults = (params: SearchParams) => {
    const search = new URLSearchParams();
    (Object.entries(params) as [keyof SearchParams, string | undefined][]).forEach(([k, v]) => {
      if (v) search.set(k, v);
    });
    nav(`/results?${search.toString()}`);
  };

  const submitAi = (e: FormEvent) => {
    e.preventDefault();
    goToResults(parseAiQuery(aiQuery));
  };

  const submitManual = (e: FormEvent) => {
    e.preventDefault();
    goToResults({ locality, bhk, maxRent, furnishing, tenantType });
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-card">
      <div className="flex items-center gap-2">
        <span className={`${tabBase} bg-blueharbor text-white`}>Rentals</span>
        <Link to="/owner/new" className={`${tabBase} text-coolgrey hover:text-graphite`}>Owners</Link>
        <Link to="/tenant/verify" className={`${tabBase} text-coolgrey hover:text-graphite`}>Tenants</Link>
      </div>

      <form onSubmit={submitAi} className="mt-4 flex items-center gap-3 rounded-2xl border border-line px-4 py-3.5">
        <Sparkle size={20} weight="fill" className="shrink-0 text-blueharbor" />
        <input
          value={aiQuery}
          onChange={e => setAiQuery(e.target.value)}
          placeholder="Try asking for '2BHK under ₹35k in Koramangala, furnished'"
          className="flex-1 text-sm font-semibold text-graphite outline-none placeholder:font-medium placeholder:text-coolgrey"
        />
        <button type="submit" className="rounded-full bg-blueharbor px-4 py-2 text-sm font-bold text-white">
          Ask AI
        </button>
      </form>

      <form onSubmit={submitManual} className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
        <div className="min-w-[160px] flex-1">
          <Select value={locality} onChange={setLocality} options={LOCALITIES.map(l => ({ v: l, l }))} ariaLabel="Location" />
        </div>
        <Select variant="pill" value={bhk} onChange={setBhk} options={BHK_OPTS} active={bhk !== ''} ariaLabel="BHK" />
        <input
          value={maxRent}
          onChange={e => setMaxRent(e.target.value)}
          inputMode="numeric"
          placeholder="Max ₹/mo"
          className="w-28 rounded-full border border-line px-3.5 py-1.5 text-sm font-semibold text-graphite outline-none focus:border-blueharbor"
        />
        <Select variant="pill" value={furnishing} onChange={setFurnishing} options={FURNISH} active={furnishing !== ''} ariaLabel="Furnishing" />
        <Select variant="pill" value={tenantType} onChange={setTenantType} options={TENANTS} active={tenantType !== ''} ariaLabel="Tenant type" />
        <button type="submit" className="ml-auto inline-flex items-center gap-2 rounded-full bg-blueharbor px-5 py-2 text-sm font-bold text-white">
          <MagnifyingGlass size={16} weight="bold" /> Search
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd app && npx vitest run src/components/HeroSearchCard.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add app/src/components/HeroSearchCard.tsx app/src/components/HeroSearchCard.test.tsx
git commit -m "feat: add desktop HeroSearchCard (Rentals/Owners/Tenants tabs, AI + manual search bars)"
```

---

### Task 3: Desktop Navbar variant (site-wide)

**Files:**
- Modify: `app/src/components/Navbar.tsx:29-63` (the `return` block's header markup, before the drawer)
- Create: `app/src/components/Navbar.test.tsx`

**Interfaces:**
- No new exports — `Navbar` keeps its existing `export function Navbar()` signature and existing `open`/`onHero` state/logic for the mobile bar and drawer.
- Consumed by: `App.tsx` (unchanged import).

- [ ] **Step 1: Write the failing test**

Create `app/src/components/Navbar.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Navbar } from './Navbar';

describe('Navbar', () => {
  it('renders the promoted desktop links', () => {
    render(<MemoryRouter><Navbar /></MemoryRouter>);
    ['Browse rentals', 'How it works', 'Trust & verification', 'Pricing'].forEach(label => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('opens the slide-in menu from the desktop hamburger button too', () => {
    render(<MemoryRouter><Navbar /></MemoryRouter>);
    const openButtons = screen.getAllByLabelText('Open menu');
    expect(openButtons.length).toBe(2); // mobile bar + desktop bar
    fireEvent.click(openButtons[openButtons.length - 1]);
    expect(screen.getByLabelText('Close menu')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd app && npx vitest run src/components/Navbar.test.tsx`
Expected: FAIL — only 1 "Open menu" button exists yet, and the desktop link labels aren't in the DOM.

- [ ] **Step 3: Write the implementation**

In `app/src/components/Navbar.tsx`, replace the `return (` block from the opening `<header ...>` through the closing `</header>` (previously lines 29-63) with:

```tsx
  const DESKTOP_LINKS = [
    { label: 'Browse rentals', to: '/' },
    { label: 'How it works', to: '/' },
    { label: 'Trust & verification', to: '/' },
    { label: 'Pricing', to: '/' },
  ];

  return (
    <header className="relative z-30">
      {/* mobile bar — absolute overlay on the hero, unchanged behavior below lg */}
      <div className="absolute inset-x-0 top-0 bg-transparent lg:hidden">
        <div className="mx-auto grid h-16 max-w-5xl grid-cols-3 items-center px-4">
          <div className="flex justify-start">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border ${onHero ? 'border-white/50 text-white' : 'border-line text-graphite'}`}
            >
              <List size={20} />
            </button>
          </div>

          <div className="flex justify-center">
            <Link to="/" className={`font-display text-xl font-extrabold tracking-wide ${onHero ? 'text-white' : 'text-graphite'}`}>
              PROP<span className={onHero ? 'text-iceblue' : 'text-blueharbor'}>WEB</span>
            </Link>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className={`rounded-lg border-[1.5px] px-5 py-2 text-[15px] font-bold ${onHero ? 'border-white/70 text-white' : 'border-blueharbor text-blueharbor'}`}
            >
              Sign in
            </button>
          </div>
        </div>
      </div>

      {/* desktop bar — solid, in normal document flow, separated from the hero below it */}
      <div className="hidden border-b border-line bg-white lg:block">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-8">
          <div className="flex items-center gap-10">
            <Link to="/" className="font-display text-xl font-extrabold tracking-wide text-graphite">
              PROP<span className="text-blueharbor">WEB</span>
            </Link>
            <nav className="flex items-center gap-8">
              {DESKTOP_LINKS.map(l => (
                <Link key={l.label} to={l.to} className="text-sm font-semibold text-graphite transition hover:text-blueharbor">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-graphite"
            >
              <List size={20} />
            </button>
            <button
              type="button"
              className="rounded-lg border-[1.5px] border-blueharbor px-5 py-2 text-[15px] font-bold text-blueharbor"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>

      {/* slide-in menu drawer — shared by both bars */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <div className="absolute inset-0 bg-graphite/40" />
            <motion.nav
              aria-label="Main menu"
              onClick={e => e.stopPropagation()}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="absolute left-0 top-0 flex h-full w-80 max-w-[85%] flex-col bg-white p-5 shadow-card"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-extrabold">
                  PROP<span className="text-blueharbor">WEB</span>
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-coolgrey hover:bg-moontint"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="mt-1 text-xs font-semibold text-coolgrey">Trust-first rentals in Bengaluru</p>

              <ul className="mt-6 space-y-1">
                {MENU.map(m => {
                  const Icon = m.icon;
                  return (
                    <li key={m.label}>
                      <Link
                        to={m.to}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm font-semibold text-graphite hover:bg-moontint"
                      >
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-moontint text-blueharbor">
                          <Icon size={18} />
                        </span>
                        {m.label}
                        <CaretRight size={14} className="ml-auto text-coolgrey" />
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-auto pt-4">
                <Link
                  to="/owner/new"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blueharbor to-[#5B93E6] px-4 py-3 text-sm font-bold text-white shadow-card"
                >
                  <House size={18} /> List your property
                </Link>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
```

Note: `DESKTOP_LINKS` is declared inside the component body, right before the `return`, alongside the existing `onHero` line — do not hoist it above the component (it doesn't need to be, it has no dependency on props/state, but keeping it colocated with the render logic that uses it is fine here since this is a small component).

- [ ] **Step 4: Run test to verify it passes**

Run: `cd app && npx vitest run src/components/Navbar.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Run the full test suite to confirm no regression**

Run: `cd app && npm test -- --run`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/src/components/Navbar.tsx app/src/components/Navbar.test.tsx
git commit -m "feat: add solid site-wide desktop navbar, separated from hero at lg+"
```

---

### Task 4: Wire the desktop hero into `Home.tsx` + fix document-flow offset in `App.tsx`

**Files:**
- Modify: `app/src/App.tsx:16`
- Modify: `app/src/pages/Home.tsx:17,25-39`

**Interfaces:**
- Consumes: `HeroSearchCard` from `../components/HeroSearchCard` (Task 2).
- No new exports.

- [ ] **Step 1: Fix the flow offset in `App.tsx`**

The mobile navbar is `absolute` (zero flow height, hence the manual `pt-16` offset below it). The new desktop navbar (Task 3) is in normal flow with real height, so the manual offset must not apply at `lg+`.

In `app/src/App.tsx`, change line 16 from:

```tsx
        <div className="pt-16">
```

to:

```tsx
        <div className="pt-16 lg:pt-0">
```

- [ ] **Step 2: Update the hero section wrapper in `Home.tsx`**

In `app/src/pages/Home.tsx`, change line 17 from:

```tsx
      <section className="relative -mt-16 overflow-hidden rounded-b-2xl">
```

to:

```tsx
      <section className="relative -mt-16 overflow-hidden rounded-b-2xl lg:mt-0 lg:rounded-none">
```

(The `-mt-16` canceled the mobile `pt-16` so the hero image reaches the very top under the transparent mobile navbar. At `lg+`, `App.tsx`'s wrapper no longer has that padding, so the negative margin must be canceled too — otherwise the hero would be pulled up underneath the now-solid desktop navbar.)

- [ ] **Step 3: Left-align the heading, add the subheading, and swap in `HeroSearchCard` at `lg+`**

In `app/src/pages/Home.tsx`, add the import at the top (after the existing `SearchPanel` import on line 7):

```tsx
import { HeroSearchCard } from '../components/HeroSearchCard';
```

Then replace lines 24-39 (from `<div className="relative mx-auto max-w-5xl px-5 pt-24 pb-10 text-center">` through the closing `</div>` before `</section>`) with:

```tsx
        <div className="relative mx-auto max-w-5xl px-5 pt-24 pb-10 text-center lg:max-w-7xl lg:px-8 lg:pb-24 lg:pt-20 lg:text-left">
          <h1
            style={{ fontFamily: "'Onest', 'Manrope', system-ui, sans-serif" }}
            className="text-[36px] font-black leading-[40px] text-white lg:text-[48px] lg:leading-[52px]"
          >
            No Brokers.<br className="lg:hidden" />
            No Fakes.
          </h1>
          <p className="hidden text-base font-semibold text-white/85 lg:mt-3 lg:block lg:max-w-md">
            Verified listings only. Direct from owners.
          </p>
          {!searchOpen && (
            <motion.button
              layoutId="searchbar"
              onClick={() => setSearchOpen(true)}
              className="mx-auto mt-6 flex w-full max-w-md items-center gap-3 rounded-2xl bg-white px-4 py-4 text-left shadow-card lg:hidden"
            >
              <MagnifyingGlass size={22} className="text-coolgrey" />
              <span className="text-sm font-semibold text-coolgrey">Search location, budget, filters…</span>
            </motion.button>
          )}
          <div className="hidden lg:mt-8 lg:block lg:max-w-2xl">
            <HeroSearchCard />
          </div>
        </div>
```

- [ ] **Step 4: Run the full test suite**

Run: `cd app && npm test -- --run`
Expected: PASS. (No existing `Home` test exists, so this step only confirms nothing else broke — visual correctness is checked in Task 5.)

- [ ] **Step 5: Commit**

```bash
git add app/src/App.tsx app/src/pages/Home.tsx
git commit -m "feat: desktop hero layout — left-aligned heading, subheading, HeroSearchCard"
```

---

### Task 5: Manual visual verification

Automated tests can't verify actual breakpoint rendering (jsdom doesn't apply CSS/media queries) — this task is a real-browser check.

**Files:** none (verification only).

- [ ] **Step 1: Run the full test suite one more time**

Run: `cd app && npm test -- --run`
Expected: PASS, all test files green.

- [ ] **Step 2: Build to catch any TypeScript/production-build errors**

Run: `cd app && npm run build`
Expected: exits 0, no TS errors.

- [ ] **Step 3: Start the dev server and check the desktop layout**

Run: `cd app && npm run dev` (background)

Open `http://localhost:5173` in a browser at a width ≥1024px and confirm:
- The navbar is a solid white bar in normal flow, with the logo, the four links, the hamburger, and "Sign in" all visible, sitting *above* (not overlapping) the hero image.
- The hero heading is left-aligned with the new subheading beneath it.
- The `HeroSearchCard` renders below the heading with the Rentals/Owners/Tenants tabs, the AI search bar, and the manual filter bar.
- Typing something like "2bhk in Koramangala under 35k furnished" into the AI bar and clicking "Ask AI" navigates to `/results` pre-filtered.
- Clicking "Search" on the manual bar (with the default locality) navigates to `/results` filtered by that locality.
- Clicking "Owners" navigates to `/owner/new`; clicking "Tenants" navigates to `/tenant/verify`.
- Resize the window below 1024px and confirm the mobile layout (transparent overlay navbar, centered heading, single search button opening the full-screen `SearchPanel`) is unchanged.

- [ ] **Step 4: Stop the dev server**

If left running in the background from Step 3, stop it once verification is complete.

## Self-Review Notes

- **Spec coverage:** Navbar desktop variant (Task 3) ✓, hero left-align + subheading + card swap (Task 4) ✓, `HeroSearchCard` tabs/AI-bar/manual-bar (Task 2) ✓, shared `searchFilters.ts` (Task 1) ✓, mobile untouched (verified in Task 5, Step 3's last bullet) ✓, App.tsx flow-offset fix (Task 4, Step 1) ✓, dropped video CTA — no task adds it, consistent with spec's explicit cut ✓.
- **Placeholder scan:** none found — every step has real, complete code.
- **Type consistency:** `AiParsedQuery` (Task 1) has the exact same 5 optional keys as the `SearchParams` type used in `HeroSearchCard` (Task 2); `parseAiQuery`'s return type matches what `goToResults` accepts (both use `locality`/`bhk`/`furnishing`/`tenantType`/`maxRent`, all `string | undefined`).
