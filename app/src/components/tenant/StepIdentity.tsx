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
