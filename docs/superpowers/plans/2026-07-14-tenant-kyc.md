# Tenant Onboarding + KYC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the demo app's third verification loop — a tenant completes mock KYC (Aadhaar/PAN + employment/income) and earns a Verified Tenant badge — mirroring the existing owner verification pattern, and surface that badge in the Connect flow so it's visible where a CEO watching the demo would expect an owner to see it.

**Architecture:** A `TenantVerificationProvider` (React Context) mounted once in `App.tsx` holds in-memory verification status (`unverified` → `pending` → `verified`) shared between the new KYC wizard page and the existing Listing Detail Connect modal. The wizard itself (`TenantKyc.tsx`) is a stateful page identical in shape to `OwnerWizard.tsx` — local `step`/`draft` state, presentational step components, pure `isKycStepComplete` validation gating Next — except it reads/writes the shared context instead of local `published`/`verified` booleans.

**Tech Stack:** React 19, TypeScript, Tailwind, @phosphor-icons/react, react-router-dom, Vitest + @testing-library/react (fireEvent).

## Global Constraints

- App lives in `app/`. All paths relative to `app/` unless noted.
- No backend/DB/auth/real KYC. Aadhaar/PAN inputs are mock text fields with light formatting only (numeric/uppercase truncation), never validated as real documents.
- All verification state is in-memory (React state/context) and resets on page refresh — matches the existing Owner flow and the rest of the app.
- **Design tokens (exact hex):** Moontint `#F3F6FF`, Blue harbor `#3770BF`, Ice blue `#8DC2FF`, Lime glow `#C3EA4F`, Graphite `#1B1E23`, Cool grey `#5B6470`, Line `#DDE3EE`, Amber `#E8A13D`, Muted red `#E5533D`. (Tailwind names: `moontint`, `blueharbor`, `iceblue`, `limeglow`, `graphite`, `coolgrey`, `line`, `amber`, `mutedred`.)
- **Color rules:** lime = trust only (verified badge) — never a button; blue harbor = the single primary action per screen.
- **Fonts:** Manrope (`font-display`) for page/step headings; Inter (default) for everything else.
- **Icons:** Phosphor only. If a named icon does not resolve in the installed package, substitute a valid equivalent and note it.
- **Reuse existing pieces:** `Button`, `VerifiedBadge` (already supports `kind="tenant"`), `Select` (`app/src/components/Select.tsx`, the custom dropdown built for the dropdown-UI pass), `WizardProgress` (generalized in Task 3).
- Spec reference: `docs/superpowers/specs/2026-07-14-tenant-kyc-design.md`.

---

### Task 1: `TenantKycDraft` type + step validation (pure, TDD)

**Files:**
- Create: `app/src/lib/tenantKyc.ts`, `app/src/lib/tenantKyc.test.ts`

**Interfaces:**
- Produces:
  - `type EmploymentType = 'salaried' | 'self-employed' | 'student' | ''`
  - `type IncomeRange = '<25k' | '25k-50k' | '50k-1l' | '>1l' | ''`
  - `interface TenantKycDraft { fullName: string; aadhaar: string; pan: string; employmentType: EmploymentType; employer: string; incomeRange: IncomeRange }`
  - `emptyKycDraft(): TenantKycDraft`
  - `KycStep = 1 | 2 | 3`
  - `isKycStepComplete(step: KycStep, d: TenantKycDraft): boolean`

- [ ] **Step 1: Write the failing test**

