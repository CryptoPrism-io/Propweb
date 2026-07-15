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
