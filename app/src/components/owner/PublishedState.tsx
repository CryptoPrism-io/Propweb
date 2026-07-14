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
