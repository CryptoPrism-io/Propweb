# PropWeb Demo App — Tenant Journey Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the PropWeb demo web-app foundation and the complete tenant journey — Home/search → Results (list+map) → Listing detail — as a clickable, no-backend front-end matching the locked design system.

**Architecture:** Vite + React + TypeScript single-page app. All data is local JSON (no backend/DB/auth/payments). Pure functions compute Match Score and Trust Score band/color. Reusable design-system primitives (Verified badge, Trust Score token, Match chip, Button) compose into a Listing card, which composes into pages. Client-side routing via react-router. Map via react-leaflet + OpenStreetMap.

**Tech Stack:** Vite, React 18, TypeScript, Tailwind CSS v3, @phosphor-icons/react, react-router-dom v6, react-leaflet v4 + leaflet, Vitest + @testing-library/react + jsdom.

## Global Constraints

- **App lives in** `app/` under the project root. All paths below are relative to `app/` unless noted.
- **No backend, DB, auth, or real payments.** Data is local JSON only (Handover Brief §8).
- **Design tokens (exact hex):** Moontint `#F3F6FF` (page bg), Blue harbor `#3770BF` (CTA/links), Ice blue `#8DC2FF` (secondary/chips), Lime glow `#C3EA4F` (trust: verified + high score), Graphite `#1B1E23` (text), Cool grey `#5B6470` (muted), Line `#DDE3EE` (borders), White `#FFFFFF`, Amber `#E8A13D` (medium score / pending), Muted red `#E5533D` (weak score).
- **Color rules:** Lime = trust only, never a button. Blue harbor = the single primary action per screen.
- **Trust Score scale:** 75–98 lime, 50–74 amber, 35–49 muted red. Score range in data: 35–98.
- **Match Score formula:** budget 40% + locality 25% + family/bachelor 15% + furnishing 10% + move-in 10%.
- **Icons:** Phosphor only (`@phosphor-icons/react`).
- **Verified badge:** scalloped/spiked seal + tick inside + "Verified" text, lime fill, graphite tick.
- **Trust Score display style (ring vs number) is DEFERRED** — render as a colored number pill now, behind a component boundary so it can change later.
- **Locality set:** Koramangala, HSR Layout, Indiranagar, Whitefield, JP Nagar. Rents ₹18,000–₹85,000.
- **Data volume:** 25–30 listings.
- Spec reference: `docs/superpowers/specs/2026-07-13-design-system-design.md`.

---

### Task 1: Scaffold app, Tailwind theme, design tokens, tooling

**Files:**
- Create: `app/` (Vite React-TS project), `app/tailwind.config.js`, `app/postcss.config.js`, `app/src/index.css`, `app/src/theme/tokens.ts`, `app/vitest.config.ts`, `app/src/test/setup.ts`
- Modify: `app/package.json` (scripts, deps)

**Interfaces:**
- Produces: `tokens` object export from `src/theme/tokens.ts`; Tailwind color names `moontint`, `blueharbor`, `iceblue`, `limeglow`, `graphite`, `coolgrey`, `line`, `amber`, `mutedred`; npm scripts `dev`, `build`, `test`.

- [ ] **Step 1: Initialize git (repo does not exist yet) and scaffold Vite app**

Run from project root `C:\Projects\Propweb`:
```bash
git init
npm create vite@latest app -- --template react-ts
cd app
npm install
npm install -D tailwindcss@3 postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom jsdom
npm install @phosphor-icons/react react-router-dom react-leaflet leaflet
npm install -D @types/leaflet
npx tailwindcss init -p
```

- [ ] **Step 2: Write design tokens**

Create `app/src/theme/tokens.ts`:
```ts
export const tokens = {
  moontint: '#F3F6FF',
  blueharbor: '#3770BF',
  iceblue: '#8DC2FF',
  limeglow: '#C3EA4F',
  graphite: '#1B1E23',
  coolgrey: '#5B6470',
  line: '#DDE3EE',
  white: '#FFFFFF',
  amber: '#E8A13D',
  mutedred: '#E5533D',
} as const;

export type ColorToken = keyof typeof tokens;
```

- [ ] **Step 3: Configure Tailwind theme**

Replace `app/tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        moontint: '#F3F6FF',
        blueharbor: '#3770BF',
        iceblue: '#8DC2FF',
        limeglow: '#C3EA4F',
        graphite: '#1B1E23',
        coolgrey: '#5B6470',
        line: '#DDE3EE',
        amber: '#E8A13D',
        mutedred: '#E5533D',
      },
      borderRadius: { card: '16px' },
      boxShadow: { card: '0 2px 12px rgba(27,30,35,0.08)' },
    },
  },
  plugins: [],
};
```

- [ ] **Step 4: Base CSS with Tailwind + Leaflet CSS**

Replace `app/src/index.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap');
@import 'leaflet/dist/leaflet.css';
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #root { height: 100%; }
body { background: #F3F6FF; color: #1B1E23; font-family: 'Inter', system-ui, -apple-system, Roboto, Arial, sans-serif; line-height: 24px; }
.font-display { font-family: 'Manrope', system-ui, sans-serif; }
```

Add the display font to Tailwind theme (`fontFamily`) in Step 3's config so `font-display` / Manrope is available:
```js
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  display: ['Manrope', 'system-ui', 'sans-serif'],
},
```
Apply `font-display` to the brand wordmark, page/section headings, card titles, and rent/price; Inter (default) everywhere else.

- [ ] **Step 5: Configure Vitest**

Create `app/vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', globals: true, setupFiles: ['./src/test/setup.ts'] },
});
```

Create `app/src/test/setup.ts`:
```ts
import '@testing-library/jest-dom';
```

Add to `app/package.json` `"scripts"`: `"test": "vitest run"`.

