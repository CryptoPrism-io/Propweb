import { trustColor, trustTextColor } from '../lib/trustScore';
import { ShieldCheck } from '@phosphor-icons/react';

// Display style (ring vs number) is deferred; number pill for now.
export function TrustScoreToken({ score }: { score: number }) {
  return (
    <span
      className="inline-flex h-[26px] items-center gap-1 rounded-full px-[10px] text-[13px] font-extrabold"
      style={{ backgroundColor: trustColor(score), color: trustTextColor(score) }}
      title="Trust Score"
    >
      <ShieldCheck size={14} weight="fill" /> {score}
    </span>
  );
}
