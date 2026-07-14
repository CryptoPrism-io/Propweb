import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MagnifyingGlass, ShieldCheck, Prohibit, PhoneSlash, House } from '@phosphor-icons/react';
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
      <div className="flex items-center justify-between">
        <div className="font-display text-xl font-extrabold tracking-wide">PROP<span className="text-blueharbor">WEB</span></div>
        <div className="flex items-center gap-3">
          <Link to="/owner/new" className="inline-flex items-center gap-1 text-sm font-semibold text-blueharbor">
            <House size={16} /> List your property
          </Link>
          <span className="text-sm text-coolgrey">Bengaluru</span>
        </div>
      </div>

      <div className="mt-10 rounded-card bg-white p-6 shadow-card border border-line">
        <h1 className="font-display text-2xl font-extrabold">Rentals you can trust — no brokers, no fakes.</h1>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <select value={locality} onChange={e => setLocality(e.target.value)} className="rounded-lg border border-line px-3 py-2">
            {LOCALITIES.map(l => <option key={l}>{l}</option>)}
          </select>
          <select value={bhk} onChange={e => setBhk(e.target.value)} className="rounded-lg border border-line px-3 py-2">
            {['1', '2', '3'].map(b => <option key={b} value={b}>{b} BHK</option>)}
          </select>
          <input value={maxRent} onChange={e => setMaxRent(e.target.value)} className="rounded-lg border border-line px-3 py-2" placeholder="Max rent" />
          <button onClick={go} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blueharbor px-4 py-2 font-semibold text-white">
            <MagnifyingGlass size={18} /> Search
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 rounded-card bg-moontint p-4 text-sm font-semibold text-graphite border border-line">
        <span className="inline-flex items-center gap-1"><ShieldCheck size={18} /> Verified owners & tenants</span>
        <span className="inline-flex items-center gap-1"><Prohibit size={18} /> No fake listings</span>
        <span className="inline-flex items-center gap-1"><PhoneSlash size={18} /> No spam calls</span>
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
