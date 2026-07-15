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
