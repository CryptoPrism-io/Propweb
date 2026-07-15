# Desktop Navbar + Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the app a real desktop (`lg:` 1024px+) layout for the navbar and Home hero, matching the separated-navbar / hero-search-card structure of `References/deskstop hero.jpg`, with a mocked "AI thinking" search experience in both directions — tenant searching listings, and owner searching tenants.

**Architecture:** Add `lg:` Tailwind variants directly inside the existing `Navbar` and `Home` components (no viewport-detection hook, no separate component tree). Add a new `HeroSearchCard` component (desktop-only) with three tabs (Rentals/Owners/Tenants), a shared `lib/searchFilters.ts` module (vocab + rule-based query parsers for both search directions), a small reusable `useAiThinking` hook (mocked staged "AI thinking" delay), a mirrored `tenantMatchScore` scoring function, a new mock `tenants.json` pool, and a new `OwnerMatches` results page.

**Tech Stack:** React 19 + TypeScript, React Router 7, Tailwind CSS, Vitest + React Testing Library, `@phosphor-icons/react`.

## Global Constraints

- No real AI/ML — both "Ask AI" bars do simple keyword/regex parsing only (PLAN.md: "rule-based match only"). The "thinking" sequence is a cosmetic `setTimeout` delay layered on top of parsing that already completed synchronously.
- Mobile (`<lg`) behavior must not change — every change is additive via `lg:` variants.
- Desktop nav links that don't have a real destination page yet point to `/` (matches the existing mobile `MENU` array's convention in `Navbar.tsx` — do not invent new routes).
- Query param names for tenant-side search results are fixed by `Results.tsx` (`app/src/pages/Results.tsx:28-34`): `locality`, `bhk`, `maxRent`, `furnishing`, `tenantType`.
- Owner-side search results use `locality` and `minRent` as query param names (new route, `OwnerMatches`).
- Spec: `docs/superpowers/specs/2026-07-15-desktop-navbar-hero-design.md` (including the 2026-07-15 addendum).

---

### Task 1: Shared search vocabulary + both AI mock query parsers

**Files:**
- Create: `app/src/lib/searchFilters.ts`
- Create: `app/src/lib/searchFilters.test.ts`
- Modify: `app/src/components/SearchPanel.tsx:1-19` (remove inline consts, import shared ones)

**Interfaces:**
- Produces: `LOCALITIES: string[]`, `BHKS: string[]`, `FURNISH: {v: string; l: string}[]`, `TENANTS: {v: string; l: string}[]`, `parseAiQuery(text: string): AiParsedQuery` where `AiParsedQuery = { locality?: string; bhk?: string; furnishing?: string; tenantType?: string; maxRent?: string }`, `parseOwnerAiQuery(text: string): OwnerAiParsedQuery` where `OwnerAiParsedQuery = { locality?: string; minRent?: string }`.
- Consumed by: Task 4 (`HeroSearchCard`).

- [ ] **Step 1: Write the failing test**