- [ ] **Step 6: Verify dev server and build run**

Run: `npm run build`
Expected: build completes with no type errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite React-TS app with Tailwind design tokens"
```

---

### Task 2: Types + seed data + data loader

**Files:**
- Create: `app/src/lib/types.ts`, `app/public/data/listings.json`, `app/public/data/owners.json`, `app/public/data/tenant.json`, `app/src/lib/data.ts`, `app/src/lib/data.test.ts`
- Assets: `app/public/photos/` (royalty-free interior JPGs, reused across listings)

**Interfaces:**
- Produces:
  - `Furnishing = 'unfurnished' | 'semi' | 'furnished'`
  - `TenantType = 'family' | 'bachelor' | 'any'`
  - `Listing`, `Owner`, `TenantProfile` interfaces (fields below)
  - `loadListings(): Promise<Listing[]>`, `loadOwners(): Promise<Owner[]>`, `loadTenant(): Promise<TenantProfile>`, `getOwner(owners, id): Owner | undefined`

- [ ] **Step 1: Write the types**

Create `app/src/lib/types.ts`:
```ts
export type Furnishing = 'unfurnished' | 'semi' | 'furnished';
export type TenantType = 'family' | 'bachelor' | 'any';

export interface Listing {
  id: string;
  title: string;          // "2BHK in Koramangala"
  bhk: number;
  locality: string;       // one of the 5 localities
  address: string;
  rent: number;           // monthly ₹, 18000–85000
  deposit: number;
  areaSqft: number;
  furnishing: Furnishing;
  tenantType: TenantType;
  moveInDate: string;     // ISO date, when the flat is available
  photos: string[];       // e.g. ["/photos/1.jpg"]
  trustScore: number;     // 35–98
  ownerId: string;
  verifiedOwner: boolean;
  postedDaysAgo: number;
  lat: number;
  lng: number;
  amenities: string[];
}

export interface Owner {
  id: string;
  name: string;
  phone: string;           // real number; masked in UI
  verified: boolean;
  verifiedItems: string[]; // e.g. ["Aadhaar", "PAN", "Ownership proof"]
  verifiedOn: string;      // ISO date
  responseRate: number;    // 0–100
}

export interface TenantProfile {
  id: string;
  name: string;
  budgetMin: number;
  budgetMax: number;
  preferredLocalities: string[];
  tenantType: TenantType;
  furnishing: Furnishing;
  moveInDate: string;      // ISO date the tenant wants to move in
}
```

- [ ] **Step 2: Write the failing data-loader test**

Create `app/src/lib/data.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { loadListings, loadOwners, loadTenant, getOwner } from './data';

const LOCALITIES = ['Koramangala', 'HSR Layout', 'Indiranagar', 'Whitefield', 'JP Nagar'];

