import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MagnifyingGlass, Sparkle } from '@phosphor-icons/react';
import { Select } from './Select';
import { useAiThinking } from '../hooks/useAiThinking';
import { LOCALITIES, BHKS, FURNISH, TENANTS, parseAiQuery, parseOwnerAiQuery } from '../lib/searchFilters';

const BHK_OPTS = [{ v: '', l: 'Any BHK' }, ...BHKS.map(b => ({ v: b, l: `${b} BHK` }))];
const tabBase = 'rounded-md px-3.5 py-2 text-xs sm:px-4 sm:text-sm font-bold transition whitespace-nowrap';
const RENT_STEPS = ['Reading your request…', 'Matching verified listings…', 'Found your matches'];
const OWNER_STEPS = ['Reading your request…', 'Scanning nearby tenants…', 'Found your matches'];

type Tab = 'rentals' | 'owners';

type SearchParams = {
  locality?: string;
  bhk?: string;
  maxRent?: string;
  furnishing?: string;
  tenantType?: string;
};

function ThinkingStatus({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line px-4 py-3.5">
      <span className="h-2 w-2 animate-pulse rounded-full bg-blueharbor" />
      <span className="text-sm font-semibold text-graphite">{text}</span>
    </div>
  );
}

export function HeroSearchCard() {
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>('rentals');

  const [aiQuery, setAiQuery] = useState('');
  const [locality, setLocality] = useState(LOCALITIES[0]);
  const [bhk, setBhk] = useState('');
  const [maxRent, setMaxRent] = useState('');
  const [furnishing, setFurnishing] = useState('');
  const [tenantType, setTenantType] = useState('');
  const [ownerQuery, setOwnerQuery] = useState('');

  const goToResults = (params: SearchParams) => {
    const search = new URLSearchParams();
    (Object.entries(params) as [keyof SearchParams, string | undefined][]).forEach(([k, v]) => {
      if (v) search.set(k, v);
    });
    nav(`/results?${search.toString()}`);
  };

  const goToOwnerMatches = (params: { locality?: string; minRent?: string }) => {
    const search = new URLSearchParams();
    if (params.locality) search.set('locality', params.locality);
    if (params.minRent) search.set('minRent', params.minRent);
    nav(`/owner/matches?${search.toString()}`);
  };

  const rentalAi = useAiThinking(RENT_STEPS, () => goToResults(parseAiQuery(aiQuery)));
  const ownerAi = useAiThinking(OWNER_STEPS, () => goToOwnerMatches(parseOwnerAiQuery(ownerQuery)));

  const submitRentalAi = (e: FormEvent) => { e.preventDefault(); rentalAi.start(); };
  const submitOwnerAi = (e: FormEvent) => { e.preventDefault(); ownerAi.start(); };
  const submitManual = (e: FormEvent) => {
    e.preventDefault();
    goToResults({ locality, bhk, maxRent, furnishing, tenantType });
  };

  return (
    <div className="w-full">
      {/* tabs — a separate div sitting above the search card, not sharing its background */}
      <div className="inline-flex gap-1 rounded-md bg-white/20 p-1.5 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => setTab('rentals')}
          className={`${tabBase} ${tab === 'rentals' ? 'bg-white text-blueharbor' : 'text-white/85 hover:text-white'}`}
        >
          Rentals
        </button>
        <button
          type="button"
          onClick={() => setTab('owners')}
          className={`${tabBase} ${tab === 'owners' ? 'bg-white text-blueharbor' : 'text-white/85 hover:text-white'}`}
        >
          Owners
        </button>
        <Link to="/tenant/verify" className={`${tabBase} text-white/85 hover:text-white`}>Tenants</Link>
      </div>

      {/* search card — separate div below the tabs */}
      <div className="mt-2 rounded-lg border border-line bg-white p-4 shadow-card sm:p-5">
      {tab === 'rentals' && (
        <>
          {rentalAi.thinking ? (
            <div className="mt-4"><ThinkingStatus text={rentalAi.currentStep} /></div>
          ) : (
            <form onSubmit={submitRentalAi} className="mt-4 flex items-center gap-3 rounded-2xl border border-line px-4 py-3.5">
              <Sparkle size={20} weight="fill" className="shrink-0 text-blueharbor" />
              <input
                value={aiQuery}
                onChange={e => setAiQuery(e.target.value)}
                placeholder="Try asking for '2BHK in Koramangala, 2 baths, ₹30k/mo'"
                className="flex-1 text-sm font-semibold text-graphite outline-none placeholder:font-medium placeholder:text-coolgrey"
              />
              <button type="submit" className="rounded-full bg-blueharbor px-4 py-2 text-sm font-bold text-white">
                Ask AI
              </button>
            </form>
          )}

          <div className="relative mt-4 text-center">
            <div className="absolute inset-x-0 top-1/2 border-t border-line" />
            <span className="relative bg-white px-3 text-xs font-semibold text-coolgrey">or continue using the filters below</span>
          </div>

          <form onSubmit={submitManual} className="mt-3">
            <div className="flex items-center gap-2">
              <div className="min-w-[160px] flex-1">
                <Select value={locality} onChange={setLocality} options={LOCALITIES.map(l => ({ v: l, l }))} ariaLabel="Location" />
              </div>
              <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-blueharbor px-5 py-2 text-sm font-bold text-white">
                <MagnifyingGlass size={16} weight="bold" /> Search
              </button>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Select variant="pill" value={bhk} onChange={setBhk} options={BHK_OPTS} active={bhk !== ''} ariaLabel="BHK" />
              <input
                value={maxRent}
                onChange={e => setMaxRent(e.target.value)}
                inputMode="numeric"
                placeholder="Max ₹/mo"
                className="w-28 rounded-full border border-line px-3.5 py-1.5 text-sm font-semibold text-graphite outline-none focus:border-blueharbor"
              />
              <Select variant="pill" value={furnishing} onChange={setFurnishing} options={FURNISH} active={furnishing !== ''} ariaLabel="Furnishing" />
              <Select variant="pill" value={tenantType} onChange={setTenantType} options={TENANTS} active={tenantType !== ''} ariaLabel="Tenant type" />
            </div>
          </form>
        </>
      )}

      {tab === 'owners' && (
        <div className="mt-4">
          {ownerAi.thinking ? (
            <ThinkingStatus text={ownerAi.currentStep} />
          ) : (
            <form onSubmit={submitOwnerAi} className="flex items-center gap-3 rounded-2xl border border-line px-4 py-3.5">
              <Sparkle size={20} weight="fill" className="shrink-0 text-blueharbor" />
              <input
                value={ownerQuery}
                onChange={e => setOwnerQuery(e.target.value)}
                placeholder="Try asking for 'Tenants near me willing to pay ₹30k min rent'"
                className="flex-1 text-sm font-semibold text-graphite outline-none placeholder:font-medium placeholder:text-coolgrey"
              />
              <button type="submit" className="rounded-full bg-blueharbor px-4 py-2 text-sm font-bold text-white">
                Ask AI
              </button>
            </form>
          )}
          <Link to="/owner/new" className="mt-3 inline-block text-sm font-semibold text-blueharbor hover:underline">
            or list your property instead →
          </Link>
        </div>
      )}
      </div>
    </div>
  );
}