Create `app/src/lib/searchFilters.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { parseAiQuery, parseOwnerAiQuery, LOCALITIES, BHKS, FURNISH, TENANTS } from './searchFilters';

describe('searchFilters vocab', () => {
  it('exposes the shared locality/bhk/furnishing/tenant vocab', () => {
    expect(LOCALITIES).toContain('Koramangala');
    expect(BHKS).toEqual(['1', '2', '3', '3+']);
    expect(FURNISH.map(f => f.v)).toEqual(['', 'unfurnished', 'semi', 'furnished']);
    expect(TENANTS.map(t => t.v)).toEqual(['', 'family', 'bachelor']);
  });
});

describe('parseAiQuery (tenant side)', () => {
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

describe('parseOwnerAiQuery (owner side)', () => {
  it('extracts locality and a min-rent figure', () => {
    expect(parseOwnerAiQuery('Tenants near me in Koramangala willing to pay 30k min rent')).toEqual({
      locality: 'Koramangala', minRent: '30000',
    });
  });

  it('returns an empty object when nothing matches', () => {
    expect(parseOwnerAiQuery('show me good tenants')).toEqual({});
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

export type OwnerAiParsedQuery = {
  locality?: string;
  minRent?: string;
};

function findLocality(lower: string): string | undefined {
  return LOCALITIES.find(l => lower.includes(l.toLowerCase()));
}

function parseRentToken(lower: string): string | undefined {
  const kMatch = lower.match(/₹?\s*(\d{2,3})\s*k\b/);
  if (kMatch) return String(Number(kMatch[1]) * 1000);
  const rawMatch = lower.match(/₹\s*(\d{4,6})\b/) ?? lower.match(/\b(\d{4,6})\b/);
  return rawMatch ? rawMatch[1] : undefined;
}

/**
 * Rule-based "AI" query parser (tenant side) — no ML/NLP. Matches known
 * vocabulary and a simple rent pattern out of free text.
 */
export function parseAiQuery(text: string): AiParsedQuery {
  const lower = text.toLowerCase();
  const result: AiParsedQuery = {};

  const locality = findLocality(lower);
  if (locality) result.locality = locality;

  const bhk = BHKS.find(b => new RegExp(`\\b${b.replace('+', '\\+')}\\s*bhk`, 'i').test(lower));
  if (bhk) result.bhk = bhk;

  const furnishing = FURNISH.find(f => f.v && lower.includes(f.v));
  if (furnishing) result.furnishing = furnishing.v;

  const tenantType = TENANTS.find(t => t.v && lower.includes(t.v));
  if (tenantType) result.tenantType = tenantType.v;

  const maxRent = parseRentToken(lower);
  if (maxRent) result.maxRent = maxRent;

  return result;
}

/**
 * Rule-based "AI" query parser (owner side) — parses a locality and a
 * minimum-rent-willingness figure out of free text like "tenants near me
 * willing to pay 30k min rent".
 */
export function parseOwnerAiQuery(text: string): OwnerAiParsedQuery {
  const lower = text.toLowerCase();
  const result: OwnerAiParsedQuery = {};

  const locality = findLocality(lower);
  if (locality) result.locality = locality;

  const minRent = parseRentToken(lower);
  if (minRent) result.minRent = minRent;

  return result;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd app && npx vitest run src/lib/searchFilters.test.ts`
Expected: PASS (6 tests).

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
Expected: PASS, no `SearchPanel` behavior changed, only where the constants come from.

- [ ] **Step 7: Commit**

```bash
git add app/src/lib/searchFilters.ts app/src/lib/searchFilters.test.ts app/src/components/SearchPanel.tsx
git commit -m "refactor: extract shared search vocab + add both AI mock query parsers"
```

---

### Task 2: Tenant pool data + owner-side match scoring

**Files:**
- Create: `app/public/data/tenants.json`
- Modify: `app/src/lib/data.ts` (add `loadTenants`)
- Modify: `app/src/lib/data.test.ts` (add coverage for the new pool)
- Modify: `app/src/lib/matchScore.ts` (add `tenantMatchScore`)
- Modify: `app/src/lib/matchScore.test.ts` (add coverage for `tenantMatchScore`)

**Interfaces:**
- Produces: `loadTenants(): Promise<TenantProfile[]>`, `tenantMatchScore(tenant: TenantProfile, query: { locality?: string; minRent?: number }): number`.
- Consumed by: Task 5 (`OwnerMatches` page).

- [ ] **Step 1: Write the failing tests**

Add to `app/src/lib/matchScore.test.ts` (append, keep the existing `matchScore` describe block and its `tenant`/`base` fixtures as-is):

```ts
import { tenantMatchScore } from './matchScore'; // add to the existing import line

describe('tenantMatchScore', () => {
  it('is 100 when locality matches and budgetMax covers the minRent ask', () => {
    expect(tenantMatchScore(tenant, { locality: 'Koramangala', minRent: 30000 })).toBe(100);
  });
  it('is 100 for an unqualified query (no locality/minRent given)', () => {
    expect(tenantMatchScore(tenant, {})).toBe(100);
  });
  it('drops locality points when the tenant does not prefer that locality', () => {
    expect(tenantMatchScore(tenant, { locality: 'Whitefield' })).toBe(65); // 15 + 50
  });
  it('reduces rent points as budgetMax falls under the minRent ask, hitting 0 at -50%', () => {
    expect(tenantMatchScore(tenant, { minRent: 70000 })).toBe(50); // 50 (locality unspecified) + 0
  });
  it('scales rent points proportionally for a partial shortfall', () => {
    expect(tenantMatchScore(tenant, { minRent: 45500 })).toBe(77); // 50 + ~27
  });
});
```