describe('seed data', () => {
  it('has 25–30 listings within constraints', async () => {
    const listings = await loadListings();
    expect(listings.length).toBeGreaterThanOrEqual(25);
    expect(listings.length).toBeLessThanOrEqual(30);
    for (const l of listings) {
      expect(l.rent).toBeGreaterThanOrEqual(18000);
      expect(l.rent).toBeLessThanOrEqual(85000);
      expect(l.trustScore).toBeGreaterThanOrEqual(35);
      expect(l.trustScore).toBeLessThanOrEqual(98);
      expect(LOCALITIES).toContain(l.locality);
      expect(l.photos.length).toBeGreaterThan(0);
    }
  });

  it('spans all five localities', async () => {
    const listings = await loadListings();
    const set = new Set(listings.map(l => l.locality));
    for (const loc of LOCALITIES) expect(set.has(loc)).toBe(true);
  });

  it('every listing resolves to an owner', async () => {
    const [listings, owners] = [await loadListings(), await loadOwners()];
    for (const l of listings) expect(getOwner(owners, l.ownerId)).toBeDefined();
  });

  it('has trust scores in all three bands', async () => {
    const listings = await loadListings();
    expect(listings.some(l => l.trustScore >= 75)).toBe(true);
    expect(listings.some(l => l.trustScore >= 50 && l.trustScore < 75)).toBe(true);
    expect(listings.some(l => l.trustScore < 50)).toBe(true);
  });

  it('loads a demo tenant profile', async () => {
    const t = await loadTenant();
    expect(t.budgetMax).toBeGreaterThan(t.budgetMin);
    expect(t.preferredLocalities.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test -- data.test`
Expected: FAIL — `data.ts` and JSON files do not exist.

- [ ] **Step 4: Write the data loader**

Create `app/src/lib/data.ts`:
```ts
import type { Listing, Owner, TenantProfile } from './types';

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json() as Promise<T>;
}

export const loadListings = () => getJson<Listing[]>('/data/listings.json');
export const loadOwners = () => getJson<Owner[]>('/data/owners.json');
export const loadTenant = () => getJson<TenantProfile>('/data/tenant.json');

export function getOwner(owners: Owner[], id: string): Owner | undefined {
  return owners.find(o => o.id === id);
}
```

Note: Vitest runs in jsdom without a server, so `fetch('/data/...')` won't resolve. Add a test-only fetch shim at the top of `app/src/test/setup.ts`:
```ts
import '@testing-library/jest-dom';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Serve /data and /photos from public/ during tests
globalThis.fetch = (async (input: any) => {
  const url = String(input);
  if (url.startsWith('/')) {
    const file = resolve(process.cwd(), 'public', url.replace(/^\//, ''));
    const body = readFileSync(file, 'utf-8');
    return { ok: true, json: async () => JSON.parse(body) } as Response;
  }
  throw new Error(`Unmocked fetch: ${url}`);
}) as typeof fetch;
```

- [ ] **Step 5: Author the seed JSON**

Create `app/public/data/owners.json` with 10 owners. Example (author 10 total, ids `o1`–`o10`, mix of `verified: true`/`false`):
```json
[
  { "id": "o1", "name": "Rohan Mehta", "phone": "+919845012345", "verified": true, "verifiedItems": ["Aadhaar", "PAN", "Ownership proof"], "verifiedOn": "2026-06-20", "responseRate": 96 },
  { "id": "o2", "name": "Priya Nair", "phone": "+919845067890", "verified": true, "verifiedItems": ["Aadhaar", "PAN"], "verifiedOn": "2026-06-28", "responseRate": 88 }
]
```

Create `app/public/data/tenant.json` (the hardcoded demo tenant):
```json
{ "id": "t1", "name": "Ananya", "budgetMin": 20000, "budgetMax": 35000, "preferredLocalities": ["Koramangala", "HSR Layout"], "tenantType": "family", "furnishing": "semi", "moveInDate": "2026-08-01" }
```

Create `app/public/data/listings.json` with **25–30 listings** (ids `l1`…). Author them to satisfy the test invariants: rents ₹18k–85k, trust scores spread across all three bands (include several ≥75, several 50–74, at least two <50), all five localities present, real-ish Bengaluru coordinates, `photos` referencing files in `/photos/`. Two complete examples to follow for shape:
```json
[
  {
    "id": "l1", "title": "2BHK in Koramangala", "bhk": 2, "locality": "Koramangala",
    "address": "5th Block, Koramangala", "rent": 35000, "deposit": 200000, "areaSqft": 1100,
    "furnishing": "semi", "tenantType": "family", "moveInDate": "2026-07-25",
    "photos": ["/photos/1.jpg", "/photos/2.jpg"], "trustScore": 95, "ownerId": "o1",
    "verifiedOwner": true, "postedDaysAgo": 2, "lat": 12.9352, "lng": 77.6245,
    "amenities": ["Lift", "Parking", "Power backup", "Security"]
  },
  {
    "id": "l2", "title": "1BHK in HSR Layout", "bhk": 1, "locality": "HSR Layout",
    "address": "Sector 2, HSR Layout", "rent": 22000, "deposit": 100000, "areaSqft": 650,
    "furnishing": "furnished", "tenantType": "bachelor", "moveInDate": "2026-08-05",
    "photos": ["/photos/3.jpg"], "trustScore": 62, "ownerId": "o2",
    "verifiedOwner": true, "postedDaysAgo": 9, "lat": 12.9116, "lng": 77.6412,
    "amenities": ["Parking", "Wi-Fi"]
  }
]
```
Add a handful of royalty-free interior JPGs (Unsplash/Pexels) to `app/public/photos/` named `1.jpg`, `2.jpg`, … and reference them (reuse across listings is fine for the demo).

- [ ] **Step 6: Run the test to verify it passes**

Run: `npm test -- data.test`
Expected: PASS (all 5 assertions).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add domain types, seed JSON data, and data loader"
```

---

### Task 3: Match Score + Trust Score pure logic (TDD)

**Files:**
- Create: `app/src/lib/matchScore.ts`, `app/src/lib/matchScore.test.ts`, `app/src/lib/trustScore.ts`, `app/src/lib/trustScore.test.ts`

**Interfaces:**
- Consumes: `Listing`, `TenantProfile` from `types.ts`.
- Produces:
  - `matchScore(listing: Listing, tenant: TenantProfile): number` → 0–100 integer
  - `trustBand(score: number): 'strong' | 'medium' | 'weak'`
  - `trustColor(score: number): string` (hex)

- [ ] **Step 1: Write failing Match Score tests**

Create `app/src/lib/matchScore.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { matchScore } from './matchScore';
import type { Listing, TenantProfile } from './types';

const tenant: TenantProfile = {
  id: 't1', name: 'Ananya', budgetMin: 20000, budgetMax: 35000,
  preferredLocalities: ['Koramangala'], tenantType: 'family',
  furnishing: 'semi', moveInDate: '2026-08-01',
};

const base: Listing = {
  id: 'l', title: '', bhk: 2, locality: 'Koramangala', address: '',
  rent: 30000, deposit: 0, areaSqft: 1000, furnishing: 'semi',
  tenantType: 'family', moveInDate: '2026-07-20', photos: ['/photos/1.jpg'],
  trustScore: 90, ownerId: 'o1', verifiedOwner: true, postedDaysAgo: 1,
  lat: 0, lng: 0, amenities: [],
};

describe('matchScore', () => {
  it('is 100 for a perfect match', () => {
    expect(matchScore(base, tenant)).toBe(100);
  });
  it('drops locality points when locality differs', () => {
    expect(matchScore({ ...base, locality: 'Whitefield' }, tenant)).toBe(75);
  });
  it('gives full budget points when rent is at or under budgetMax', () => {
    expect(matchScore({ ...base, rent: 35000 }, tenant)).toBe(100);
  });
  it('reduces budget points when rent exceeds budgetMax and hits 0 at +50%', () => {
    expect(matchScore({ ...base, rent: 52500 }, tenant)).toBe(60); // 100 - 40
  });
  it("gives tenant-type points when listing is 'any'", () => {
    expect(matchScore({ ...base, tenantType: 'any' }, tenant)).toBe(100);
  });
  it('drops move-in points when flat is available after tenant move-in', () => {
    expect(matchScore({ ...base, moveInDate: '2026-09-01' }, tenant)).toBe(90);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- matchScore`
Expected: FAIL — `matchScore` not defined.

- [ ] **Step 3: Implement Match Score**

Create `app/src/lib/matchScore.ts`:
```ts
import type { Listing, TenantProfile } from './types';

export function matchScore(listing: Listing, tenant: TenantProfile): number {
  let score = 0;

  // Budget — 40%. Full if at/under budgetMax; linear to 0 at +50% over.
  if (listing.rent <= tenant.budgetMax) {
    score += 40;
  } else {
    const over = (listing.rent - tenant.budgetMax) / tenant.budgetMax;
    score += Math.max(0, 40 * (1 - over / 0.5));
  }

  // Locality — 25%.
  if (tenant.preferredLocalities.includes(listing.locality)) score += 25;

  // Family/bachelor — 15%.
  if (listing.tenantType === 'any' || listing.tenantType === tenant.tenantType) score += 15;

  // Furnishing — 10%.
  if (listing.furnishing === tenant.furnishing) score += 10;

  // Move-in — 10%. Full if flat is available on/before tenant's desired date.
  if (new Date(listing.moveInDate) <= new Date(tenant.moveInDate)) score += 10;

  return Math.round(score);
}
```

- [ ] **Step 4: Run to verify Match Score passes**

Run: `npm test -- matchScore`
Expected: PASS.

- [ ] **Step 5: Write failing Trust Score tests**

Create `app/src/lib/trustScore.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { trustBand, trustColor, trustTextColor } from './trustScore';

describe('trustBand', () => {
  it('classifies strong at 75 and above', () => {
    expect(trustBand(75)).toBe('strong');
    expect(trustBand(98)).toBe('strong');
  });
  it('classifies medium between 50 and 74', () => {
    expect(trustBand(50)).toBe('medium');
    expect(trustBand(74)).toBe('medium');
  });
  it('classifies weak below 50', () => {
    expect(trustBand(35)).toBe('weak');
    expect(trustBand(49)).toBe('weak');
  });
});

describe('trustColor', () => {
  it('maps bands to the palette', () => {
    expect(trustColor(90)).toBe('#C3EA4F');
    expect(trustColor(60)).toBe('#E8A13D');
    expect(trustColor(40)).toBe('#E5533D');
  });
});

describe('trustTextColor', () => {
  it('uses white on the weak (red) band, graphite otherwise', () => {
    expect(trustTextColor(90)).toBe('#1B1E23');
    expect(trustTextColor(60)).toBe('#1B1E23');
    expect(trustTextColor(40)).toBe('#FFFFFF');
  });
});
```

- [ ] **Step 6: Run to verify it fails**

Run: `npm test -- trustScore`
Expected: FAIL — `trustBand` not defined.

- [ ] **Step 7: Implement Trust Score**

Create `app/src/lib/trustScore.ts`:
```ts
export type TrustBand = 'strong' | 'medium' | 'weak';

export function trustBand(score: number): TrustBand {
  if (score >= 75) return 'strong';
  if (score >= 50) return 'medium';
  return 'weak';
}

const TRUST_COLORS: Record<TrustBand, string> = {
  strong: '#C3EA4F',
  medium: '#E8A13D',
  weak: '#E5533D',
};

export function trustColor(score: number): string {
  return TRUST_COLORS[trustBand(score)];
}

// White text on the weak (red) band for contrast; graphite otherwise (DESIGN.md).
export function trustTextColor(score: number): string {
  return trustBand(score) === 'weak' ? '#FFFFFF' : '#1B1E23';
}
```

- [ ] **Step 8: Run to verify Trust Score passes**

Run: `npm test -- trustScore`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add matchScore and trustScore pure logic with tests"
```

---

### Task 4: Design-system primitives

**Files:**
- Create: `app/src/components/Button.tsx`, `app/src/components/VerifiedBadge.tsx`, `app/src/components/TrustScoreToken.tsx`, `app/src/components/MatchChip.tsx`, `app/src/components/primitives.test.tsx`

**Interfaces:**
- Consumes: `trustColor` from `trustScore.ts`.
- Produces:
  - `Button({ variant?: 'primary' | 'secondary', children, onClick, className })`
  - `VerifiedBadge({ kind: 'owner' | 'tenant', pending?: boolean })`
  - `TrustScoreToken({ score: number })`
  - `MatchChip({ percent: number })`

- [ ] **Step 1: Write failing primitive tests**

Create `app/src/components/primitives.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VerifiedBadge } from './VerifiedBadge';
import { TrustScoreToken } from './TrustScoreToken';
import { MatchChip } from './MatchChip';
import { Button } from './Button';

describe('primitives', () => {
  it('VerifiedBadge shows "Verified" for owner', () => {
    render(<VerifiedBadge kind="owner" />);
    expect(screen.getByText(/verified/i)).toBeInTheDocument();
  });
  it('VerifiedBadge shows pending state', () => {
    render(<VerifiedBadge kind="owner" pending />);
    expect(screen.getByText(/pending/i)).toBeInTheDocument();
  });
  it('TrustScoreToken renders the score and colors it by band', () => {
    render(<TrustScoreToken score={95} />);
    const el = screen.getByText('95');
    expect(el).toBeInTheDocument();
  });
  it('MatchChip renders the percent', () => {
    render(<MatchChip percent={92} />);
    expect(screen.getByText(/92% match/i)).toBeInTheDocument();
  });
  it('Button renders its label', () => {
    render(<Button>Connect</Button>);
    expect(screen.getByRole('button', { name: /connect/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- primitives`
Expected: FAIL — components do not exist.

- [ ] **Step 3: Implement Button**

Create `app/src/components/Button.tsx`:
```tsx
import type { ReactNode } from 'react';

export function Button({
  variant = 'primary', children, onClick, className = '',
}: {
  variant?: 'primary' | 'secondary';
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const styles =
    variant === 'primary'
      ? 'bg-blueharbor text-white hover:brightness-95'
      : 'bg-white text-blueharbor border border-blueharbor hover:bg-moontint';
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${styles} ${className}`}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 4: Implement VerifiedBadge (spiked seal + tick)**

Create `app/src/components/VerifiedBadge.tsx`:
```tsx
import { SealCheck } from '@phosphor-icons/react';

export function VerifiedBadge({
  kind, pending = false,
}: { kind: 'owner' | 'tenant'; pending?: boolean }) {
  const label = kind === 'owner' ? 'Verified Owner' : 'Verified Tenant';
  if (pending) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber px-2.5 py-1 text-xs font-semibold text-amber">
        <SealCheck size={16} weight="fill" /> Verification pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-limeglow px-2.5 py-1 text-xs font-semibold text-graphite">
      <SealCheck size={16} weight="fill" color="#1B1E23" /> {label}
    </span>
  );
}
```
Note: Phosphor's `SealCheck` is the scalloped/spiked seal with a tick — matches the specced badge.

- [ ] **Step 5: Implement TrustScoreToken (number pill; ring deferred)**

Create `app/src/components/TrustScoreToken.tsx`:
```tsx
import { trustColor, trustTextColor } from '../lib/trustScore';
import { ShieldCheck } from '@phosphor-icons/react';

// Display style (ring vs number) is deferred; number pill for now.
export function TrustScoreToken({ score }: { score: number }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold"
      style={{ backgroundColor: trustColor(score), color: trustTextColor(score) }}
      title="Trust Score"
    >
      <ShieldCheck size={14} weight="fill" /> {score}
    </span>
  );
}
```

- [ ] **Step 6: Implement MatchChip**

Create `app/src/components/MatchChip.tsx`:
```tsx
export function MatchChip({ percent }: { percent: number }) {
  return (
    <span className="inline-flex items-center rounded-full bg-iceblue px-2.5 py-1 text-xs font-semibold text-graphite">
      {percent}% match
    </span>
  );
}
```

- [ ] **Step 7: Run to verify primitives pass**

Run: `npm test -- primitives`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add design-system primitives (Button, VerifiedBadge, TrustScoreToken, MatchChip)"
```

---

### Task 5: Listing card

**Files:**
- Create: `app/src/components/ListingCard.tsx`, `app/src/components/ListingCard.test.tsx`

**Interfaces:**
- Consumes: `Listing`, `TenantProfile` from `types.ts`; `matchScore`; `VerifiedBadge`, `TrustScoreToken`, `MatchChip`, `Button`.
- Produces: `ListingCard({ listing: Listing, tenant: TenantProfile, onOpen?: (id: string) => void })`

- [ ] **Step 1: Write failing ListingCard test**

Create `app/src/components/ListingCard.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ListingCard } from './ListingCard';
import type { Listing, TenantProfile } from '../lib/types';

const tenant: TenantProfile = {
  id: 't1', name: 'Ananya', budgetMin: 20000, budgetMax: 35000,
  preferredLocalities: ['Koramangala'], tenantType: 'family',
  furnishing: 'semi', moveInDate: '2026-08-01',
};
const listing: Listing = {
  id: 'l1', title: '2BHK in Koramangala', bhk: 2, locality: 'Koramangala',
  address: '5th Block, Koramangala', rent: 35000, deposit: 200000, areaSqft: 1100,
  furnishing: 'semi', tenantType: 'family', moveInDate: '2026-07-25',
  photos: ['/photos/1.jpg'], trustScore: 95, ownerId: 'o1', verifiedOwner: true,
  postedDaysAgo: 2, lat: 12.9, lng: 77.6, amenities: ['Lift'],
};

describe('ListingCard', () => {
  it('renders rent, locality, trust score, match %, and verified badge', () => {
    render(<ListingCard listing={listing} tenant={tenant} />);
    expect(screen.getByText(/35,000/)).toBeInTheDocument();
    expect(screen.getByText('2BHK · Koramangala')).toBeInTheDocument();
    expect(screen.getByText('95')).toBeInTheDocument();
    expect(screen.getByText(/100% match/)).toBeInTheDocument();
    expect(screen.getByText(/Verified Owner/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- ListingCard`
Expected: FAIL — `ListingCard` not defined.

- [ ] **Step 3: Implement ListingCard**

Create `app/src/components/ListingCard.tsx`:
```tsx
import { MapPin, Bed, Ruler, Armchair } from '@phosphor-icons/react';
import type { Listing, TenantProfile } from '../lib/types';
import { matchScore } from '../lib/matchScore';
import { TrustScoreToken } from './TrustScoreToken';
import { MatchChip } from './MatchChip';
import { VerifiedBadge } from './VerifiedBadge';
import { Button } from './Button';

const FURNISH_LABEL: Record<Listing['furnishing'], string> = {
  unfurnished: 'Unfurnished', semi: 'Semi-furnished', furnished: 'Furnished',
};

export function ListingCard({
  listing, tenant, onOpen,
}: { listing: Listing; tenant: TenantProfile; onOpen?: (id: string) => void }) {
  const pct = matchScore(listing, tenant);
  return (
    <div
      onClick={() => onOpen?.(listing.id)}
      className="cursor-pointer overflow-hidden rounded-card bg-white shadow-card border border-line"
    >
      <div className="relative">
        <img src={listing.photos[0]} alt={listing.title} className="h-44 w-full object-cover" />
        <div className="absolute left-3 top-3"><TrustScoreToken score={listing.trustScore} /></div>
        <div className="absolute right-3 top-3"><MatchChip percent={pct} /></div>
      </div>
      <div className="p-4">
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold">₹{listing.rent.toLocaleString('en-IN')}</span>
          <span className="text-sm text-coolgrey">/mo</span>
        </div>
        <div className="mt-0.5 font-semibold">{listing.bhk}BHK · {listing.locality}</div>
        <div className="mt-0.5 flex items-center gap-1 text-sm text-coolgrey">
          <MapPin size={14} /> {listing.address}
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-coolgrey">
          <span className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-1"><Ruler size={14} /> {listing.areaSqft} sq.ft</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-1"><Bed size={14} /> {listing.bhk} BHK</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-1"><Armchair size={14} /> {FURNISH_LABEL[listing.furnishing]}</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          {listing.verifiedOwner ? <VerifiedBadge kind="owner" /> : <span className="text-xs text-coolgrey">Unverified</span>}
          <span className="text-xs text-coolgrey">{listing.postedDaysAgo} days ago</span>
        </div>
        <Button className="mt-4 w-full" onClick={() => onOpen?.(listing.id)}>View Details</Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test -- ListingCard`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add ListingCard composing trust marks and match score"
```

---

### Task 6: App shell, routing, Home page

**Files:**
- Create: `app/src/pages/Home.tsx`, `app/src/hooks/useData.ts`
- Modify: `app/src/App.tsx`, `app/src/main.tsx`

**Interfaces:**
- Consumes: `loadListings`, `loadOwners`, `loadTenant`; `ListingCard`.
- Produces:
  - `useData()` hook → `{ listings, owners, tenant, loading }`
  - Routes: `/` (Home), `/results` (Results), `/listing/:id` (ListingDetail)
  - `SearchState` in URL query: `locality`, `bhk`, `maxRent`, `tenantType`

- [ ] **Step 1: Data hook**

Create `app/src/hooks/useData.ts`:
```tsx
import { useEffect, useState } from 'react';
import { loadListings, loadOwners, loadTenant } from '../lib/data';
import type { Listing, Owner, TenantProfile } from '../lib/types';

export function useData() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [tenant, setTenant] = useState<TenantProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadListings(), loadOwners(), loadTenant()])
      .then(([l, o, t]) => { setListings(l); setOwners(o); setTenant(t); })
      .finally(() => setLoading(false));
  }, []);

  return { listings, owners, tenant, loading };
}
```

- [ ] **Step 2: Router shell**

Replace `app/src/main.tsx`:
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

Replace `app/src/App.tsx`:
```tsx
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Results from './pages/Results';
import ListingDetail from './pages/ListingDetail';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/results" element={<Results />} />
      <Route path="/listing/:id" element={<ListingDetail />} />
    </Routes>
  );
}
```
Note: `Results` and `ListingDetail` are created in Tasks 7–8. To keep this task compiling, create temporary one-line stubs now: `app/src/pages/Results.tsx` and `app/src/pages/ListingDetail.tsx` each `export default function X(){return null;}` — Tasks 7 and 8 replace them.

- [ ] **Step 3: Home page**

Create `app/src/pages/Home.tsx`:
```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlass, ShieldCheck, Prohibit, PhoneSlash } from '@phosphor-icons/react';
import { useData } from '../hooks/useData';
import { ListingCard } from '../components/ListingCard';

const LOCALITIES = ['Koramangala', 'HSR Layout', 'Indiranagar', 'Whitefield', 'JP Nagar'];

export default function Home() {
  const { listings, tenant } = useData();
  const nav = useNavigate();
  const [locality, setLocality] = useState('Koramangala');
  const [bhk, setBhk] = useState('2');
  const [maxRent, setMaxRent] = useState('35000');

  const go = () => nav(`/results?locality=${encodeURIComponent(locality)}&bhk=${bhk}&maxRent=${maxRent}`);

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <div className="flex items-center justify-between">
        <div className="text-xl font-extrabold tracking-wide">PROP<span className="text-blueharbor">WEB</span></div>
        <div className="text-sm text-coolgrey">Bengaluru</div>
      </div>

      <div className="mt-10 rounded-card bg-white p-6 shadow-card border border-line">
        <h1 className="text-2xl font-extrabold">Rentals you can trust — no brokers, no fakes.</h1>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <select value={locality} onChange={e => setLocality(e.target.value)} className="rounded-lg border border-line px-3 py-2">
            {LOCALITIES.map(l => <option key={l}>{l}</option>)}
          </select>
          <select value={bhk} onChange={e => setBhk(e.target.value)} className="rounded-lg border border-line px-3 py-2">
            {['1', '2', '3'].map(b => <option key={b} value={b}>{b} BHK</option>)}
          </select>
          <input value={maxRent} onChange={e => setMaxRent(e.target.value)} className="rounded-lg border border-line px-3 py-2" placeholder="Max rent" />
          <button onClick={go} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blueharbor px-4 py-2 font-semibold text-white">
            <MagnifyingGlass size={18} /> Search
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 rounded-card bg-moontint p-4 text-sm font-semibold text-graphite border border-line">
        <span className="inline-flex items-center gap-1"><ShieldCheck size={18} /> Verified owners & tenants</span>
        <span className="inline-flex items-center gap-1"><Prohibit size={18} /> No fake listings</span>
        <span className="inline-flex items-center gap-1"><PhoneSlash size={18} /> No spam calls</span>
      </div>

      <h2 className="mt-10 text-lg font-bold">Featured verified rentals</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tenant && listings.slice(0, 3).map(l => (
          <ListingCard key={l.id} listing={l} tenant={tenant} onOpen={id => nav(`/listing/${id}`)} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify Home renders in the browser**

Run: `npm run dev` and open the local URL.
Expected: Home shows logo, search box, trust strip, and 3 featured cards with trust score + match %.

- [ ] **Step 5: Build check**

Run: `npm run build`
Expected: compiles with no type errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add routing, data hook, and Home search page"
```

---

### Task 7: Results page (list + Leaflet map)

**Files:**
- Create: `app/src/pages/Results.tsx`, `app/src/components/MapView.tsx`, `app/src/lib/filter.ts`, `app/src/lib/filter.test.ts`

**Interfaces:**
- Consumes: `useData`; `ListingCard`; `matchScore`; `Listing`.
- Produces:
  - `filterListings(listings, { locality?, bhk?, maxRent? }): Listing[]`
  - `MapView({ listings, activeId, onPin }: { listings: Listing[]; activeId?: string; onPin?: (id: string) => void })`

- [ ] **Step 1: Write failing filter test**

Create `app/src/lib/filter.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { filterListings } from './filter';
import type { Listing } from './types';

const mk = (over: Partial<Listing>): Listing => ({
  id: 'l', title: '', bhk: 2, locality: 'Koramangala', address: '', rent: 30000,
  deposit: 0, areaSqft: 900, furnishing: 'semi', tenantType: 'family',
  moveInDate: '2026-07-01', photos: ['/photos/1.jpg'], trustScore: 80, ownerId: 'o1',
  verifiedOwner: true, postedDaysAgo: 1, lat: 0, lng: 0, amenities: [], ...over,
});

describe('filterListings', () => {
  const data = [mk({ id: 'a', locality: 'Koramangala', bhk: 2, rent: 30000 }),
                mk({ id: 'b', locality: 'Whitefield', bhk: 2, rent: 30000 }),
                mk({ id: 'c', locality: 'Koramangala', bhk: 3, rent: 60000 })];
  it('filters by locality', () => {
    expect(filterListings(data, { locality: 'Koramangala' }).map(l => l.id)).toEqual(['a', 'c']);
  });
  it('filters by bhk', () => {
    expect(filterListings(data, { bhk: 3 }).map(l => l.id)).toEqual(['c']);
  });
  it('filters by maxRent', () => {
    expect(filterListings(data, { maxRent: 35000 }).map(l => l.id)).toEqual(['a', 'b']);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- filter`
Expected: FAIL — `filterListings` not defined.

- [ ] **Step 3: Implement filter**

Create `app/src/lib/filter.ts`:
```ts
import type { Listing } from './types';

export function filterListings(
  listings: Listing[],
  f: { locality?: string; bhk?: number; maxRent?: number },
): Listing[] {
  return listings.filter(l =>
    (f.locality ? l.locality === f.locality : true) &&
    (f.bhk ? l.bhk === f.bhk : true) &&
    (f.maxRent ? l.rent <= f.maxRent : true),
  );
}
```

- [ ] **Step 4: Run to verify filter passes**

Run: `npm test -- filter`
Expected: PASS.

- [ ] **Step 5: Implement MapView (Leaflet price pins)**

Create `app/src/components/MapView.tsx`:
```tsx
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import type { Listing } from '../lib/types';

function priceIcon(rent: number, active: boolean) {
  return L.divIcon({
    className: '',
    html: `<div style="background:${active ? '#3770BF' : '#1B1E23'};color:#fff;padding:2px 8px;border-radius:999px;font:600 12px sans-serif;white-space:nowrap">₹${Math.round(rent / 1000)}k</div>`,
  });
}

export function MapView({
  listings, activeId, onPin,
}: { listings: Listing[]; activeId?: string; onPin?: (id: string) => void }) {
  const center: [number, number] = listings.length
    ? [listings[0].lat, listings[0].lng]
    : [12.9352, 77.6245];
  return (
    <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {listings.map(l => (
        <Marker
          key={l.id}
          position={[l.lat, l.lng]}
          icon={priceIcon(l.rent, l.id === activeId)}
          eventHandlers={{ click: () => onPin?.(l.id) }}
        />
      ))}
    </MapContainer>
  );
}
```

- [ ] **Step 6: Implement Results page (split view + mobile toggle)**

Replace `app/src/pages/Results.tsx`:
```tsx
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ListStack, MapTrigger } from '@phosphor-icons/react';
import { useData } from '../hooks/useData';
import { filterListings } from '../lib/filter';
import { ListingCard } from '../components/ListingCard';
import { MapView } from '../components/MapView';

export default function Results() {
  const { listings, tenant } = useData();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [showMapMobile, setShowMapMobile] = useState(false);

  const locality = params.get('locality') || undefined;
  const bhk = params.get('bhk') ? Number(params.get('bhk')) : undefined;
  const maxRent = params.get('maxRent') ? Number(params.get('maxRent')) : undefined;

  const results = useMemo(
    () => filterListings(listings, { locality, bhk, maxRent }),
    [listings, locality, bhk, maxRent],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">{results.length} rentals{locality ? ` in ${locality}` : ''}</h1>
        <button onClick={() => setShowMapMobile(v => !v)} className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-sm font-semibold lg:hidden">
          {showMapMobile ? <><ListStack size={16} /> List</> : <><MapTrigger size={16} /> Map</>}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className={`${showMapMobile ? 'hidden' : 'block'} lg:block`}>
          <div className="grid gap-4 sm:grid-cols-2">
            {tenant && results.map(l => (
              <ListingCard key={l.id} listing={l} tenant={tenant} onOpen={id => nav(`/listing/${id}`)} />
            ))}
          </div>
        </div>
        <div className={`${showMapMobile ? 'block' : 'hidden'} lg:block`}>
          <div className="sticky top-6 h-[70vh] overflow-hidden rounded-card border border-line">
            <MapView listings={results} onPin={id => nav(`/listing/${id}`)} />
          </div>
        </div>
      </div>
    </div>
  );
}
```
Note: If `ListStack`/`MapTrigger` names are unavailable in the installed Phosphor version, substitute `Rows` and `MapPin` — verify against `node_modules/@phosphor-icons/react` exports.

- [ ] **Step 7: Verify Results in browser**

Run: `npm run dev`, navigate Home → Search.
Expected: desktop shows cards left + map with price pins right; mobile shows the Map/List toggle.

- [ ] **Step 8: Build check + commit**

Run: `npm run build` (expect no errors), then:
```bash
git add -A
git commit -m "feat: add Results page with filtering and Leaflet map"
```

---

### Task 8: Listing detail page + end-to-end tenant journey

**Files:**
- Create: `app/src/pages/ListingDetail.tsx`
- Modify: none (replaces the Task 6 stub)

**Interfaces:**
- Consumes: `useData`; `getOwner`; `matchScore`; `trustColor`; `VerifiedBadge`, `TrustScoreToken`, `MatchChip`, `Button`; route param `:id`.
- Produces: the Listing detail screen with masked owner card + Connect CTA (opens a mock modal — real pay-to-connect is a later plan).

- [ ] **Step 1: Implement ListingDetail**

Replace `app/src/pages/ListingDetail.tsx`:
```tsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft } from '@phosphor-icons/react';
import { useData } from '../hooks/useData';
import { getOwner } from '../lib/data';
import { matchScore } from '../lib/matchScore';
import { TrustScoreToken } from '../components/TrustScoreToken';
import { MatchChip } from '../components/MatchChip';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { Button } from '../components/Button';

export default function ListingDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { listings, owners, tenant, loading } = useData();
  const [showConnect, setShowConnect] = useState(false);

  if (loading) return <div className="p-8 text-coolgrey">Loading…</div>;
  const listing = listings.find(l => l.id === id);
  if (!listing || !tenant) return <div className="p-8">Listing not found.</div>;
  const owner = getOwner(owners, listing.ownerId);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <button onClick={() => nav(-1)} className="mb-4 inline-flex items-center gap-1 text-sm text-blueharbor"><ArrowLeft size={16} /> Back</button>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div>
          <img src={listing.photos[0]} alt={listing.title} className="h-72 w-full rounded-card object-cover" />
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold">₹{listing.rent.toLocaleString('en-IN')}</span>
            <span className="text-coolgrey">/mo</span>
          </div>
          <div className="font-semibold">{listing.bhk}BHK · {listing.locality}</div>
          <div className="flex items-center gap-1 text-sm text-coolgrey"><MapPin size={14} /> {listing.address}</div>

          <div className="mt-3 flex flex-wrap gap-2">
            <TrustScoreToken score={listing.trustScore} />
            <MatchChip percent={matchScore(listing, tenant)} />
          </div>

          <h3 className="mt-6 font-bold">Amenities</h3>
          <div className="mt-2 flex flex-wrap gap-2 text-sm text-coolgrey">
            {listing.amenities.map(a => <span key={a} className="rounded-full border border-line px-3 py-1">{a}</span>)}
          </div>

          <h3 className="mt-6 font-bold">Why this Trust Score?</h3>
          <p className="mt-1 text-sm text-coolgrey">Verification level, owner response rate, listing freshness and reviews combine into the {listing.trustScore}/100 score. Tap the badge on any listing to see what was verified.</p>
        </div>

        <div className="lg:sticky lg:top-6 h-fit rounded-card border border-line bg-white p-5 shadow-card">
          <div className="font-semibold">{owner?.name}</div>
          <div className="mt-1">{listing.verifiedOwner ? <VerifiedBadge kind="owner" /> : <VerifiedBadge kind="owner" pending />}</div>
          <div className="mt-3 text-sm text-coolgrey">Phone</div>
          <div className="font-mono text-lg tracking-widest">+91 ●●●●● ●●●●●</div>
          <Button className="mt-4 w-full" onClick={() => setShowConnect(true)}>Connect</Button>
          <p className="mt-2 text-center text-xs text-coolgrey">Small fee unlocks the verified owner's contact.</p>
        </div>
      </div>

      {showConnect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-graphite/40 p-4" onClick={() => setShowConnect(false)}>
          <div className="w-full max-w-sm rounded-card bg-white p-6 text-center shadow-card" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold">Pay to connect</h3>
            <p className="mt-1 text-sm text-coolgrey">Unlock this verified owner's contact for a small fee. (Mock — no real payment.)</p>
            <Button className="mt-4 w-full" onClick={() => setShowConnect(false)}>Pay ₹49 (mock)</Button>
          </div>
        </div>
      )}
    </div>
  );
}
```
Note: This Connect modal is a minimal mock so the tenant journey is clickable end-to-end. The full pay-to-connect flow (masked-number reveal state, owner journey) is a later plan.

- [ ] **Step 2: Verify the full tenant journey in the browser**

Run: `npm run dev`. Click through: Home → search Koramangala 2BHK ₹35k → Results → open a high-trust listing → Detail shows masked phone + Connect → Connect opens the mock modal.
Expected: every step navigates and renders; trust marks and match % appear throughout.

- [ ] **Step 3: Run the full test suite**

Run: `npm test`
Expected: all suites PASS (data, matchScore, trustScore, primitives, ListingCard, filter).

- [ ] **Step 4: Build check + commit**

Run: `npm run build` (expect no errors), then:
```bash
git add -A
git commit -m "feat: add Listing detail with masked owner card and mock Connect — tenant journey clickable end-to-end"
```

---

## Notes for the next plan (out of scope here)
- Owner journey: 4-step listing wizard + owner KYC (pending → Verified flip) + owner dashboard.
- Full pay-to-connect: masked-number reveal state after mock payment.
- Remaining wireframes: tenant onboarding, tenant KYC, Trust-Score explainer screen, Match-Score view screen.
- Deploy to a free static link (Vercel/Netlify) once journeys are locked.
- Decide Trust Score display: ring vs. number.