Create `app/src/lib/tenantKyc.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { emptyKycDraft, isKycStepComplete } from './tenantKyc';

describe('tenantKyc', () => {
  it('emptyKycDraft starts incomplete on step 1', () => {
    expect(isKycStepComplete(1, emptyKycDraft())).toBe(false);
  });

  it('step 1 completes when identity fields are filled', () => {
    const d = { ...emptyKycDraft(), fullName: 'Ananya Rao', aadhaar: '234567890123', pan: 'ABCDE1234F' };
    expect(isKycStepComplete(1, d)).toBe(true);
  });

  it('step 2 requires employment type and income range', () => {
    expect(isKycStepComplete(2, emptyKycDraft())).toBe(false);
    const d = { ...emptyKycDraft(), employmentType: 'salaried' as const, incomeRange: '25k-50k' as const, employer: 'Acme Corp' };
    expect(isKycStepComplete(2, d)).toBe(true);
  });

  it('step 2 does not require an employer for students', () => {
    const d = { ...emptyKycDraft(), employmentType: 'student' as const, incomeRange: '<25k' as const };
    expect(isKycStepComplete(2, d)).toBe(true);
  });

  it('step 2 requires an employer for non-students', () => {
    const d = { ...emptyKycDraft(), employmentType: 'salaried' as const, incomeRange: '25k-50k' as const };
    expect(isKycStepComplete(2, d)).toBe(false);
  });

  it('step 3 (review) is always complete', () => {
    expect(isKycStepComplete(3, emptyKycDraft())).toBe(true);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd app && npm test -- tenantKyc`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `app/src/lib/tenantKyc.ts`:
```ts
export type EmploymentType = 'salaried' | 'self-employed' | 'student' | '';
export type IncomeRange = '<25k' | '25k-50k' | '50k-1l' | '>1l' | '';

export interface TenantKycDraft {
  fullName: string;
  aadhaar: string;
  pan: string;
  employmentType: EmploymentType;
  employer: string;
  incomeRange: IncomeRange;
}

export type KycStep = 1 | 2 | 3;

export function emptyKycDraft(): TenantKycDraft {
  return { fullName: '', aadhaar: '', pan: '', employmentType: '', employer: '', incomeRange: '' };
}

export function isKycStepComplete(step: KycStep, d: TenantKycDraft): boolean {
  switch (step) {
    case 1:
      return d.fullName !== '' && d.aadhaar !== '' && d.pan !== '';
    case 2:
      return d.employmentType !== '' && d.incomeRange !== '' &&
        (d.employmentType === 'student' || d.employer !== '');
    case 3:
      return true;
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `cd app && npm test -- tenantKyc`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add app/src/lib/tenantKyc.ts app/src/lib/tenantKyc.test.ts
git commit -m "feat: add tenant KYC draft type and step validation"
```

---

### Task 2: `TenantVerificationProvider` + `useTenantVerification` hook (TDD)

**Files:**
- Create: `app/src/hooks/useTenantVerification.tsx`, `app/src/hooks/useTenantVerification.test.tsx`

**Interfaces:**
- Consumes: `emptyKycDraft`, `TenantKycDraft` from `../lib/tenantKyc`.
- Produces:
  - `type TenantVerificationStatus = 'unverified' | 'pending' | 'verified'`
  - `TenantVerificationProvider({ children }: { children: ReactNode })`
  - `useTenantVerification(): { status: TenantVerificationStatus; kyc: TenantKycDraft; submitKyc: (draft: TenantKycDraft) => void; completeVerification: () => void }`

- [ ] **Step 1: Write the failing test**

Create `app/src/hooks/useTenantVerification.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TenantVerificationProvider, useTenantVerification } from './useTenantVerification';
import { emptyKycDraft } from '../lib/tenantKyc';

function Probe() {
  const { status, submitKyc, completeVerification } = useTenantVerification();
  return (
    <div>
      <span data-testid="status">{status}</span>
      <button onClick={() => submitKyc({ ...emptyKycDraft(), fullName: 'Ananya Rao' })}>Submit</button>
      <button onClick={completeVerification}>Verify</button>
    </div>
  );
}

describe('TenantVerificationProvider', () => {
  it('starts unverified, moves to pending on submit, then verified on completeVerification', () => {
    render(<TenantVerificationProvider><Probe /></TenantVerificationProvider>);
    expect(screen.getByTestId('status')).toHaveTextContent('unverified');
    fireEvent.click(screen.getByText('Submit'));
    expect(screen.getByTestId('status')).toHaveTextContent('pending');
    fireEvent.click(screen.getByText('Verify'));
    expect(screen.getByTestId('status')).toHaveTextContent('verified');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd app && npm test -- useTenantVerification`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `app/src/hooks/useTenantVerification.tsx`:
```tsx
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { emptyKycDraft, type TenantKycDraft } from '../lib/tenantKyc';

export type TenantVerificationStatus = 'unverified' | 'pending' | 'verified';

interface TenantVerificationValue {
  status: TenantVerificationStatus;
  kyc: TenantKycDraft;
  submitKyc: (draft: TenantKycDraft) => void;
  completeVerification: () => void;
}

const TenantVerificationContext = createContext<TenantVerificationValue | null>(null);

export function TenantVerificationProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<TenantVerificationStatus>('unverified');
  const [kyc, setKyc] = useState<TenantKycDraft>(emptyKycDraft());

  const value = useMemo<TenantVerificationValue>(() => ({
    status,
    kyc,
    submitKyc: (draft) => { setKyc(draft); setStatus('pending'); },
    completeVerification: () => setStatus('verified'),
  }), [status, kyc]);

  return <TenantVerificationContext.Provider value={value}>{children}</TenantVerificationContext.Provider>;
}

export function useTenantVerification(): TenantVerificationValue {
  const ctx = useContext(TenantVerificationContext);
  if (!ctx) throw new Error('useTenantVerification must be used within a TenantVerificationProvider');
  return ctx;
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `cd app && npm test -- useTenantVerification`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/src/hooks/useTenantVerification.tsx app/src/hooks/useTenantVerification.test.tsx
git commit -m "feat: add TenantVerificationProvider for shared KYC status"
```

---

### Task 3: Generalize `WizardProgress` for reuse across both wizards

**Files:**
- Modify: `app/src/components/owner/WizardProgress.tsx`, `app/src/pages/OwnerWizard.tsx`

**Interfaces:**
- Produces: `WizardProgress({ step, labels }: { step: number; labels: string[] })` (was `{ step }` with a hardcoded `LABELS` constant).

- [ ] **Step 1: Add the `labels` prop**

In `app/src/components/owner/WizardProgress.tsx`, replace the entire file:
```tsx
export function WizardProgress({ step, labels }: { step: number; labels: string[] }) {
  return (
    <ol className="mb-6 flex items-center gap-2">
      {labels.map((label, i) => {
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
            {n < labels.length && <span className="h-px flex-1 bg-line" />}
          </li>
        );
      })}
    </ol>
  );
}
```

- [ ] **Step 2: Update the call site in `OwnerWizard.tsx`**

In `app/src/pages/OwnerWizard.tsx`, add a `LABELS` constant and pass it:
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

const LABELS = ['Details', 'Photos', 'Preferences', 'Review'];