(Note: `tenant` fixture has `budgetMax: 35000`, `preferredLocalities: ['Koramangala']` — reuse it exactly as already defined at the top of this file.)

Add to `app/src/lib/data.test.ts` (append inside the existing `describe('seed data', ...)` block, and add `loadTenants` to the existing import line):

```ts
import { loadTenants } from './data'; // add to the existing import line

it('has a tenant pool of at least 8 profiles spanning multiple localities', async () => {
  const tenants = await loadTenants();
  expect(tenants.length).toBeGreaterThanOrEqual(8);
  const covered = new Set(tenants.flatMap(t => t.preferredLocalities));
  for (const loc of LOCALITIES) expect(covered.has(loc)).toBe(true);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd app && npx vitest run src/lib/matchScore.test.ts src/lib/data.test.ts`
Expected: FAIL — `tenantMatchScore`/`loadTenants` not exported yet, and `tenants.json` doesn't exist.

- [ ] **Step 3: Create the mock tenant pool**

Create `app/public/data/tenants.json`:

```json
[
  { "id": "t1", "name": "Ananya Rao", "budgetMin": 20000, "budgetMax": 35000, "preferredLocalities": ["Koramangala", "HSR Layout"], "tenantType": "family", "furnishing": "semi", "moveInDate": "2026-08-01" },
  { "id": "t2", "name": "Rahul Menon", "budgetMin": 15000, "budgetMax": 25000, "preferredLocalities": ["Whitefield"], "tenantType": "bachelor", "furnishing": "furnished", "moveInDate": "2026-08-10" },
  { "id": "t3", "name": "Priya Sharma", "budgetMin": 40000, "budgetMax": 60000, "preferredLocalities": ["Indiranagar", "Koramangala"], "tenantType": "family", "furnishing": "furnished", "moveInDate": "2026-09-01" },
  { "id": "t4", "name": "Arjun Kulkarni", "budgetMin": 18000, "budgetMax": 30000, "preferredLocalities": ["JP Nagar"], "tenantType": "bachelor", "furnishing": "unfurnished", "moveInDate": "2026-08-15" },
  { "id": "t5", "name": "Divya Iyer", "budgetMin": 30000, "budgetMax": 45000, "preferredLocalities": ["HSR Layout", "Koramangala"], "tenantType": "family", "furnishing": "semi", "moveInDate": "2026-08-20" },
  { "id": "t6", "name": "Karthik Reddy", "budgetMin": 50000, "budgetMax": 85000, "preferredLocalities": ["Indiranagar"], "tenantType": "family", "furnishing": "furnished", "moveInDate": "2026-09-10" },
  { "id": "t7", "name": "Sneha Pillai", "budgetMin": 20000, "budgetMax": 32000, "preferredLocalities": ["Whitefield", "JP Nagar"], "tenantType": "bachelor", "furnishing": "semi", "moveInDate": "2026-08-05" },
  { "id": "t8", "name": "Vikram Nair", "budgetMin": 25000, "budgetMax": 40000, "preferredLocalities": ["Koramangala"], "tenantType": "bachelor", "furnishing": "unfurnished", "moveInDate": "2026-08-25" },
  { "id": "t9", "name": "Meera Joshi", "budgetMin": 35000, "budgetMax": 55000, "preferredLocalities": ["HSR Layout", "Indiranagar"], "tenantType": "family", "furnishing": "furnished", "moveInDate": "2026-09-05" },
  { "id": "t10", "name": "Aditya Verma", "budgetMin": 18000, "budgetMax": 28000, "preferredLocalities": ["JP Nagar", "Whitefield"], "tenantType": "bachelor", "furnishing": "unfurnished", "moveInDate": "2026-08-12" }
]
```

- [ ] **Step 4: Add `loadTenants` to `data.ts`**

In `app/src/lib/data.ts`, add this line after the existing `loadTenant` export:

```ts
export const loadTenants = () => getJson<TenantProfile[]>('/data/tenants.json');
```

- [ ] **Step 5: Add `tenantMatchScore` to `matchScore.ts`**

In `app/src/lib/matchScore.ts`, add this function after the existing `matchScore` function:

```ts
export function tenantMatchScore(tenant: TenantProfile, query: { locality?: string; minRent?: number }): number {
  let score = 0;

  // Locality — 50%. Full if the tenant prefers the queried locality, or no locality was given.
  if (!query.locality || tenant.preferredLocalities.includes(query.locality)) {
    score += 50;
  } else {
    score += 15;
  }

  // Rent willingness — 50%. Full if budgetMax covers the owner's ask; linear to 0 at -50% under.
  if (!query.minRent) {
    score += 50;
  } else if (tenant.budgetMax >= query.minRent) {
    score += 50;
  } else {
    const under = (query.minRent - tenant.budgetMax) / query.minRent;
    score += Math.max(0, 50 * (1 - under / 0.5));
  }

  return Math.round(score);
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `cd app && npx vitest run src/lib/matchScore.test.ts src/lib/data.test.ts`
Expected: PASS (existing `matchScore` tests + 5 new `tenantMatchScore` tests + 1 new data test).

- [ ] **Step 7: Commit**

```bash
git add app/public/data/tenants.json app/src/lib/data.ts app/src/lib/data.test.ts app/src/lib/matchScore.ts app/src/lib/matchScore.test.ts
git commit -m "feat: add tenant pool data + tenantMatchScore for owner-side search"
```

---

### Task 3: `useAiThinking` mock-thinking hook

**Files:**
- Create: `app/src/hooks/useAiThinking.ts`
- Create: `app/src/hooks/useAiThinking.test.tsx`

**Interfaces:**
- Produces: `useAiThinking(steps: string[], onDone: () => void): { thinking: boolean; currentStep: string; start: () => void }`.
- Consumed by: Task 4 (`HeroSearchCard`, once per search bar).

- [ ] **Step 1: Write the failing test**

Create `app/src/hooks/useAiThinking.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAiThinking } from './useAiThinking';

