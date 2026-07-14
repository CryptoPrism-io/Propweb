import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlass, ShieldCheck, Prohibit, PhoneSlash } from '@phosphor-icons/react';
import { useData } from '../hooks/useData';
import { ListingCard } from '../components/ListingCard';

const LOCALITIES = ['Koramangala', 'HSR Layout', 'Indiranagar', 'Whitefield', 'JP Nagar'];

export default function Home() {
  const { listings, tenant } = useData();
  const nav = useNavigate();
  const [locality, setLocality] = useState('Koramangala');
  const [bhk, setBhk] = useState('2');
  const [maxRent, setMaxRent] = useState('35000');

  const go = () => nav(`/results?locality=${encodeURIComponent(locality)}&bhk=${bhk}&maxRent=${maxRent}`);

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      {/* hero — background image with white title + search bar */}
      <section className="relative overflow-hidden rounded-card">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-graphite/85 via-graphite/45 to-graphite/35" />
        <div className="relative px-6 py-16">
          <h1 style={{ fontFamily: "'Onest', 'Manrope', system-ui, sans-serif", fontStyle: 'normal', fontWeight: 900, fontSize: '36px', lineHeight: '40px', color: '#FFFFFF' }}>
            Rentals you can trust.<br />
            No brokers, no fakes.
          </h1>
          <div className="mt-6 flex items-center gap-2 rounded-full bg-white px-4 py-3 shadow-card">
            <MagnifyingGlass size={20} className="text-coolgrey" />
            <select
              value={locality}
              onChange={e => setLocality(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-graphite outline-none"
            >
              {LOCALITIES.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* filters + search button below the image */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <select value={bhk} onChange={e => setBhk(e.target.value)} className="rounded-lg border border-line bg-white px-3 py-2 text-sm">
          {['1', '2', '3'].map(b => <option key={b} value={b}>{b} BHK</option>)}
        </select>
        <input value={maxRent} onChange={e => setMaxRent(e.target.value)} className="rounded-lg border border-line bg-white px-3 py-2 text-sm" placeholder="Max rent" />
      </div>
      <button onClick={go} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blueharbor px-4 py-2.5 text-sm font-bold text-white">
        <MagnifyingGlass size={18} /> Search
      </button>

      <div className="mt-4 flex flex-wrap gap-4 rounded-[14px] bg-white px-[14px] py-[11px] text-xs font-bold text-graphite border border-line">
        <span className="inline-flex items-center gap-1"><ShieldCheck size={17} className="text-blueharbor" /> Verified owners & tenants</span>
        <span className="inline-flex items-center gap-1"><Prohibit size={17} className="text-blueharbor" /> No fake listings</span>
        <span className="inline-flex items-center gap-1"><PhoneSlash size={17} className="text-blueharbor" /> No spam calls</span>
      </div>

      <h2 className="font-display mt-10 text-lg font-bold">Featured verified rentals</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tenant && listings.slice(0, 3).map(l => (
          <ListingCard key={l.id} listing={l} tenant={tenant} onOpen={id => nav(`/listing/${id}`)} />
        ))}
      </div>
    </div>
  );
}
