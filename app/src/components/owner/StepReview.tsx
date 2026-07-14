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