describe('useAiThinking', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('cycles through steps and calls onDone after the sequence completes', () => {
    const onDone = vi.fn();
    const { result } = renderHook(() => useAiThinking(['Reading…', 'Matching…', 'Done'], onDone));

    act(() => result.current.start());
    expect(result.current.thinking).toBe(true);
    expect(result.current.currentStep).toBe('Reading…');

    act(() => { vi.advanceTimersByTime(550); });
    expect(result.current.currentStep).toBe('Matching…');

    act(() => { vi.advanceTimersByTime(550); });
    expect(result.current.currentStep).toBe('Done');

    act(() => { vi.advanceTimersByTime(550); });
    expect(result.current.thinking).toBe(false);
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd app && npx vitest run src/hooks/useAiThinking.test.tsx`
Expected: FAIL — `Failed to resolve import "./useAiThinking"`.

- [ ] **Step 3: Write the implementation**

Create `app/src/hooks/useAiThinking.ts`:

```ts
import { useCallback, useRef, useState } from 'react';

const STEP_DELAY_MS = 550;

/**
 * Drives a mocked "AI thinking" sequence: cycles through `steps` on a fixed
 * delay, then calls `onDone`. Purely cosmetic UI delay — any real parsing
 * should already have run synchronously before calling `start()`.
 */
export function useAiThinking(steps: string[], onDone: () => void) {
  const [thinking, setThinking] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const start = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setThinking(true);
    setStepIndex(0);

    steps.forEach((_, i) => {
      if (i === 0) return; // step 0 shows immediately, no timer needed
      timers.current.push(setTimeout(() => setStepIndex(i), i * STEP_DELAY_MS));
    });

    timers.current.push(
      setTimeout(() => {
        setThinking(false);
        onDone();
      }, steps.length * STEP_DELAY_MS),
    );
  }, [steps, onDone]);

  return { thinking, currentStep: steps[stepIndex], start };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd app && npx vitest run src/hooks/useAiThinking.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add app/src/hooks/useAiThinking.ts app/src/hooks/useAiThinking.test.tsx
git commit -m "feat: add useAiThinking mock-thinking-sequence hook"
```

---

### Task 4: `HeroSearchCard` component (desktop search card, both directions)

**Files:**
- Create: `app/src/components/HeroSearchCard.tsx`
- Create: `app/src/components/HeroSearchCard.test.tsx`

**Interfaces:**
- Consumes: `LOCALITIES`, `BHKS`, `FURNISH`, `TENANTS`, `parseAiQuery`, `parseOwnerAiQuery` from `../lib/searchFilters` (Task 1); `useAiThinking` from `../hooks/useAiThinking` (Task 3); `Select` from `./Select`.
- Produces: `export function HeroSearchCard(): JSX.Element` — no props. Renders three tabs: **Rentals** (default) — AI bar + manual filter bar, navigates to `/results?locality&bhk&maxRent&furnishing&tenantType` (only non-empty params included) after the thinking sequence; **Owners** — AI bar only + a link to `/owner/new`, navigates to `/owner/matches?locality&minRent` after the thinking sequence; **Tenants** — plain `Link` to `/tenant/verify`.
- Consumed by: Task 7 (`Home.tsx`).

- [ ] **Step 1: Write the failing test**

Create `app/src/components/HeroSearchCard.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HeroSearchCard } from './HeroSearchCard';
import { LOCALITIES } from '../lib/searchFilters';

function ResultsProbe() {
  const loc = useLocation();
  return <div data-testid="results-probe">{loc.pathname}{loc.search}</div>;
}

function renderCard() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<HeroSearchCard />} />
        <Route path="/results" element={<ResultsProbe />} />
        <Route path="/owner/matches" element={<ResultsProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('HeroSearchCard', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('defaults to the Rentals tab and links Tenants to /tenant/verify', () => {
    renderCard();
    expect(screen.getByText('Rentals')).toBeInTheDocument();
    expect(screen.getByText('Tenants').closest('a')).toHaveAttribute('href', '/tenant/verify');
  });

  it('runs the AI thinking sequence then navigates to /results with matched filters (Rentals)', () => {
    renderCard();
    fireEvent.change(screen.getByPlaceholderText(/Try asking for '2BHK/), {
      target: { value: '2BHK under ₹35k in Koramangala, furnished' },
    });
    fireEvent.click(screen.getByText('Ask AI'));
    expect(screen.getByText('Reading your request…')).toBeInTheDocument();

    act(() => { vi.advanceTimersByTime(1650); });

    const probe = screen.getByTestId('results-probe').textContent ?? '';
    expect(probe).toContain('/results');
    expect(probe).toContain('locality=Koramangala');
    expect(probe).toContain('bhk=2');
    expect(probe).toContain('furnishing=furnished');
    expect(probe).toContain('maxRent=35000');
  });

  it('submits the manual search with the selected locality', () => {
    renderCard();
    fireEvent.click(screen.getByText('Search'));
    const probe = screen.getByTestId('results-probe').textContent ?? '';
    expect(probe).toContain(`locality=${LOCALITIES[0]}`);
  });

  it('switches to the Owners tab and, after the AI thinking sequence, navigates to /owner/matches', () => {
    renderCard();
    fireEvent.click(screen.getByText('Owners'));
    fireEvent.change(screen.getByPlaceholderText(/Tenants near me/), {
      target: { value: 'Tenants near me in Koramangala willing to pay 30k min rent' },
    });
    fireEvent.click(screen.getByText('Ask AI'));
    expect(screen.getByText('Reading your request…')).toBeInTheDocument();

    act(() => { vi.advanceTimersByTime(1650); });

    const probe = screen.getByTestId('results-probe').textContent ?? '';
    expect(probe).toContain('/owner/matches');
    expect(probe).toContain('locality=Koramangala');
    expect(probe).toContain('minRent=30000');
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
import { useAiThinking } from '../hooks/useAiThinking';
import { LOCALITIES, BHKS, FURNISH, TENANTS, parseAiQuery, parseOwnerAiQuery } from '../lib/searchFilters';

const BHK_OPTS = [{ v: '', l: 'Any BHK' }, ...BHKS.map(b => ({ v: b, l: `${b} BHK` }))];
const tabBase = 'rounded-full px-4 py-2 text-sm font-bold transition';
const RENT_STEPS = ['Reading your request…', 'Matching verified listings…', 'Found your matches'];
const OWNER_STEPS = ['Reading your request…', 'Scanning nearby tenants…', 'Found your matches'];

type Tab = 'rentals' | 'owners';

type SearchParams = {
  locality?: string;
  bhk?: string;
  maxRent?: string;
  furnishing?: string;
  tenantType?: string;
};

function ThinkingStatus({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line px-4 py-3.5">
      <span className="h-2 w-2 animate-pulse rounded-full bg-blueharbor" />
      <span className="text-sm font-semibold text-graphite">{text}</span>
    </div>
  );
}

export function HeroSearchCard() {
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>('rentals');

  const [aiQuery, setAiQuery] = useState('');
  const [locality, setLocality] = useState(LOCALITIES[0]);
  const [bhk, setBhk] = useState('');
  const [maxRent, setMaxRent] = useState('');
  const [furnishing, setFurnishing] = useState('');
  const [tenantType, setTenantType] = useState('');
  const [ownerQuery, setOwnerQuery] = useState('');

  const goToResults = (params: SearchParams) => {
    const search = new URLSearchParams();
    (Object.entries(params) as [keyof SearchParams, string | undefined][]).forEach(([k, v]) => {
      if (v) search.set(k, v);
    });
    nav(`/results?${search.toString()}`);
  };

  const goToOwnerMatches = (params: { locality?: string; minRent?: string }) => {
    const search = new URLSearchParams();
    if (params.locality) search.set('locality', params.locality);
    if (params.minRent) search.set('minRent', params.minRent);
    nav(`/owner/matches?${search.toString()}`);
  };

  const rentalAi = useAiThinking(RENT_STEPS, () => goToResults(parseAiQuery(aiQuery)));
  const ownerAi = useAiThinking(OWNER_STEPS, () => goToOwnerMatches(parseOwnerAiQuery(ownerQuery)));

  const submitRentalAi = (e: FormEvent) => { e.preventDefault(); rentalAi.start(); };
  const submitOwnerAi = (e: FormEvent) => { e.preventDefault(); ownerAi.start(); };
  const submitManual = (e: FormEvent) => {
    e.preventDefault();
    goToResults({ locality, bhk, maxRent, furnishing, tenantType });
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-card">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setTab('rentals')}
          className={`${tabBase} ${tab === 'rentals' ? 'bg-blueharbor text-white' : 'text-coolgrey hover:text-graphite'}`}
        >
          Rentals
        </button>
        <button
          type="button"
          onClick={() => setTab('owners')}
          className={`${tabBase} ${tab === 'owners' ? 'bg-blueharbor text-white' : 'text-coolgrey hover:text-graphite'}`}
        >
          Owners
        </button>
        <Link to="/tenant/verify" className={`${tabBase} text-coolgrey hover:text-graphite`}>Tenants</Link>
      </div>

      {tab === 'rentals' && (
        <>
          {rentalAi.thinking ? (
            <div className="mt-4"><ThinkingStatus text={rentalAi.currentStep} /></div>
          ) : (
            <form onSubmit={submitRentalAi} className="mt-4 flex items-center gap-3 rounded-2xl border border-line px-4 py-3.5">
              <Sparkle size={20} weight="fill" className="shrink-0 text-blueharbor" />
              <input
                value={aiQuery}
                onChange={e => setAiQuery(e.target.value)}
                placeholder="Try asking for '2BHK in Koramangala, 2 baths, ₹30k/mo'"
                className="flex-1 text-sm font-semibold text-graphite outline-none placeholder:font-medium placeholder:text-coolgrey"
              />
              <button type="submit" className="rounded-full bg-blueharbor px-4 py-2 text-sm font-bold text-white">
                Ask AI
              </button>
            </form>
          )}

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
        </>
      )}

      {tab === 'owners' && (
        <div className="mt-4">
          {ownerAi.thinking ? (
            <ThinkingStatus text={ownerAi.currentStep} />
          ) : (
            <form onSubmit={submitOwnerAi} className="flex items-center gap-3 rounded-2xl border border-line px-4 py-3.5">
              <Sparkle size={20} weight="fill" className="shrink-0 text-blueharbor" />
              <input
                value={ownerQuery}
                onChange={e => setOwnerQuery(e.target.value)}
                placeholder="Try asking for 'Tenants near me willing to pay ₹30k min rent'"
                className="flex-1 text-sm font-semibold text-graphite outline-none placeholder:font-medium placeholder:text-coolgrey"
              />
              <button type="submit" className="rounded-full bg-blueharbor px-4 py-2 text-sm font-bold text-white">
                Ask AI
              </button>
            </form>
          )}
          <Link to="/owner/new" className="mt-3 inline-block text-sm font-semibold text-blueharbor hover:underline">
            or list your property instead →
          </Link>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd app && npx vitest run src/components/HeroSearchCard.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add app/src/components/HeroSearchCard.tsx app/src/components/HeroSearchCard.test.tsx
git commit -m "feat: add HeroSearchCard with mocked AI thinking, both search directions"
```

---

### Task 5: `OwnerMatches` results page + route

**Files:**
- Create: `app/src/pages/OwnerMatches.tsx`
- Create: `app/src/pages/OwnerMatches.test.tsx`
- Modify: `app/src/App.tsx` (add import + route)

**Interfaces:**
- Consumes: `loadTenants` from `../lib/data`, `tenantMatchScore` from `../lib/matchScore` (Task 2); `MatchChip` from `../components/MatchChip`.
- Produces: `export default function OwnerMatches(): JSX.Element`, mounted at `/owner/matches`, reading `locality`/`minRent` from the query string.

- [ ] **Step 1: Write the failing test**

Create `app/src/pages/OwnerMatches.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OwnerMatches from './OwnerMatches';

function renderPage(query: string) {
  return render(
    <MemoryRouter initialEntries={[`/owner/matches${query}`]}>
      <OwnerMatches />
    </MemoryRouter>,
  );
}

describe('OwnerMatches', () => {
  it('ranks tenants by match score for a locality + minRent query, highest first', async () => {
    renderPage('?locality=Koramangala&minRent=30000');
    await waitFor(() => expect(screen.getAllByText(/% match/).length).toBeGreaterThan(0));
    const scores = screen.getAllByText(/% match/).map(el => Number(el.textContent!.replace('% match', '')));
    const sorted = [...scores].sort((a, b) => b - a);
    expect(scores).toEqual(sorted);
  });

  it('shows all tenants and a "near you" heading when no query params are given', async () => {
    renderPage('');
    await waitFor(() => expect(screen.getByText(/tenants? found/)).toBeInTheDocument());
    expect(screen.getByText('Tenants near you')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd app && npx vitest run src/pages/OwnerMatches.test.tsx`
Expected: FAIL — `Failed to resolve import "./OwnerMatches"`.

- [ ] **Step 3: Write the implementation**

Create `app/src/pages/OwnerMatches.tsx`:

```tsx
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { UsersThree } from '@phosphor-icons/react';
import { loadTenants } from '../lib/data';
import { tenantMatchScore } from '../lib/matchScore';
import { MatchChip } from '../components/MatchChip';
import type { TenantProfile } from '../lib/types';

export default function OwnerMatches() {
  const [params] = useSearchParams();
  const [tenants, setTenants] = useState<TenantProfile[]>([]);
  const locality = params.get('locality') || undefined;
  const minRent = params.get('minRent') ? Number(params.get('minRent')) : undefined;

  useEffect(() => { loadTenants().then(setTenants); }, []);

  const ranked = useMemo(
    () => tenants
      .map(t => ({ tenant: t, score: tenantMatchScore(t, { locality, minRent }) }))
      .sort((a, b) => b.score - a.score),
    [tenants, locality, minRent],
  );

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 lg:max-w-7xl lg:px-8">
      <h1 className="font-display text-lg font-bold">
        Tenants {locality ? `near ${locality}` : 'near you'}
      </h1>
      <p className="mt-1 text-sm font-semibold text-coolgrey">
        {ranked.length} tenant{ranked.length === 1 ? '' : 's'} found
        {minRent ? ` · willing to pay ₹${minRent.toLocaleString('en-IN')}+` : ''}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ranked.map(({ tenant, score }) => (
          <div key={tenant.id} className="rounded-card border border-line bg-white p-4 shadow-card">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-moontint text-blueharbor">
                  <UsersThree size={20} weight="fill" />
                </span>
                <span className="font-display text-[15px] font-bold text-graphite">{tenant.name}</span>
              </div>
              <MatchChip percent={score} />
            </div>
            <p className="mt-3 text-sm font-semibold text-graphite">
              ₹{tenant.budgetMin.toLocaleString('en-IN')} – ₹{tenant.budgetMax.toLocaleString('en-IN')}/mo
            </p>
            <p className="mt-1 text-xs font-semibold text-coolgrey">
              {tenant.preferredLocalities.join(', ')} · {tenant.tenantType} · {tenant.furnishing}
            </p>
          </div>
        ))}
      </div>

      <Link to="/" className="mt-8 inline-block text-sm font-bold text-blueharbor hover:underline">
        ← Back to home
      </Link>
    </div>
  );
}
```

- [ ] **Step 4: Wire the route into `App.tsx`**

In `app/src/App.tsx`, add the import after the existing `TenantKyc` import:

```tsx
import OwnerMatches from './pages/OwnerMatches';
```

And add the route after the existing `/tenant/verify` route:

```tsx
            <Route path="/owner/matches" element={<OwnerMatches />} />
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd app && npx vitest run src/pages/OwnerMatches.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Run the full test suite to confirm no regression**

Run: `cd app && npm test -- --run`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add app/src/pages/OwnerMatches.tsx app/src/pages/OwnerMatches.test.tsx app/src/App.tsx
git commit -m "feat: add OwnerMatches results page at /owner/matches"
```

---

### Task 6: Desktop Navbar variant (site-wide)

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

### Task 7: Wire the desktop hero into `Home.tsx` + fix document-flow offset in `App.tsx`

**Files:**
- Modify: `app/src/App.tsx:16`
- Modify: `app/src/pages/Home.tsx:17,25-39`

**Interfaces:**
- Consumes: `HeroSearchCard` from `../components/HeroSearchCard` (Task 4).
- No new exports.

- [ ] **Step 1: Fix the flow offset in `App.tsx`**

The mobile navbar is `absolute` (zero flow height, hence the manual `pt-16` offset below it). The new desktop navbar (Task 6) is in normal flow with real height, so the manual offset must not apply at `lg+`.

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
Expected: PASS. (No existing `Home` test exists, so this step only confirms nothing else broke — visual correctness is checked in Task 8.)

- [ ] **Step 5: Commit**

```bash
git add app/src/App.tsx app/src/pages/Home.tsx
git commit -m "feat: desktop hero layout — left-aligned heading, subheading, HeroSearchCard"
```

---

### Task 8: Manual visual verification

Automated tests can't verify actual breakpoint rendering (jsdom doesn't apply CSS/media queries), and the "thinking" delay's actual feel is worth eyeballing — this task is a real-browser check.

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
- The `HeroSearchCard` renders below the heading with the Rentals/Owners/Tenants tabs.
- **Rentals tab:** typing "2bhk in Koramangala under 35k furnished" into the AI bar and clicking "Ask AI" shows the staged "thinking" status text briefly, then lands on `/results` pre-filtered. The manual filter bar below it still works and navigates to `/results` on "Search".
- **Owners tab:** click it, type "Tenants near me in Koramangala willing to pay 30k min rent", click "Ask AI" — shows the thinking sequence, then lands on `/owner/matches` with a ranked list of tenant cards, each with a match-score chip, sorted highest-first. The "or list your property instead →" link still goes to `/owner/new`.
- **Tenants tab:** clicking it navigates straight to `/tenant/verify`.
- Resize the window below 1024px and confirm the mobile layout (transparent overlay navbar, centered heading, single search button opening the full-screen `SearchPanel`) is unchanged.

- [ ] **Step 4: Stop the dev server**

If left running in the background from Step 3, stop it once verification is complete.

## Self-Review Notes

- **Spec coverage:** Navbar desktop variant (Task 6) ✓, hero left-align + subheading + card swap (Task 7) ✓, `HeroSearchCard` tabs/AI-bars/manual-bar (Task 4) ✓, shared `searchFilters.ts` with both parsers (Task 1) ✓, mocked AI thinking sequence (Task 3) ✓, tenant pool + owner-side scoring (Task 2) ✓, `OwnerMatches` results page (Task 5) ✓, mobile untouched (verified in Task 8) ✓, App.tsx flow-offset fix (Task 7, Step 1) ✓, dropped video CTA — no task adds it ✓.
- **Placeholder scan:** none found — every step has real, complete code.
- **Type consistency:** `AiParsedQuery`/`OwnerAiParsedQuery` (Task 1) match `SearchParams` / the inline owner-params type used in `HeroSearchCard` (Task 4); `tenantMatchScore`'s `query` param shape (`{ locality?: string; minRent?: number }`, Task 2) matches what `OwnerMatches` (Task 5) passes in (after `Number(params.get('minRent'))` conversion from the string query param).
