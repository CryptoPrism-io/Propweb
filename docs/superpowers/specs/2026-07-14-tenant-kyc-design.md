# Tenant Onboarding + KYC — Design

**Date:** 2026-07-14
**Status:** Approved

## Goal

Build the demo app's third verification loop: a tenant completes mock KYC (Aadhaar/PAN + employment/income) and earns a **Verified Tenant** badge, mirroring the existing owner verification pattern (`OwnerWizard` → `PublishedState`, pending → Verified flip). Two of the 11 spec'd wireframe screens (Handover Brief §6: "Tenant onboarding", "Tenant KYC") become clickable in the demo, and the badge surfaces where it matters for the pitch: in the Connect flow, so CEOs literally see "this is what the owner would see."

## Architecture

A new `TenantVerificationProvider` (React Context) is mounted once in `App.tsx`, wrapping `<Routes>` alongside `Navbar`/`Footer`. It holds:

```
type TenantVerificationStatus = 'unverified' | 'pending' | 'verified';
{ status: TenantVerificationStatus; kyc: TenantKycDraft | null }
```

with actions `submitKyc(draft)` (→ `pending`) and `completeVerification()` (→ `verified`).

This is lifted to app level — unlike the Owner flow, whose `published`/`verified` booleans live locally inside `OwnerWizard` — because two separate routes need to read the same state: the KYC wizard (`/tenant/verify`) and the Connect modal on Listing Detail (`/listing/:id`). All state is in-memory and resets on refresh, consistent with the rest of the app's no-backend, no-persistence model.

## Data model

`app/src/lib/tenantKyc.ts`:

```ts
export type EmploymentType = 'salaried' | 'self-employed' | 'student' | '';
export type IncomeRange = '<25k' | '25k-50k' | '50k-1l' | '>1l' | '';

export interface TenantKycDraft {
  fullName: string;
  aadhaar: string;        // mock 12-digit display string, not validated as real Aadhaar
  pan: string;             // mock 10-char string
  employmentType: EmploymentType;
  employer: string;        // employer / institution name
  incomeRange: IncomeRange;
}

export type KycStep = 1 | 2 | 3; // 1 Identity, 2 Employment, 3 Review

export function emptyKycDraft(): TenantKycDraft;
export function isKycStepComplete(step: KycStep, d: TenantKycDraft): boolean;
```

Step-completion rules (mirrors `ownerDraft.ts`):
- Step 1 (Identity): `fullName`, `aadhaar`, `pan` all non-empty.
- Step 2 (Employment): `employmentType` and `incomeRange` set; `employer` non-empty unless `employmentType === 'student'`.
- Step 3 (Review): always complete.

Income range labels (echoing the Handover Brief's own "income range" phrasing): `< ₹25,000`, `₹25,000 – ₹50,000`, `₹50,000 – ₹1,00,000`, `> ₹1,00,000`.

## Components

New `app/src/components/tenant/` directory, mirroring `components/owner/`:

- `StepIdentity.tsx` — full name (text), Aadhaar (mock numeric input, 12-digit), PAN (mock text input, uppercased).
- `StepEmployment.tsx` — employment type as chip buttons (Salaried / Self-employed / Student, same chip pattern as `SearchPanel`'s BHK selector), employer/institution text input (hidden/disabled when Student), income range via the new `Select` component (`app/src/components/Select.tsx`, already built for the dropdown UI pass).
- `StepKycReview.tsx` — read-only summary rows, mirrors `StepReview.tsx`.
- `TenantVerifiedState.tsx` — mirrors `PublishedState.tsx`: pending state shows `VerifiedBadge kind="tenant" pending` + legal-route copy ("Aadhaar offline XML/DigiLocker, PAN and employment are checked before your badge is issued" — same compliance framing as the owner side) + a "Complete verification" button; verified state shows `VerifiedBadge kind="tenant"` + "Owners will see your Verified Tenant badge when you connect."

`WizardProgress.tsx` (existing, owner-only today) gets a `labels: string[]` prop instead of a hardcoded `LABELS` array, so both wizards share one stepper component. `OwnerWizard.tsx` passes its existing 4 labels; `TenantKyc.tsx` passes `['Identity', 'Employment', 'Review']`.

New page `app/src/pages/TenantKyc.tsx` — same shape as `OwnerWizard.tsx`: local `step` state (1–3), local `draft` state, reads/writes the shared `TenantVerificationProvider` status instead of local `published`/`verified` booleans. Renders `TenantVerifiedState` once status is `pending` or `verified`.

## Connect modal tie-in

`ListingDetail.tsx`'s existing "Pay to connect" modal (`showConnect` state, pre-`connected` branch) reads `useTenantVerification()` and renders a small status row above the "Pay ₹49 (mock)" button:

- `verified` → `VerifiedBadge kind="tenant"` + "Connecting as a Verified Tenant".
- `pending` → `VerifiedBadge kind="tenant" pending` + "Verification pending".
- `unverified` → a text link "Not verified yet — Get your Verified Tenant badge" → `/tenant/verify`.

This is the only change to already-shipped, tested code (`ListingDetail.tsx`); everything else is additive.

## Routing & navigation

- Route `/tenant/verify` → `TenantKyc` in `App.tsx`, alongside the existing `/owner/new` route.
- `Navbar.tsx`: add a `SealCheck`-icon row to the existing `MENU` array — "Get Verified Tenant badge" → `/tenant/verify`. The drawer's single bottom gradient CTA stays "List your property" only (DESIGN.md: one blue primary action per screen); the tenant entry is a regular menu row, not a second primary button.

## Testing

- `app/src/lib/tenantKyc.test.ts` — TDD for `isKycStepComplete`, mirrors `ownerDraft.test.ts`.
- `app/src/pages/TenantKyc.test.tsx` — mirrors `OwnerWizard.test.tsx`: drive all 3 steps via the `Select` component's open/click pattern (see the updated `OwnerWizard.test.tsx` helper `chooseOption`), assert the pending → "Complete verification" → Verified Tenant flip.
- No new test file for `ListingDetail.tsx` (none exists today for it); full suite + a manual click-through confirm the Connect-modal addition doesn't regress existing behavior.

## Out of scope

- Owner Dashboard showing a list of verified tenants who connected (belongs to the separate wireframes deliverable, not this demo pass).
- Real Aadhaar/PAN validation or masking beyond simple mock input formatting.
- Persisting verification state across page refreshes.
