# PropWeb Demo — Owner Journey + Trust Explainers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the demo's second journey — a mock 4-step owner listing wizard that ends in a "Verification pending → Verified Owner" flip — and make the trust marks tappable with explainer popovers on the Listing detail page, so the full demo script is clickable end-to-end.

**Architecture:** The wizard is a single stateful page (`OwnerWizard`) owning a `ListingDraft` and a step machine (steps 1–4 + a `published` state); presentational step components receive the draft + an `onChange`. Pure `isStepComplete` validation gates the Next button. Trust explainers are small presentational components wired into the existing `ListingDetail` page (the primitives stay unchanged; the detail page wraps them in tappable buttons that open popovers). No backend — all local state.

**Tech Stack:** React 19, TypeScript, Tailwind, @phosphor-icons/react, react-router-dom, Vitest + @testing-library/react (fireEvent).

## Global Constraints

- App lives in `app/`. All paths relative to `app/` unless noted.
- No backend/DB/auth/real uploads. The photos step is a mock preset picker. Publishing sets local state only.
- **Design tokens (exact hex):** Moontint `#F3F6FF`, Blue harbor `#3770BF`, Ice blue `#8DC2FF`, Lime glow `#C3EA4F`, Graphite `#1B1E23`, Cool grey `#5B6470`, Line `#DDE3EE`, Amber `#E8A13D`, Muted red `#E5533D`. (Tailwind names: `moontint`, `blueharbor`, `iceblue`, `limeglow`, `graphite`, `coolgrey`, `line`, `amber`, `mutedred`.)
- **Color rules:** lime = trust only (verified badge, high Trust Score) — never a button; blue harbor = the single primary action per screen. Text graphite, never pure black.
- **Fonts:** Manrope (`font-display`) for the brand wordmark + page/step headings + price; Inter (default) for everything else, body line-height 24px.
- **Icons:** Phosphor only. If a named icon does not resolve in the installed package, substitute a valid equivalent and note it (do not leave an unresolved import).
- **Reuse existing pieces:** `Button`, `VerifiedBadge`, `TrustScoreToken`, `MatchChip` (in `app/src/components/`), types in `app/src/lib/types.ts` (`Furnishing`, `TenantType`, `Owner`), `useData`, `getOwner`.
- Preset interior photo URLs (reuse across the app): `https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80`, `...photo-1502672260266-1c1ef2d93688?w=800&q=80`, `...photo-1560448204-e02f11c3d0e2?w=800&q=80`, `...photo-1560185007-cde436f6a4d0?w=800&q=80`, `...photo-1484154218962-a197022b5858?w=800&q=80`, `...photo-1493809842364-78817add7ffb?w=800&q=80`.
- Localities: Koramangala, HSR Layout, Indiranagar, Whitefield, JP Nagar.
- Spec references: `DESIGN.md`, `docs/superpowers/specs/2026-07-13-design-system-design.md`.

---

### Task 1: ListingDraft type + step validation (pure, TDD)

**Files:**
- Create: `app/src/lib/ownerDraft.ts`, `app/src/lib/ownerDraft.test.ts`

**Interfaces:**
- Produces:
  - `interface ListingDraft { title: string; bhk: number; locality: string; rent: string; deposit: string; areaSqft: string; furnishing: Furnishing | ''; tenantType: TenantType | ''; photos: string[]; amenities: string[]; moveInDate: string }`
  - `emptyDraft(): ListingDraft`
  - `WizardStep = 1 | 2 | 3 | 4`
  - `isStepComplete(step: WizardStep, d: ListingDraft): boolean`

- [ ] **Step 1: Write the failing test**

