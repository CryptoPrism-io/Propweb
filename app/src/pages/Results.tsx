import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Rows, MapTrifold } from '@phosphor-icons/react';
import { useData } from '../hooks/useData';
import { filterListings } from '../lib/filter';
import { ListingCard } from '../components/ListingCard';
import { MapView } from '../components/MapView';

export default function Results() {
  const { listings, tenant } = useData();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [showMapMobile, setShowMapMobile] = useState(false);

  const locality = params.get('locality') || undefined;
  const bhk = params.get('bhk') ? Number(params.get('bhk')) : undefined;
  const maxRent = params.get('maxRent') ? Number(params.get('maxRent')) : undefined;
  const furnishing = params.get('furnishing') || undefined;
  const tenantType = params.get('tenantType') || undefined;

  const results = useMemo(
    () => filterListings(listings, { locality, bhk, maxRent, furnishing, tenantType }),
    [listings, locality, bhk, maxRent, furnishing, tenantType],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">{results.length} rentals{locality ? ` in ${locality}` : ''}</h1>
        <button onClick={() => setShowMapMobile(v => !v)} className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-sm font-semibold lg:hidden">
          {showMapMobile ? <><Rows size={16} /> List</> : <><MapTrifold size={16} /> Map</>}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className={`${showMapMobile ? 'hidden' : 'block'} lg:block`}>
          {results.length === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-card border border-line bg-white text-center text-coolgrey">
              No matches — try adjusting your filters.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {tenant && results.map(l => (
                <ListingCard key={l.id} listing={l} tenant={tenant} onOpen={id => nav(`/listing/${id}`)} />
              ))}
            </div>
          )}
        </div>
        <div className={`${showMapMobile ? 'block' : 'hidden'} lg:block`}>
          <div className="sticky top-6 h-[70vh] overflow-hidden rounded-card border border-line">
            <MapView listings={results} onPin={id => nav(`/listing/${id}`)} />
          </div>
        </div>
      </div>
    </div>
  );
}
