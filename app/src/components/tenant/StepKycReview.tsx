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