Create `app/src/lib/ownerDraft.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { emptyDraft, isStepComplete } from './ownerDraft';

describe('ownerDraft', () => {
  it('emptyDraft starts incomplete on step 1', () => {
    expect(isStepComplete(1, emptyDraft())).toBe(false);
  });

  it('step 1 completes when core details are filled', () => {
    const d = { ...emptyDraft(), bhk: 2, locality: 'Koramangala', rent: '35000', areaSqft: '1100', furnishing: 'semi' as const, tenantType: 'family' as const };
    expect(isStepComplete(1, d)).toBe(true);
  });

  it('step 1 stays incomplete if furnishing or tenantType is unset', () => {
    const d = { ...emptyDraft(), bhk: 2, locality: 'Koramangala', rent: '35000', areaSqft: '1100' };
    expect(isStepComplete(1, d)).toBe(false);
  });

  it('step 2 requires at least one photo', () => {
    expect(isStepComplete(2, emptyDraft())).toBe(false);
    expect(isStepComplete(2, { ...emptyDraft(), photos: ['/p1.jpg'] })).toBe(true);
  });

  it('step 3 requires a move-in date', () => {
    expect(isStepComplete(3, emptyDraft())).toBe(false);
    expect(isStepComplete(3, { ...emptyDraft(), moveInDate: '2026-09-01' })).toBe(true);
  });

  it('step 4 (review) is always complete', () => {
    expect(isStepComplete(4, emptyDraft())).toBe(true);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd app && npm test -- ownerDraft`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `app/src/lib/ownerDraft.ts`:
```ts
import type { Furnishing, TenantType } from './types';

export interface ListingDraft {
  title: string;
  bhk: number;
  locality: string;
  rent: string;
  deposit: string;
  areaSqft: string;
  furnishing: Furnishing | '';
  tenantType: TenantType | '';
  photos: string[];
  amenities: string[];
  moveInDate: string;
}

export type WizardStep = 1 | 2 | 3 | 4;

export function emptyDraft(): ListingDraft {
  return {
    title: '', bhk: 0, locality: '', rent: '', deposit: '', areaSqft: '',
    furnishing: '', tenantType: '', photos: [], amenities: [], moveInDate: '',
  };
}

export function isStepComplete(step: WizardStep, d: ListingDraft): boolean {
  switch (step) {
    case 1:
      return d.bhk > 0 && d.locality !== '' && d.rent !== '' && d.areaSqft !== '' &&
        d.furnishing !== '' && d.tenantType !== '';
    case 2:
      return d.photos.length > 0;
    case 3:
      return d.moveInDate !== '';
    case 4:
      return true;
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `cd app && npm test -- ownerDraft`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add owner ListingDraft type and step validation"
```

---

### Task 2: Wizard shell — container, progress, Step 1 (Details) + Step 2 (Photos)

**Files:**
- Create: `app/src/components/owner/WizardProgress.tsx`, `app/src/components/owner/StepDetails.tsx`, `app/src/components/owner/StepPhotos.tsx`, `app/src/pages/OwnerWizard.tsx`, `app/src/pages/OwnerWizard.test.tsx`

**Interfaces:**
- Consumes: `ListingDraft`, `emptyDraft`, `isStepComplete`, `WizardStep` from `ownerDraft.ts`; `Button`.
- Produces:
  - `WizardProgress({ step }: { step: number })`
  - `StepDetails({ draft, set }: { draft: ListingDraft; set: (patch: Partial<ListingDraft>) => void })`
  - `StepPhotos({ draft, set }: same)`
  - `OwnerWizard` default export (page). Holds `step` state (1–4), `draft` state, `published` boolean, `verified` boolean (published/verified used in Task 3). This task renders steps 1–2, Back/Next nav with Next disabled unless `isStepComplete(step, draft)`.

- [ ] **Step 1: WizardProgress**

Create `app/src/components/owner/WizardProgress.tsx`:
```tsx
const LABELS = ['Details', 'Photos', 'Preferences', 'Review'];

export function WizardProgress({ step }: { step: number }) {
  return (
    <ol className="mb-6 flex items-center gap-2">
      {LABELS.map((label, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                active ? 'bg-blueharbor text-white' : done ? 'bg-limeglow text-graphite' : 'bg-white text-coolgrey border border-line'
              }`}
            >
              {n}
            </span>
            <span className={`text-xs font-semibold ${active ? 'text-graphite' : 'text-coolgrey'}`}>{label}</span>
            {n < LABELS.length && <span className="h-px flex-1 bg-line" />}
          </li>
        );
      })}
    </ol>
  );
}
```

- [ ] **Step 2: StepDetails**

Create `app/src/components/owner/StepDetails.tsx`:
```tsx
import type { ListingDraft } from '../../lib/ownerDraft';