export default function OwnerWizard() {
```
Then change the `<WizardProgress step={step} />` line to:
```tsx
      <WizardProgress step={step} labels={LABELS} />
```
(No other lines in `OwnerWizard.tsx` change.)

- [ ] **Step 3: Run the existing Owner tests to confirm no regression**

Run: `cd app && npm test -- OwnerWizard`
Expected: PASS (both existing tests, unchanged).

- [ ] **Step 4: Commit**

```bash
git add app/src/components/owner/WizardProgress.tsx app/src/pages/OwnerWizard.tsx
git commit -m "refactor: generalize WizardProgress with a labels prop for reuse"
```

---

### Task 4: Tenant KYC step components

**Files:**
- Create: `app/src/components/tenant/StepIdentity.tsx`, `app/src/components/tenant/StepEmployment.tsx`, `app/src/components/tenant/StepKycReview.tsx`, `app/src/components/tenant/TenantVerifiedState.tsx`

**Interfaces:**
- Consumes: `TenantKycDraft`, `EmploymentType`, `IncomeRange` from `../../lib/tenantKyc`; `Select` from `../Select`; `VerifiedBadge` from `../VerifiedBadge`; `Button` from `../Button`.
- Produces:
  - `StepIdentity({ draft, set }: { draft: TenantKycDraft; set: (patch: Partial<TenantKycDraft>) => void })`
  - `StepEmployment({ draft, set }: same)`
  - `StepKycReview({ draft }: { draft: TenantKycDraft })`
  - `TenantVerifiedState({ verified, onVerify }: { verified: boolean; onVerify: () => void })`

- [ ] **Step 1: StepIdentity**

Create `app/src/components/tenant/StepIdentity.tsx`:
```tsx
import type { TenantKycDraft } from '../../lib/tenantKyc';

const label = 'block text-sm font-semibold mb-1';
const field = 'w-full rounded-lg border border-line px-3 py-2';

export function StepIdentity({ draft, set }: { draft: TenantKycDraft; set: (patch: Partial<TenantKycDraft>) => void }) {
  return (
    <div className="grid gap-4">
      <div>
        <label className={label}>Full name</label>
        <input className={field} value={draft.fullName} onChange={e => set({ fullName: e.target.value })} placeholder="As on Aadhaar/PAN" />
      </div>
      <div>
        <label className={label}>Aadhaar number</label>
        <input
          className={field}
          inputMode="numeric"
          maxLength={12}
          value={draft.aadhaar}
          onChange={e => set({ aadhaar: e.target.value.replace(/\D/g, '').slice(0, 12) })}
          placeholder="234567890123"
        />
        <p className="mt-1 text-xs text-coolgrey">Demo only — verified via the legal route (offline XML/DigiLocker), never entered directly.</p>
      </div>
      <div>
        <label className={label}>PAN</label>
        <input
          className={field}
          maxLength={10}
          value={draft.pan}
          onChange={e => set({ pan: e.target.value.toUpperCase().slice(0, 10) })}
          placeholder="ABCDE1234F"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: StepEmployment**

Create `app/src/components/tenant/StepEmployment.tsx`:
```tsx
import { Select } from '../Select';
import type { TenantKycDraft, EmploymentType, IncomeRange } from '../../lib/tenantKyc';

const label = 'block text-sm font-semibold mb-1';
const field = 'w-full rounded-lg border border-line px-3 py-2';

const EMPLOYMENT_TYPES: { v: EmploymentType; l: string }[] = [
  { v: 'salaried', l: 'Salaried' },
  { v: 'self-employed', l: 'Self-employed' },
  { v: 'student', l: 'Student' },
];

const INCOME_RANGES: { v: IncomeRange; l: string }[] = [
  { v: '', l: 'Select' },
  { v: '<25k', l: '< ₹25,000' },
  { v: '25k-50k', l: '₹25,000 – ₹50,000' },
  { v: '50k-1l', l: '₹50,000 – ₹1,00,000' },
  { v: '>1l', l: '> ₹1,00,000' },
];

export function StepEmployment({ draft, set }: { draft: TenantKycDraft; set: (patch: Partial<TenantKycDraft>) => void }) {
  return (
    <div className="grid gap-4">
      <div>
        <label className={label}>Employment type</label>
        <div className="flex flex-wrap gap-2">
          {EMPLOYMENT_TYPES.map(t => (
            <button
              key={t.v}
              type="button"
              onClick={() => set({ employmentType: t.v, employer: t.v === 'student' ? '' : draft.employer })}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${draft.employmentType === t.v ? 'bg-blueharbor text-white' : 'border border-line text-coolgrey'}`}
            >
              {t.l}
            </button>
          ))}
        </div>
      </div>
      {draft.employmentType !== 'student' && (
        <div>
          <label className={label}>{draft.employmentType === 'self-employed' ? 'Business name' : 'Employer'}</label>
          <input className={field} value={draft.employer} onChange={e => set({ employer: e.target.value })} placeholder="e.g. Acme Technologies" />
        </div>
      )}
      <div>
        <label className={label}>Monthly income range</label>
        <Select
          compact
          value={draft.incomeRange}
          onChange={v => set({ incomeRange: v as IncomeRange })}
          options={INCOME_RANGES}
          ariaLabel="Monthly income range"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: StepKycReview**

