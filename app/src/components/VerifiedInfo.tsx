import { SealCheck } from '@phosphor-icons/react';
import type { Owner } from '../lib/types';

export function VerifiedInfo({ owner }: { owner?: Owner }) {
  const items = owner?.verifiedItems ?? [];
  return (
    <div>
      <h3 className="font-display flex items-center gap-2 text-lg font-extrabold">
        <SealCheck size={22} weight="fill" color="#1B1E23" /> Verified Owner
      </h3>
      {owner?.verified ? (
        <>
          <p className="mt-1 text-sm text-coolgrey">Verified on {owner.verifiedOn}. The following were checked:</p>
          <ul className="mt-3 space-y-2">
            {items.map(it => (
              <li key={it} className="inline-flex w-full items-center gap-2 rounded-lg bg-moontint px-3 py-2 text-sm font-semibold">
                <SealCheck size={16} weight="fill" color="#1B1E23" /> {it}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-1 text-sm text-coolgrey">This owner has not completed verification yet.</p>
      )}
      <p className="mt-4 text-xs text-coolgrey">Identity uses the legal route — Aadhaar offline XML / DigiLocker, never direct eKYC.</p>
    </div>
  );
}
