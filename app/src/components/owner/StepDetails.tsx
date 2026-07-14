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
