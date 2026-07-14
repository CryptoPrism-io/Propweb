import type { ListingDraft } from '../../lib/ownerDraft';
import { Select } from '../Select';

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
        <Select
          compact
          value={draft.bhk ? String(draft.bhk) : ''}
          onChange={v => set({ bhk: Number(v) })}
          options={[{ v: '', l: 'Select' }, ...[1, 2, 3].map(b => ({ v: String(b), l: `${b} BHK` }))]}
          ariaLabel="BHK"
        />
      </div>
      <div>
        <label className={label}>Locality</label>
        <Select
          compact
          value={draft.locality}
          onChange={v => set({ locality: v })}
          options={[{ v: '', l: 'Select' }, ...LOCALITIES.map(l => ({ v: l, l }))]}
          ariaLabel="Locality"
        />
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
        <Select
          compact
          value={draft.furnishing}
          onChange={v => set({ furnishing: v as ListingDraft['furnishing'] })}
          options={[
            { v: '', l: 'Select' },
            { v: 'unfurnished', l: 'Unfurnished' },
            { v: 'semi', l: 'Semi-furnished' },
            { v: 'furnished', l: 'Furnished' },
          ]}
          ariaLabel="Furnishing"
        />
      </div>
      <div className="sm:col-span-2">
        <label className={label}>Preferred tenant</label>
        <Select
          compact
          value={draft.tenantType}
          onChange={v => set({ tenantType: v as ListingDraft['tenantType'] })}
          options={[
            { v: '', l: 'Select' },
            { v: 'family', l: 'Family' },
            { v: 'bachelor', l: 'Bachelor' },
            { v: 'any', l: 'Any' },
          ]}
          ariaLabel="Preferred tenant"
        />
      </div>
    </div>
  );
}
