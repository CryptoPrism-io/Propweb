import { MapPin, Ruler, Bed } from '@phosphor-icons/react';
import type { Listing, Owner, TenantProfile } from '../lib/types';
import { matchScore } from '../lib/matchScore';
import { TrustScoreToken } from './TrustScoreToken';
import { MatchChip } from './MatchChip';
import { VerifiedBadge } from './VerifiedBadge';

export function ListingCard({
  listing, tenant, owner, onOpen,
}: { listing: Listing; tenant: TenantProfile; owner?: Owner; onOpen?: (id: string) => void }) {
  const pct = matchScore(listing, tenant);
  return (
    <div
      onClick={() => onOpen?.(listing.id)}
      className="cursor-pointer rounded-[20px] bg-white p-3 shadow-card"
    >
      {/* photo */}
      <div className="relative overflow-hidden rounded-2xl">
        <img src={listing.photos[0]} alt={listing.title} className="h-44 w-full object-cover" />
        <div className="absolute left-3 top-3"><TrustScoreToken score={listing.trustScore} /></div>
        <div className="absolute right-3 top-3"><MatchChip percent={pct} /></div>
        {listing.photos.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 gap-1.5">
            {listing.photos.slice(0, 5).map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full ${i === 0 ? 'w-4 bg-white' : 'w-1.5 bg-white/60'}`} />
            ))}
          </div>
        )}
      </div>

      {/* content */}
      <div className="px-1 pt-3">
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-extrabold">₹{listing.rent.toLocaleString('en-IN')}</span>
          <span className="text-sm text-coolgrey">/month</span>
        </div>
        <div className="mt-1 font-bold">{listing.bhk}BHK · {listing.locality}</div>
        <div className="mt-0.5 flex items-center gap-1 text-sm text-coolgrey">
          <MapPin size={14} /> {listing.address}
        </div>

        {/* feature chips */}
        <div className="mt-3 flex gap-2">
          <span className="inline-flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm font-semibold">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-line"><Ruler size={14} /></span>
            {listing.areaSqft} sq.ft
          </span>
          <span className="inline-flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm font-semibold">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-line"><Bed size={14} /></span>
            {listing.bhk} BHK
          </span>
        </div>

        {/* owner + verified + posted */}
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm text-coolgrey">By</span>
          <span className="text-sm font-bold">{owner?.name}</span>
          {listing.verifiedOwner && <VerifiedBadge kind="owner" />}
          <span className="ml-auto text-xs text-coolgrey">{listing.postedDaysAgo} days ago</span>
        </div>

        {/* view details (dark, per reference) */}
        <button
          onClick={(e) => { e.stopPropagation(); onOpen?.(listing.id); }}
          className="mt-4 w-full rounded-full bg-graphite py-3 text-sm font-bold text-white"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
