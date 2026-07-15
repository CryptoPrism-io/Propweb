import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { UsersThree } from '@phosphor-icons/react';
import { loadTenants } from '../lib/data';
import { tenantMatchScore } from '../lib/matchScore';
import { MatchChip } from '../components/MatchChip';
import type { TenantProfile } from '../lib/types';

export default function OwnerMatches() {
  const [params] = useSearchParams();
  const [tenants, setTenants] = useState<TenantProfile[]>([]);
  const locality = params.get('locality') || undefined;
  const minRent = params.get('minRent') ? Number(params.get('minRent')) : undefined;

  useEffect(() => { loadTenants().then(setTenants); }, []);

  const ranked = useMemo(
    () => tenants
      .map(t => ({ tenant: t, score: tenantMatchScore(t, { locality, minRent }) }))
      .sort((a, b) => b.score - a.score),
    [tenants, locality, minRent],
  );

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 lg:max-w-7xl lg:px-8">
      <h1 className="font-display text-lg font-bold">
        Tenants {locality ? `near ${locality}` : 'near you'}
      </h1>
      <p className="mt-1 text-sm font-semibold text-coolgrey">
        {ranked.length} tenant{ranked.length === 1 ? '' : 's'} found
        {minRent ? ` · willing to pay ₹${minRent.toLocaleString('en-IN')}+` : ''}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ranked.map(({ tenant, score }) => (
          <div key={tenant.id} className="rounded-card border border-line bg-white p-4 shadow-card">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-moontint text-blueharbor">
                  <UsersThree size={20} weight="fill" />
                </span>
                <span className="font-display text-[15px] font-bold text-graphite">{tenant.name}</span>
              </div>
              <MatchChip percent={score} />
            </div>
            <p className="mt-3 text-sm font-semibold text-graphite">
              ₹{tenant.budgetMin.toLocaleString('en-IN')} – ₹{tenant.budgetMax.toLocaleString('en-IN')}/mo
            </p>
            <p className="mt-1 text-xs font-semibold text-coolgrey">
              {tenant.preferredLocalities.join(', ')} · {tenant.tenantType} · {tenant.furnishing}
            </p>
          </div>
        ))}
      </div>

      <Link to="/" className="mt-8 inline-block text-sm font-bold text-blueharbor hover:underline">
        ← Back to home
      </Link>
    </div>
  );
}