Create `app/src/components/tenant/StepKycReview.tsx`:
```tsx
import type { TenantKycDraft } from '../../lib/tenantKyc';

const EMPLOYMENT_LABEL: Record<string, string> = { salaried: 'Salaried', 'self-employed': 'Self-employed', student: 'Student' };
const INCOME_LABEL: Record<string, string> = { '<25k': '< ₹25,000', '25k-50k': '₹25,000 – ₹50,000', '50k-1l': '₹50,000 – ₹1,00,000', '>1l': '> ₹1,00,000' };
const row = 'flex justify-between border-b border-line py-2 text-sm';

export function StepKycReview({ draft }: { draft: TenantKycDraft }) {
  return (
    <div>
      <div className={row}><span className="text-coolgrey">Full name</span><span className="font-semibold">{draft.fullName || '—'}</span></div>
      <div className={row}><span className="text-coolgrey">Aadhaar</span><span className="font-semibold">•••• •••• {draft.aadhaar.slice(-4) || '••••'}</span></div>
      <div className={row}><span className="text-coolgrey">PAN</span><span className="font-semibold">{draft.pan || '—'}</span></div>
      <div className={row}><span className="text-coolgrey">Employment</span><span className="font-semibold">{EMPLOYMENT_LABEL[draft.employmentType] || '—'}</span></div>
      {draft.employmentType !== 'student' && (
        <div className={row}><span className="text-coolgrey">{draft.employmentType === 'self-employed' ? 'Business' : 'Employer'}</span><span className="font-semibold">{draft.employer || '—'}</span></div>
      )}
      <div className="flex justify-between py-2 text-sm"><span className="text-coolgrey">Monthly income</span><span className="font-semibold">{INCOME_LABEL[draft.incomeRange] || '—'}</span></div>
    </div>
  );
}
```

- [ ] **Step 4: TenantVerifiedState**

Create `app/src/components/tenant/TenantVerifiedState.tsx`:
```tsx
import { ShieldCheck } from '@phosphor-icons/react';
import { VerifiedBadge } from '../VerifiedBadge';
import { Button } from '../Button';

export function TenantVerifiedState({ verified, onVerify }: { verified: boolean; onVerify: () => void }) {
  return (
    <div className="rounded-card border border-line bg-white p-6 text-center shadow-card">
      <ShieldCheck size={48} weight="fill" className="mx-auto text-blueharbor" />
      <h2 className="font-display mt-3 text-xl font-extrabold">KYC submitted</h2>

      <div className="mt-5 flex flex-col items-center gap-3">
        {verified ? (
          <>
            <VerifiedBadge kind="tenant" />
            <p className="text-sm text-coolgrey">Owners will see your Verified Tenant badge when you connect on a listing.</p>
          </>
        ) : (
          <>
            <VerifiedBadge kind="tenant" pending />
            <p className="text-sm text-coolgrey">Aadhaar (offline XML/DigiLocker), PAN and employment are checked before your badge is issued.</p>
            <Button onClick={onVerify}><ShieldCheck size={16} /> Complete verification</Button>
          </>
        )}
      </div>
    </div>
  );
}
```
Note: `ShieldCheck` is a standard Phosphor icon (already used elsewhere in the app); verify it resolves.

- [ ] **Step 5: Build check**

