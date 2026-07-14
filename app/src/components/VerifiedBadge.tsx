import { SealCheck } from '@phosphor-icons/react';

export function VerifiedBadge({
  kind, pending = false,
}: { kind: 'owner' | 'tenant'; pending?: boolean }) {
  const label = kind === 'owner' ? 'Verified Owner' : 'Verified Tenant';
  if (pending) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border-[1.5px] border-amber px-[11px] py-[5px] text-xs font-bold text-amber">
        <SealCheck size={16} weight="fill" /> Verification pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-limeglow px-[11px] py-[5px] text-xs font-bold text-graphite">
      <SealCheck size={16} weight="fill" /> {label}
    </span>
  );
}
