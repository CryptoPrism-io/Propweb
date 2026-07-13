import { MapPin, Bed, Ruler, Armchair } from '@phosphor-icons/react';
import type { Listing, TenantProfile } from '../lib/types';
import { matchScore } from '../lib/matchScore';
import { TrustScoreToken } from './TrustScoreToken';
import { MatchChip } from './MatchChip';
import { VerifiedBadge } from './VerifiedBadge';
import { Button } from './Button';

const FURNISH_LABEL: Record<Listing['furnishing'], string> = {
  unfurnished: 'Unfurnished', semi: 'Semi-furnished', furnished: 'Furnished',
};

export function ListingCard({
  listing, tenant, onOpen,
}: { listing: Listing; tenant: TenantProfile; onOpen?: (id: string) => void }) {
  const pct = matchScore(listing, tenant);
  return (
    <div
      onClick={() => onOpen?.(listing.id)}
      className="cursor-pointer overflow-hidden rounded-card bg-white shadow-card border border-line"
    >
      <div className="relative">
        <img src={listing.photos[0]} alt={listing.title} className="h-44 w-full object-cover" />
        <div className="absolute left-3 top-3"><TrustScoreToken score={listing.trustScore} /></div>
        <div className="absolute right-3 top-3"><MatchChip percent={pct} /></div>
      </div>
      <div className="p-4">
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold">₹{listing.rent.toLocaleString('en-IN')}</span>
          <span className="text-sm text-coolgrey">/mo</span>
        </div>
        <div className="mt-0.5 font-semibold">{listing.bhk}BHK · {listing.locality}</div>
        <div className="mt-0.5 flex items-center gap-1 text-sm text-coolgrey">
          <MapPin size={14} /> {listing.address}
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-coolgrey">
          <span className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-1"><Ruler size={14} /> {listing.areaSqft} sq.ft</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-1"><Bed size={14} /> {listing.bhk} BHK</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-1"><Armchair size={14} /> {FURNISH_LABEL[listing.furnishing]}</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          {listing.verifiedOwner ? <VerifiedBadge kind="owner" /> : <span className="text-xs text-coolgrey">Unverified</span>}
          <span className="text-xs text-coolgrey">{listing.postedDaysAgo} days ago</span>
        </div>
        <Button className="mt-4 w-full" onClick={() => onOpen?.(listing.id)}>View Details</Button>
      </div>
    </div>
  );
}
