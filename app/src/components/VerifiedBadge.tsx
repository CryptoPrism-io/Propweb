import { SealCheck } from '@phosphor-icons/react';

export function VerifiedBadge({
  kind, pending = false,
}: { kind: 'owner' | 'tenant'; pending?: boolean }) {
  const label = kind === 'owner' ? 'Verified Owner' : 'Verified Tenant';
  if (pending) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber px-2.5 py-1 text-xs font-semibold text-amber">
        <SealCheck size={16} weight="fill" /> Verification pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-limeglow px-2.5 py-1 text-xs font-semibold text-graphite">
      <SealCheck size={16} weight="fill" color="#1B1E23" /> {label}
    </span>
  );
}
