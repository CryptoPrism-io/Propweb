import { useState, useRef } from 'react';
import { Ruler, Bed, Armchair, CaretLeft, CaretRight } from '@phosphor-icons/react';
import type { Listing, Owner, TenantProfile } from '../lib/types';
import { matchScore } from '../lib/matchScore';
import { TrustScoreToken } from './TrustScoreToken';
import { MatchChip } from './MatchChip';
import { VerifiedBadge } from './VerifiedBadge';

const FURNISH_LABEL: Record<Listing['furnishing'], string> = {
  unfurnished: 'Unfurnished', semi: 'Semi-furnished', furnished: 'Furnished',
};

export function ListingCard({
  listing, tenant, owner, onOpen,
}: { listing: Listing; tenant: TenantProfile; owner?: Owner; onOpen?: (id: string) => void }) {
  const pct = matchScore(listing, tenant);
  const photos = listing.photos;
  const [active, setActive] = useState(0);
  const step = (e: React.MouseEvent, dir: number) => {
    e.stopPropagation();
    setActive(a => (a + dir + photos.length) % photos.length);
  };
  // swipe (mobile)
  const startX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { startX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (startX.current === null || photos.length < 2) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(dx) > 40) setActive(a => (a + (dx < 0 ? 1 : -1) + photos.length) % photos.length);
    startX.current = null;
  };

  return (
    <div
      onClick={() => onOpen?.(listing.id)}
      className="cursor-pointer rounded-[20px] bg-white p-3 shadow-card"
    >
      {/* photo carousel */}
      <div className="relative overflow-hidden rounded-2xl" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <img src={photos[active]} alt={listing.title} className="h-44 w-full object-cover" />
        <div className="absolute left-3 top-3"><TrustScoreToken score={listing.trustScore} /></div>
        <div className="absolute right-3 top-3"><MatchChip percent={pct} /></div>

        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={e => step(e, -1)}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white ring-1 ring-white/30 backdrop-blur-md lg:flex"
            >
              <CaretLeft size={15} weight="bold" />
            </button>
            <button
              type="button"
              onClick={e => step(e, 1)}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white ring-1 ring-white/30 backdrop-blur-md lg:flex"
            >
              <CaretRight size={15} weight="bold" />
            </button>

            <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-white/20 px-2 py-1 ring-1 ring-white/25 backdrop-blur-md">
              {photos.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${i === active ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* content */}
      <div className="px-1 pt-3">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-extrabold">₹{listing.rent.toLocaleString('en-IN')}</span>
          <span className="text-sm text-coolgrey">/month</span>
        </div>
        <div className="mt-1 font-bold">{listing.bhk}BHK · {listing.locality}</div>
        <div className="mt-0.5 text-sm text-coolgrey">{listing.address}</div>

        {/* features — flat, pipe-separated, monotone icons */}
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-semibold text-graphite">
          <span className="inline-flex items-center gap-1"><Ruler size={15} className="text-coolgrey" /> {listing.areaSqft} sq.ft</span>
          <span className="text-line">|</span>
          <span className="inline-flex items-center gap-1"><Bed size={15} className="text-coolgrey" /> {listing.bhk} BHK</span>
          <span className="text-line">|</span>
          <span className="inline-flex items-center gap-1"><Armchair size={15} className="text-coolgrey" /> {FURNISH_LABEL[listing.furnishing]}</span>
        </div>

        {/* owner + verified + posted */}
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm text-coolgrey">By</span>
          <span className="text-sm font-bold">{owner?.name}</span>
          {listing.verifiedOwner && <VerifiedBadge kind="owner" />}
          <span className="ml-auto text-xs text-coolgrey">{listing.postedDaysAgo} days ago</span>
        </div>

        {/* view details — vertical gradient, brand palette */}
        <button
          onClick={(e) => { e.stopPropagation(); onOpen?.(listing.id); }}
          className="mt-4 w-full rounded-full bg-gradient-to-b from-[#5B93E6] to-blueharbor py-3 text-sm font-bold text-white"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