const LOCALITIES = ['Koramangala', 'HSR Layout', 'Indiranagar', 'Whitefield', 'JP Nagar'];
const label = 'block text-sm font-semibold mb-1';
const field = 'w-full rounded-lg border border-line px-3 py-2';

export function StepDetails({ draft, set }: { draft: ListingDraft; set: (patch: Partial<ListingDraft>) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className={label}>Listing title</label>
        <input className={field} value={draft.title} onChange={e => set({ title: e.target.value })} placeholder="e.g. Sunny 2BHK near Forum Mall" />
      </div>
      <div>
        <label className={label}>BHK</label>
        <select className={field} value={draft.bhk || ''} onChange={e => set({ bhk: Number(e.target.value) })}>
          <option value="">Select</option>
          {[1, 2, 3].map(b => <option key={b} value={b}>{b} BHK</option>)}
        </select>
      </div>
      <div>
        <label className={label}>Locality</label>
        <select className={field} value={draft.locality} onChange={e => set({ locality: e.target.value })}>
          <option value="">Select</option>
          {LOCALITIES.map(l => <option key={l}>{l}</option>)}
        </select>
      </div>
      <div>
        <label className={label}>Monthly rent (₹)</label>
        <input className={field} inputMode="numeric" value={draft.rent} onChange={e => set({ rent: e.target.value })} placeholder="35000" />
      </div>
      <div>
        <label className={label}>Deposit (₹)</label>
        <input className={field} inputMode="numeric" value={draft.deposit} onChange={e => set({ deposit: e.target.value })} placeholder="200000" />
      </div>
      <div>
        <label className={label}>Area (sq.ft)</label>
        <input className={field} inputMode="numeric" value={draft.areaSqft} onChange={e => set({ areaSqft: e.target.value })} placeholder="1100" />
      </div>
      <div>
        <label className={label}>Furnishing</label>
        <select className={field} value={draft.furnishing} onChange={e => set({ furnishing: e.target.value as ListingDraft['furnishing'] })}>
          <option value="">Select</option>
          <option value="unfurnished">Unfurnished</option>
          <option value="semi">Semi-furnished</option>
          <option value="furnished">Furnished</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className={label}>Preferred tenant</label>
        <select className={field} value={draft.tenantType} onChange={e => set({ tenantType: e.target.value as ListingDraft['tenantType'] })}>
          <option value="">Select</option>
          <option value="family">Family</option>
          <option value="bachelor">Bachelor</option>
          <option value="any">Any</option>
        </select>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: StepPhotos (mock preset picker)**

Create `app/src/components/owner/StepPhotos.tsx`:
```tsx
import type { ListingDraft } from '../../lib/ownerDraft';

const PRESETS = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
  'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
];

export function StepPhotos({ draft, set }: { draft: ListingDraft; set: (patch: Partial<ListingDraft>) => void }) {
  const toggle = (url: string) => {
    const has = draft.photos.includes(url);
    set({ photos: has ? draft.photos.filter(p => p !== url) : [...draft.photos, url] });
  };
  return (
    <div>
      <p className="mb-3 text-sm text-coolgrey">Select photos for your listing (demo — tap to add).</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {PRESETS.map(url => {
          const selected = draft.photos.includes(url);
          return (
            <button key={url} type="button" onClick={() => toggle(url)}
              className={`relative overflow-hidden rounded-lg ${selected ? 'ring-2 ring-blueharbor' : 'border border-line'}`}>
              <img src={url} alt="" className="h-24 w-full object-cover" />
              {selected && <span className="absolute right-1 top-1 rounded-full bg-blueharbor px-1.5 py-0.5 text-[10px] font-bold text-white">✓</span>}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-coolgrey">{draft.photos.length} selected</p>
    </div>
  );
}
```

- [ ] **Step 4: OwnerWizard container (steps 1–2 wired; 3–4 land in Task 3)**

Create `app/src/pages/OwnerWizard.tsx`:
```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import { emptyDraft, isStepComplete, type ListingDraft, type WizardStep } from '../lib/ownerDraft';
import { WizardProgress } from '../components/owner/WizardProgress';
import { StepDetails } from '../components/owner/StepDetails';
import { StepPhotos } from '../components/owner/StepPhotos';
import { Button } from '../components/Button';

export default function OwnerWizard() {
  const nav = useNavigate();
  const [step, setStep] = useState<WizardStep>(1);
  const [draft, setDraft] = useState<ListingDraft>(emptyDraft());
  const set = (patch: Partial<ListingDraft>) => setDraft(d => ({ ...d, ...patch }));
  const canNext = isStepComplete(step, draft);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <button onClick={() => nav('/')} className="mb-4 inline-flex items-center gap-1 text-sm text-blueharbor">
        <ArrowLeft size={16} /> Home
      </button>
      <h1 className="font-display mb-4 text-2xl font-extrabold">List your property</h1>
      <WizardProgress step={step} />

      <div className="rounded-card border border-line bg-white p-5 shadow-card">
        {step === 1 && <StepDetails draft={draft} set={set} />}
        {step === 2 && <StepPhotos draft={draft} set={set} />}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <Button variant="secondary" onClick={() => (step === 1 ? nav('/') : setStep((step - 1) as WizardStep))}>
          Back
        </Button>
        <Button onClick={() => canNext && setStep((step + 1) as WizardStep)} className={canNext ? '' : 'opacity-40 pointer-events-none'}>
          Next <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}
```
Note: `ArrowRight` is used by ListingCard already, so it resolves. This task caps navigation at step 2 conceptually (steps 3–4 render nothing until Task 3 adds them); that's fine — Task 3 extends the same file.

- [ ] **Step 5: Wizard render test**

Create `app/src/pages/OwnerWizard.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OwnerWizard from './OwnerWizard';

function renderWizard() {
  return render(<MemoryRouter><OwnerWizard /></MemoryRouter>);
}

describe('OwnerWizard', () => {
  it('starts on the Details step', () => {
    renderWizard();
    expect(screen.getByText('Listing title')).toBeInTheDocument();
  });

  it('advances to Photos after the details are filled', () => {
    renderWizard();
    fireEvent.change(screen.getByLabelText('BHK') ?? screen.getByDisplayValue('Select'), { target: { value: '2' } });
    // fill remaining required fields by role/order
    const selects = screen.getAllByRole('combobox');
    // selects: [BHK, Locality, Furnishing, Preferred tenant]
    fireEvent.change(selects[1], { target: { value: 'Koramangala' } });
    fireEvent.change(selects[2], { target: { value: 'semi' } });
    fireEvent.change(selects[3], { target: { value: 'family' } });
    const rentInput = screen.getByPlaceholderText('35000');
    fireEvent.change(rentInput, { target: { value: '35000' } });
    fireEvent.change(screen.getByPlaceholderText('1100'), { target: { value: '1100' } });
    fireEvent.click(screen.getByText(/Next/));
    expect(screen.getByText(/Select photos for your listing/)).toBeInTheDocument();
  });
});
```
Note: if `getByLabelText('BHK')` is unreliable because the label isn't associated via `htmlFor`, the test uses `getAllByRole('combobox')` indexing instead — keep the combobox-index approach as the primary mechanism and drop the `getByLabelText` line if it throws. Adjust selectors so the test genuinely drives the form and asserts the Photos step appears.

- [ ] **Step 6: Run tests + build**

Run: `cd app && npm test -- OwnerWizard` (expect PASS), then `cd app && npm run build` (expect clean).

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: owner wizard shell with details and photos steps"
```

---

### Task 3: Step 3 (Preferences) + Step 4 (Review) + Publish → verification flip

**Files:**
- Create: `app/src/components/owner/StepPreferences.tsx`, `app/src/components/owner/StepReview.tsx`, `app/src/components/owner/PublishedState.tsx`
- Modify: `app/src/pages/OwnerWizard.tsx`

**Interfaces:**
- Consumes: `ListingDraft`; `Button`; `VerifiedBadge`.
- Produces:
  - `StepPreferences({ draft, set })`, `StepReview({ draft })`
  - `PublishedState({ draft, verified, onVerify }: { draft: ListingDraft; verified: boolean; onVerify: () => void })`
  - OwnerWizard extended: renders steps 3 & 4; step-4 "Publish" sets `published=true`; while `published`, renders `PublishedState`; its verify button sets `verified=true`.

- [ ] **Step 1: StepPreferences**

Create `app/src/components/owner/StepPreferences.tsx`:
```tsx
import type { ListingDraft } from '../../lib/ownerDraft';

const AMENITIES = ['Lift', 'Parking', 'Power backup', 'Security', 'Wi-Fi', 'Gym', 'Pool', 'Play area'];
const label = 'block text-sm font-semibold mb-1';

export function StepPreferences({ draft, set }: { draft: ListingDraft; set: (patch: Partial<ListingDraft>) => void }) {
  const toggle = (a: string) => {
    const has = draft.amenities.includes(a);
    set({ amenities: has ? draft.amenities.filter(x => x !== a) : [...draft.amenities, a] });
  };
  return (
    <div className="grid gap-4">
      <div>
        <label className={label}>Available from</label>
        <input type="date" className="w-full rounded-lg border border-line px-3 py-2" value={draft.moveInDate}
          onChange={e => set({ moveInDate: e.target.value })} />
      </div>
      <div>
        <label className={label}>Amenities</label>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map(a => {
            const on = draft.amenities.includes(a);
            return (
              <button key={a} type="button" onClick={() => toggle(a)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${on ? 'bg-blueharbor text-white' : 'border border-line text-coolgrey'}`}>
                {a}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: StepReview**

Create `app/src/components/owner/StepReview.tsx`:
```tsx
import type { ListingDraft } from '../../lib/ownerDraft';

const FURNISH: Record<string, string> = { unfurnished: 'Unfurnished', semi: 'Semi-furnished', furnished: 'Furnished' };
const row = 'flex justify-between border-b border-line py-2 text-sm';

export function StepReview({ draft }: { draft: ListingDraft }) {
  return (
    <div>
      {draft.photos[0] && <img src={draft.photos[0]} alt="" className="mb-4 h-40 w-full rounded-lg object-cover" />}
      <div className={row}><span className="text-coolgrey">Title</span><span className="font-semibold">{draft.title || '—'}</span></div>
      <div className={row}><span className="text-coolgrey">Home</span><span className="font-semibold">{draft.bhk}BHK · {draft.locality}</span></div>
      <div className={row}><span className="text-coolgrey">Rent</span><span className="font-semibold">₹{Number(draft.rent).toLocaleString('en-IN')}/mo</span></div>
      <div className={row}><span className="text-coolgrey">Deposit</span><span className="font-semibold">₹{Number(draft.deposit || 0).toLocaleString('en-IN')}</span></div>
      <div className={row}><span className="text-coolgrey">Area</span><span className="font-semibold">{draft.areaSqft} sq.ft</span></div>
      <div className={row}><span className="text-coolgrey">Furnishing</span><span className="font-semibold">{FURNISH[draft.furnishing] || '—'}</span></div>
      <div className={row}><span className="text-coolgrey">Preferred tenant</span><span className="font-semibold capitalize">{draft.tenantType || '—'}</span></div>
      <div className={row}><span className="text-coolgrey">Available from</span><span className="font-semibold">{draft.moveInDate || '—'}</span></div>
      <div className="flex justify-between py-2 text-sm"><span className="text-coolgrey">Photos</span><span className="font-semibold">{draft.photos.length}</span></div>
    </div>
  );
}
```

- [ ] **Step 3: PublishedState (pending → Verified flip)**

Create `app/src/components/owner/PublishedState.tsx`:
```tsx
import { CheckCircle, ShieldCheck } from '@phosphor-icons/react';
import type { ListingDraft } from '../../lib/ownerDraft';
import { VerifiedBadge } from '../VerifiedBadge';
import { Button } from '../Button';

export function PublishedState({ draft, verified, onVerify }: { draft: ListingDraft; verified: boolean; onVerify: () => void }) {
  return (
    <div className="rounded-card border border-line bg-white p-6 text-center shadow-card">
      <CheckCircle size={48} weight="fill" className="mx-auto text-blueharbor" />
      <h2 className="font-display mt-3 text-xl font-extrabold">Listing published</h2>
      <p className="mt-1 text-sm text-coolgrey">{draft.bhk}BHK · {draft.locality} · ₹{Number(draft.rent).toLocaleString('en-IN')}/mo</p>

      <div className="mt-5 flex flex-col items-center gap-3">
        {verified ? (
          <>
            <VerifiedBadge kind="owner" />
            <p className="text-sm text-coolgrey">Identity and ownership verified. Your listing now carries the Verified Owner mark.</p>
          </>
        ) : (
          <>
            <VerifiedBadge kind="owner" pending />
            <p className="text-sm text-coolgrey">Aadhaar (offline XML/DigiLocker), PAN and an ownership proof are checked before your badge is issued.</p>
            <Button onClick={onVerify}><ShieldCheck size={16} /> Complete verification</Button>
          </>
        )}
      </div>
    </div>
  );
}
```
Note: `CheckCircle` and `ShieldCheck` are standard Phosphor icons; verify they resolve (substitute `SealCheck` for `CheckCircle` if needed and note it).

- [ ] **Step 4: Extend OwnerWizard for steps 3–4 + published**

In `app/src/pages/OwnerWizard.tsx`: add `published`/`verified` state and the step 3/4 rendering + Publish action. Replace the imports block and the render body so it reads:
```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import { emptyDraft, isStepComplete, type ListingDraft, type WizardStep } from '../lib/ownerDraft';
import { WizardProgress } from '../components/owner/WizardProgress';
import { StepDetails } from '../components/owner/StepDetails';
import { StepPhotos } from '../components/owner/StepPhotos';
import { StepPreferences } from '../components/owner/StepPreferences';
import { StepReview } from '../components/owner/StepReview';
import { PublishedState } from '../components/owner/PublishedState';
import { Button } from '../components/Button';

export default function OwnerWizard() {
  const nav = useNavigate();
  const [step, setStep] = useState<WizardStep>(1);
  const [draft, setDraft] = useState<ListingDraft>(emptyDraft());
  const [published, setPublished] = useState(false);
  const [verified, setVerified] = useState(false);
  const set = (patch: Partial<ListingDraft>) => setDraft(d => ({ ...d, ...patch }));
  const canNext = isStepComplete(step, draft);

  if (published) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <PublishedState draft={draft} verified={verified} onVerify={() => setVerified(true)} />
        <div className="mt-5 text-center">
          <Button variant="secondary" onClick={() => nav('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <button onClick={() => nav('/')} className="mb-4 inline-flex items-center gap-1 text-sm text-blueharbor">
        <ArrowLeft size={16} /> Home
      </button>
      <h1 className="font-display mb-4 text-2xl font-extrabold">List your property</h1>
      <WizardProgress step={step} />

      <div className="rounded-card border border-line bg-white p-5 shadow-card">
        {step === 1 && <StepDetails draft={draft} set={set} />}
        {step === 2 && <StepPhotos draft={draft} set={set} />}
        {step === 3 && <StepPreferences draft={draft} set={set} />}
        {step === 4 && <StepReview draft={draft} />}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <Button variant="secondary" onClick={() => (step === 1 ? nav('/') : setStep((step - 1) as WizardStep))}>Back</Button>
        {step < 4 ? (
          <Button onClick={() => canNext && setStep((step + 1) as WizardStep)} className={canNext ? '' : 'opacity-40 pointer-events-none'}>
            Next <ArrowRight size={16} />
          </Button>
        ) : (
          <Button onClick={() => setPublished(true)}>Publish listing</Button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Extend the wizard test**

Add a test to `app/src/pages/OwnerWizard.test.tsx` that drives all 4 steps and asserts the published + verified flip. Append inside the existing `describe`:
```tsx
  it('publishes and flips to Verified Owner', () => {
    renderWizard();
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: '2' } });
    fireEvent.change(selects[1], { target: { value: 'Koramangala' } });
    fireEvent.change(selects[2], { target: { value: 'semi' } });
    fireEvent.change(selects[3], { target: { value: 'family' } });
    fireEvent.change(screen.getByPlaceholderText('35000'), { target: { value: '35000' } });
    fireEvent.change(screen.getByPlaceholderText('1100'), { target: { value: '1100' } });
    fireEvent.click(screen.getByText(/Next/));            // -> Photos
    fireEvent.click(screen.getAllByRole('button').find(b => b.querySelector('img'))!); // select first preset photo
    fireEvent.click(screen.getByText(/Next/));            // -> Preferences
    fireEvent.change(screen.getByLabelText('Available from'), { target: { value: '2026-09-01' } });
    fireEvent.click(screen.getByText(/Next/));            // -> Review
    fireEvent.click(screen.getByText(/Publish listing/));
    expect(screen.getByText('Listing published')).toBeInTheDocument();
    expect(screen.getByText(/Verification pending/)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Complete verification/));
    expect(screen.getByText('Verified Owner')).toBeInTheDocument();
  });
```
Note: if `getByLabelText('Available from')` fails (label not associated), select the date input via `container.querySelector('input[type=date]')` instead. Ensure the test genuinely reaches the published + verified states.

- [ ] **Step 6: Run tests + build**

Run: `cd app && npm test` (all pass), then `cd app && npm run build` (clean).

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: owner wizard preferences/review steps + publish and verification flip"
```

---

### Task 4: Owner entry + routing + full click-through

**Files:**
- Modify: `app/src/App.tsx` (add route), `app/src/pages/Home.tsx` (add "List your property" link)

**Interfaces:**
- Consumes: `OwnerWizard`.
- Produces: route `/owner/new` → `OwnerWizard`; a header link on Home to `/owner/new`.

- [ ] **Step 1: Add the route**

In `app/src/App.tsx`, import and add the route:
```tsx
import OwnerWizard from './pages/OwnerWizard';
```
and inside `<Routes>`:
```tsx
<Route path="/owner/new" element={<OwnerWizard />} />
```

- [ ] **Step 2: Add the Home entry link**

In `app/src/pages/Home.tsx`, in the top bar (the row with the wordmark + city), add a "List your property" link. Import `Link` from `react-router-dom` and `House` from `@phosphor-icons/react`. Replace the city `<div>` on the right of the top bar with a small cluster:
```tsx
<div className="flex items-center gap-3">
  <Link to="/owner/new" className="inline-flex items-center gap-1 text-sm font-semibold text-blueharbor">
    <House size={16} /> List your property
  </Link>
  <span className="text-sm text-coolgrey">Bengaluru</span>
</div>
```
(Keep the wordmark on the left unchanged. If `House` doesn't resolve, use `Buildings` and note it.)

- [ ] **Step 3: Build + full click-through verification**

Run: `cd app && npm run build` (clean) and `cd app && npm test` (all pass).
Then start `npm run dev` ONCE and confirm the path works: Home → "List your property" → wizard steps 1–4 → Publish → "Verification pending" → "Complete verification" → "Verified Owner". Do NOT run extended browser-automation loops or repeated screenshots — a single manual confirmation is enough; if you cannot view it, rely on the build + tests.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: wire owner journey entry link and route"
```

---

### Task 5: Tappable trust explainers on Listing detail

**Files:**
- Create: `app/src/components/TrustScoreExplainer.tsx`, `app/src/components/VerifiedInfo.tsx`
- Modify: `app/src/pages/ListingDetail.tsx`

**Interfaces:**
- Consumes: `Owner` from `types.ts`; existing modal/popover pattern in `ListingDetail`.
- Produces:
  - `TrustScoreExplainer({ score }: { score: number })` — presentational breakdown.
  - `VerifiedInfo({ owner }: { owner?: Owner })` — what was verified + when.
  - `ListingDetail` updated so the `TrustScoreToken` and the owner-card `VerifiedBadge` are wrapped in buttons that open a popover/modal with the respective explainer (reusing the existing modal overlay pattern).

- [ ] **Step 1: TrustScoreExplainer**

Create `app/src/components/TrustScoreExplainer.tsx`:
```tsx
import { ShieldCheck } from '@phosphor-icons/react';
import { trustColor } from '../lib/trustScore';

const FACTORS = [
  { label: 'Identity & ownership verified', weight: 'High' },
  { label: 'Owner response rate', weight: 'High' },
  { label: 'Listing freshness', weight: 'Medium' },
  { label: 'Tenant reviews', weight: 'Medium' },
];

export function TrustScoreExplainer({ score }: { score: number }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-full font-display text-lg font-extrabold"
          style={{ backgroundColor: trustColor(score), color: score < 50 ? '#FFFFFF' : '#1B1E23' }}>
          {score}
        </span>
        <div>
          <h3 className="font-display text-lg font-extrabold">Trust Score</h3>
          <p className="text-xs text-coolgrey">How much this listing can be trusted, out of 100.</p>
        </div>
      </div>
      <ul className="mt-4 space-y-2">
        {FACTORS.map(f => (
          <li key={f.label} className="flex items-center justify-between text-sm">
            <span className="inline-flex items-center gap-2"><ShieldCheck size={16} className="text-blueharbor" /> {f.label}</span>
            <span className="text-xs font-semibold text-coolgrey">{f.weight}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-coolgrey">Existing portals sell leads. PropWeb scores trust — this is the moat.</p>
    </div>
  );
}
```

- [ ] **Step 2: VerifiedInfo**

Create `app/src/components/VerifiedInfo.tsx`:
```tsx
import { SealCheck } from '@phosphor-icons/react';
import type { Owner } from '../lib/types';

export function VerifiedInfo({ owner }: { owner?: Owner }) {
  const items = owner?.verifiedItems ?? [];
  return (
    <div>
      <h3 className="font-display flex items-center gap-2 text-lg font-extrabold">
        <SealCheck size={22} weight="fill" color="#1B1E23" /> Verified Owner
      </h3>
      {owner?.verified ? (
        <>
          <p className="mt-1 text-sm text-coolgrey">Verified on {owner.verifiedOn}. The following were checked:</p>
          <ul className="mt-3 space-y-2">
            {items.map(it => (
              <li key={it} className="inline-flex w-full items-center gap-2 rounded-lg bg-moontint px-3 py-2 text-sm font-semibold">
                <SealCheck size={16} weight="fill" color="#1B1E23" /> {it}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-1 text-sm text-coolgrey">This owner has not completed verification yet.</p>
      )}
      <p className="mt-4 text-xs text-coolgrey">Identity uses the legal route — Aadhaar offline XML / DigiLocker, never direct eKYC.</p>
    </div>
  );
}
```

- [ ] **Step 3: Wire the explainers into ListingDetail**

In `app/src/pages/ListingDetail.tsx`:
- Import the two components and add state: `const [explainer, setExplainer] = useState<'trust' | 'verified' | null>(null);`
- Wrap the header `TrustScoreToken` in a button: `<button type="button" onClick={() => setExplainer('trust')} aria-label="Explain Trust Score">{<TrustScoreToken score={listing.trustScore} />}</button>`.
- In the owner card, wrap the `VerifiedBadge` similarly: `<button type="button" onClick={() => setExplainer('verified')} aria-label="What was verified">{<VerifiedBadge kind="owner" />}</button>` (keep the pending badge non-interactive when `!verifiedOwner`).
- Add a popover/modal (reuse the Connect modal's overlay pattern) rendered when `explainer !== null`, closing on backdrop click and Escape, with `role="dialog"` `aria-modal="true"`:
```tsx
{explainer && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-graphite/40 p-4" onClick={() => setExplainer(null)}>
    <div role="dialog" aria-modal="true" className="w-full max-w-sm rounded-card bg-white p-6 shadow-card" onClick={e => e.stopPropagation()}>
      {explainer === 'trust' ? <TrustScoreExplainer score={listing.trustScore} /> : <VerifiedInfo owner={owner} />}
      <button onClick={() => setExplainer(null)} className="mt-5 w-full rounded-full border border-line py-2 text-sm font-semibold">Close</button>
    </div>
  </div>
)}
```
- Add an Escape-key `useEffect` for `explainer` mirroring the existing Connect-modal handler (or extend it to close whichever overlay is open).

- [ ] **Step 4: Build + verify**

Run: `cd app && npm test` (all pass — no new unit test required, but nothing regresses) and `cd app && npm run build` (clean). Optionally confirm in the browser once (no automation loops): open a listing → tap the Trust Score → breakdown popover; tap the Verified Owner badge → what-was-verified popover.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: tappable Trust Score and Verified Owner explainers on Listing detail"
```

---

## Notes / out of scope here
- Injecting the published listing into the tenant search results (client-side store) — deliberate stretch, not built.
- Owner dashboard, tenant onboarding/KYC screens — belong to the separate static-wireframes deliverable, not the demo's 3 journeys.
- UI polish (DESIGN.md pixel-parity) and the slide deck are tracked separately.