Run: `cd app && npx tsc --noEmit`
Expected: no errors (these components aren't wired into any page yet, but must type-check standalone).

- [ ] **Step 6: Commit**

```bash
git add app/src/components/tenant
git commit -m "feat: add tenant KYC step components and verified state"
```

---

### Task 5: `TenantKyc` page + route + Navbar entry (TDD)

**Files:**
- Create: `app/src/pages/TenantKyc.tsx`, `app/src/pages/TenantKyc.test.tsx`
- Modify: `app/src/App.tsx`, `app/src/components/Navbar.tsx`

**Interfaces:**
- Consumes: `emptyKycDraft`, `isKycStepComplete`, `TenantKycDraft`, `KycStep` from `../lib/tenantKyc`; `useTenantVerification` from `../hooks/useTenantVerification`; `WizardProgress`; `StepIdentity`, `StepEmployment`, `StepKycReview`, `TenantVerifiedState` from `../components/tenant`; `Button`.
- Produces: `TenantKyc` default export (page); route `/tenant/verify`; a Navbar menu entry linking to it.

- [ ] **Step 1: Implement the page**

Create `app/src/pages/TenantKyc.tsx`:
```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import { emptyKycDraft, isKycStepComplete, type TenantKycDraft, type KycStep } from '../lib/tenantKyc';
import { useTenantVerification } from '../hooks/useTenantVerification';
import { WizardProgress } from '../components/owner/WizardProgress';
import { StepIdentity } from '../components/tenant/StepIdentity';
import { StepEmployment } from '../components/tenant/StepEmployment';
import { StepKycReview } from '../components/tenant/StepKycReview';
import { TenantVerifiedState } from '../components/tenant/TenantVerifiedState';
import { Button } from '../components/Button';

const LABELS = ['Identity', 'Employment', 'Review'];

export default function TenantKyc() {
  const nav = useNavigate();
  const { status, submitKyc, completeVerification } = useTenantVerification();
  const [step, setStep] = useState<KycStep>(1);
  const [draft, setDraft] = useState<TenantKycDraft>(emptyKycDraft());
  const set = (patch: Partial<TenantKycDraft>) => setDraft(d => ({ ...d, ...patch }));
  const canNext = isKycStepComplete(step, draft);

  if (status !== 'unverified') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <TenantVerifiedState verified={status === 'verified'} onVerify={completeVerification} />
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
      <h1 className="font-display mb-4 text-2xl font-extrabold">Get your Verified Tenant badge</h1>
      <WizardProgress step={step} labels={LABELS} />

      <div className="rounded-card border border-line bg-white p-5 shadow-card">
        {step === 1 && <StepIdentity draft={draft} set={set} />}
        {step === 2 && <StepEmployment draft={draft} set={set} />}
        {step === 3 && <StepKycReview draft={draft} />}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <Button variant="secondary" onClick={() => (step === 1 ? nav('/') : setStep((step - 1) as KycStep))}>Back</Button>
        {step < 3 ? (
          <Button onClick={() => canNext && setStep((step + 1) as KycStep)} className={canNext ? '' : 'opacity-40 pointer-events-none'}>
            Next <ArrowRight size={16} />
          </Button>
        ) : (
          <Button onClick={() => submitKyc(draft)}>Submit KYC</Button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Wire the route in `App.tsx`**

Replace `app/src/App.tsx`:
```tsx
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { TenantVerificationProvider } from './hooks/useTenantVerification';
import Home from './pages/Home';
import Results from './pages/Results';
import ListingDetail from './pages/ListingDetail';
import OwnerWizard from './pages/OwnerWizard';
import TenantKyc from './pages/TenantKyc';

export default function App() {
  return (
    <TenantVerificationProvider>
      <div className="relative overflow-x-hidden">
        <Navbar />
        <div className="pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/results" element={<Results />} />
            <Route path="/listing/:id" element={<ListingDetail />} />
            <Route path="/owner/new" element={<OwnerWizard />} />
            <Route path="/tenant/verify" element={<TenantKyc />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </TenantVerificationProvider>
  );
}
```

- [ ] **Step 3: Add the Navbar entry**

In `app/src/components/Navbar.tsx`, add `SealCheck` to the icon import and insert a menu row. Change:
```tsx
import { List, X, House, CaretRight, MagnifyingGlass, Info, ShieldCheck, Tag, Question } from '@phosphor-icons/react';

const MENU = [
  { label: 'Home', to: '/', icon: House },
  { label: 'Browse rentals', to: '/', icon: MagnifyingGlass },
  { label: 'How it works', to: '/', icon: Info },
  { label: 'Trust & verification', to: '/', icon: ShieldCheck },
  { label: 'Pricing', to: '/', icon: Tag },
  { label: 'Help & support', to: '/', icon: Question },
];
```
to:
```tsx
import { List, X, House, CaretRight, MagnifyingGlass, Info, ShieldCheck, Tag, Question, SealCheck } from '@phosphor-icons/react';

const MENU = [
  { label: 'Home', to: '/', icon: House },
  { label: 'Browse rentals', to: '/', icon: MagnifyingGlass },
  { label: 'Get Verified Tenant badge', to: '/tenant/verify', icon: SealCheck },
  { label: 'How it works', to: '/', icon: Info },
  { label: 'Trust & verification', to: '/', icon: ShieldCheck },
  { label: 'Pricing', to: '/', icon: Tag },
  { label: 'Help & support', to: '/', icon: Question },
];
```
No other lines in `Navbar.tsx` change — the existing `MENU.map` rendering already handles any entry generically.

- [ ] **Step 4: Write the wizard test**

Create `app/src/pages/TenantKyc.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TenantVerificationProvider } from '../hooks/useTenantVerification';
import TenantKyc from './TenantKyc';

function renderKyc() {
  return render(
    <MemoryRouter>
      <TenantVerificationProvider>
        <TenantKyc />
      </TenantVerificationProvider>
    </MemoryRouter>,
  );
}

function chooseOption(combobox: HTMLElement, optionName: string) {
  fireEvent.click(combobox);
  fireEvent.click(screen.getByRole('option', { name: optionName }));
}

describe('TenantKyc', () => {
  it('starts on the Identity step', () => {
    renderKyc();
    expect(screen.getByText('Full name')).toBeInTheDocument();
  });

  it('submits KYC and flips to Verified Tenant', () => {
    renderKyc();
    fireEvent.change(screen.getByPlaceholderText('As on Aadhaar/PAN'), { target: { value: 'Ananya Rao' } });
    fireEvent.change(screen.getByPlaceholderText('234567890123'), { target: { value: '234567890123' } });
    fireEvent.change(screen.getByPlaceholderText('ABCDE1234F'), { target: { value: 'ABCDE1234F' } });
    fireEvent.click(screen.getByText(/Next/));            // -> Employment
    fireEvent.click(screen.getByText('Salaried'));
    fireEvent.change(screen.getByPlaceholderText('e.g. Acme Technologies'), { target: { value: 'Acme Technologies' } });
    chooseOption(screen.getByRole('combobox'), '₹25,000 – ₹50,000');
    fireEvent.click(screen.getByText(/Next/));            // -> Review
    fireEvent.click(screen.getByText('Submit KYC'));
    expect(screen.getByText('KYC submitted')).toBeInTheDocument();
    expect(screen.getByText(/Verification pending/)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Complete verification/));
    expect(screen.getByText('Verified Tenant')).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Run to verify it passes**

Run: `cd app && npm test -- TenantKyc`
Expected: PASS (2 tests).

- [ ] **Step 6: Build check**

Run: `cd app && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add app/src/pages/TenantKyc.tsx app/src/pages/TenantKyc.test.tsx app/src/App.tsx app/src/components/Navbar.tsx
git commit -m "feat: add tenant KYC wizard, route, and nav entry"
```

---

### Task 6: Surface the badge in the Connect modal + final verification

**Files:**
- Modify: `app/src/pages/ListingDetail.tsx`

**Interfaces:**
- Consumes: `useTenantVerification` from `../hooks/useTenantVerification`; `VerifiedBadge` (already imported); `Link` from `react-router-dom`.

- [ ] **Step 1: Add the imports and hook**

In `app/src/pages/ListingDetail.tsx`, change the react-router-dom import line from:
```tsx
import { useParams, useNavigate } from 'react-router-dom';
```
to:
```tsx
import { useParams, useNavigate, Link } from 'react-router-dom';
```
Add a new import below the existing `VerifiedInfo` import:
```tsx
import { useTenantVerification } from '../hooks/useTenantVerification';
```
Inside the `ListingDetail` component, after the existing `const { listings, owners, tenant, loading } = useData();` line, add:
```tsx
  const { status: tenantStatus } = useTenantVerification();
```

- [ ] **Step 2: Show the badge in the "Pay to connect" branch**

Find this block in the Connect modal (the `{showConnect && ( ... )}` section, inside the `connected ? (...) : ( ... )` ternary):
```tsx
            ) : (
              <>
                <h3 className="text-lg font-bold">Pay to connect</h3>
                <p className="mt-1 text-sm text-coolgrey">Unlock this verified owner's contact for a small fee. (Mock — no real payment.)</p>
                <Button className="mt-4 w-full" onClick={() => setConnected(true)}>Pay ₹49 (mock)</Button>
              </>
            )}
```
Replace it with:
```tsx
            ) : (
              <>
                <h3 className="text-lg font-bold">Pay to connect</h3>
                <p className="mt-1 text-sm text-coolgrey">Unlock this verified owner's contact for a small fee. (Mock — no real payment.)</p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  {tenantStatus === 'verified' && <VerifiedBadge kind="tenant" />}
                  {tenantStatus === 'pending' && <VerifiedBadge kind="tenant" pending />}
                  {tenantStatus === 'unverified' && (
                    <Link to="/tenant/verify" onClick={() => setShowConnect(false)} className="text-xs font-semibold text-blueharbor underline">
                      Not verified yet — Get your Verified Tenant badge
                    </Link>
                  )}
                </div>
                {tenantStatus === 'verified' && <p className="mt-1 text-xs text-coolgrey">Connecting as a Verified Tenant.</p>}
                <Button className="mt-4 w-full" onClick={() => setConnected(true)}>Pay ₹49 (mock)</Button>
              </>
            )}
```

- [ ] **Step 3: Run the full test suite**

Run: `cd app && npm test`
Expected: all suites PASS — no regressions in `ListingCard`, `primitives`, `OwnerWizard`, `TenantKyc`, `useTenantVerification`, `tenantKyc`, `data`, `filter`, `matchScore`, `trustScore`.

- [ ] **Step 4: Build check**

Run: `cd app && npm run build`
Expected: compiles with no type errors.

- [ ] **Step 5: Manual click-through**

Run: `cd app && npm run dev` ONCE. Confirm: Navbar → "Get Verified Tenant badge" → wizard steps Identity → Employment → Review → "Submit KYC" → "Verification pending" → "Complete verification" → "Verified Tenant". Then: Home → any listing → Connect → the modal shows the Verified Tenant badge and "Connecting as a Verified Tenant." Do NOT run extended browser-automation loops or repeated screenshots — a single manual confirmation is enough; if you cannot view it, rely on the build + tests.

- [ ] **Step 6: Commit**

```bash
git add app/src/pages/ListingDetail.tsx
git commit -m "feat: surface Verified Tenant badge in the Connect modal"
```

---

## Notes / out of scope here

- Owner Dashboard showing a list of tenants who connected (separate wireframes deliverable).
- Real Aadhaar/PAN validation or document upload — mock text fields only.
- Persisting verification state across page refreshes (no backend, matches the rest of the app).
