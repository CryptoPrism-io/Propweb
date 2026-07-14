import { ShieldCheck } from '@phosphor-icons/react';
import { trustColor } from '../lib/trustScore';

const FACTORS = [
  { label: 'Identity & ownership verified', weight: 'High' },
  { label: 'Owner response rate', weight: 'High' },
  { label: 'Listing freshness', weight: 'Medium' },
  { label: 'Tenant reviews', weight: 'Medium' },
];

export function TrustScoreExplainer({ score }: { score: number }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-full font-display text-lg font-extrabold"
          style={{ backgroundColor: trustColor(score), color: score < 50 ? '#FFFFFF' : '#1B1E23' }}>
          {score}
        </span>
        <div>
          <h3 className="font-display text-lg font-extrabold">Trust Score</h3>
          <p className="text-xs text-coolgrey">How much this listing can be trusted, out of 100.</p>
        </div>
      </div>
      <ul className="mt-4 space-y-2">
        {FACTORS.map(f => (
          <li key={f.label} className="flex items-center justify-between text-sm">
            <span className="inline-flex items-center gap-2"><ShieldCheck size={16} className="text-blueharbor" /> {f.label}</span>
            <span className="text-xs font-semibold text-coolgrey">{f.weight}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-coolgrey">Existing portals sell leads. PropWeb scores trust — this is the moat.</p>
    </div>
  );
}
