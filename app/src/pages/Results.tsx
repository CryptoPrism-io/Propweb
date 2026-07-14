import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Rows, MapTrifold, MagnifyingGlass, CaretDown } from '@phosphor-icons/react';
import { useData } from '../hooks/useData';
import { filterListings } from '../lib/filter';
import { ListingCard } from '../components/ListingCard';
import { MapView } from '../components/MapView';
import { SearchPanel } from '../components/SearchPanel';

const BHK_OPTS = [{ v: '', l: 'Any BHK' }, { v: '1', l: '1 BHK' }, { v: '2', l: '2 BHK' }, { v: '3', l: '3 BHK' }, { v: '3+', l: '3+ BHK' }];
const BUDGET_OPTS = [{ v: '', l: 'Any budget' }, { v: '20000', l: '≤ ₹20k' }, { v: '35000', l: '≤ ₹35k' }, { v: '50000', l: '≤ ₹50k' }, { v: '85000', l: '≤ ₹85k' }];
const FURN_OPTS = [{ v: '', l: 'Any furnishing' }, { v: 'unfurnished', l: 'Unfurnished' }, { v: 'semi', l: 'Semi' }, { v: 'furnished', l: 'Furnished' }];
const TEN_OPTS = [{ v: '', l: 'Any tenant' }, { v: 'family', l: 'Family' }, { v: 'bachelor', l: 'Bachelor' }];

function ChipSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none rounded-full border border-line bg-white py-1.5 pl-3 pr-8 text-sm font-semibold text-graphite outline-none"
      >
        {options.map(o => <option key={o.l} value={o.v}>{o.l}</option>)}
      </select>
      <CaretDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-coolgrey" />
    </div>
  );
}

export default function Results() {
  const { listings, owners, tenant } = useData();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [showMapMobile, setShowMapMobile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const locality = params.get('locality') || undefined;
  const bhkParam = params.get('bhk') || undefined;
  const bhk = bhkParam && bhkParam !== '3+' ? Number(bhkParam) : undefined;
  const minBhk = bhkParam === '3+' ? 3 : undefined;
  const maxRent = params.get('maxRent') ? Number(params.get('maxRent')) : undefined;
  const furnishing = params.get('furnishing') || undefined;
  const tenantType = params.get('tenantType') || undefined;

  const results = useMemo(
    () => filterListings(listings, { locality, bhk, minBhk, maxRent, furnishing, tenantType }),
    [listings, locality, bhk, minBhk, maxRent, furnishing, tenantType],
  );

  const setParam = (key: string, value: string) => {
    const p = new URLSearchParams(params);
    if (value) p.set(key, value); else p.delete(key);
    nav(`/results?${p.toString()}`);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* editable search + active filters */}
      <button
        onClick={() => setSearchOpen(true)}
        className="flex w-full items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 shadow-card"
      >
        <MagnifyingGlass size={20} className="text-coolgrey" />
        <span className="flex-1 text-left text-sm font-semibold text-graphite">{locality ?? 'All Bengaluru'}</span>
        <span className="text-sm font-bold text-blueharbor">Edit</span>
      </button>
      <div className="mt-3 flex flex-wrap gap-2">
        <ChipSelect value={bhkParam ?? ''} onChange={v => setParam('bhk', v)} options={BHK_OPTS} />
        <ChipSelect value={maxRent ? String(maxRent) : ''} onChange={v => setParam('maxRent', v)} options={BUDGET_OPTS} />
        <ChipSelect value={furnishing ?? ''} onChange={v => setParam('furnishing', v)} options={FURN_OPTS} />
        <ChipSelect value={tenantType ?? ''} onChange={v => setParam('tenantType', v)} options={TEN_OPTS} />
      </div>

      <div className="mb-4 mt-5 flex items-center justify-between">
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
                <ListingCard key={l.id} listing={l} tenant={tenant} owner={owners.find(o => o.id === l.ownerId)} onOpen={id => nav(`/listing/${id}`)} />
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

      <AnimatePresence>
        {searchOpen && (
          <SearchPanel
            key="results-search"
            onClose={() => setSearchOpen(false)}
            initial={{ locality, bhk: bhkParam, maxRent: maxRent ? String(maxRent) : undefined, furnishing, tenantType }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
