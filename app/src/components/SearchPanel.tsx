import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MagnifyingGlass, MapPin } from '@phosphor-icons/react';

const LOCALITIES = ['Koramangala', 'HSR Layout', 'Indiranagar', 'Whitefield', 'JP Nagar'];
const BHKS = ['1', '2', '3'];
const FURNISH = [
  { v: '', l: 'Any' },
  { v: 'unfurnished', l: 'Unfurnished' },
  { v: 'semi', l: 'Semi' },
  { v: 'furnished', l: 'Furnished' },
];
const TENANTS = [
  { v: '', l: 'Any' },
  { v: 'family', l: 'Family' },
  { v: 'bachelor', l: 'Bachelor' },
];

const chip = (active: boolean) =>
  `rounded-full border px-4 py-2 text-sm font-semibold ${active ? 'border-blueharbor bg-blueharbor text-white' : 'border-line bg-white text-graphite'}`;

export function SearchPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const nav = useNavigate();
  const [locality, setLocality] = useState('Koramangala');
  const [bhk, setBhk] = useState('2');
  const [maxRent, setMaxRent] = useState('35000');
  const [furnishing, setFurnishing] = useState('');
  const [tenantType, setTenantType] = useState('');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const search = () => {
    const params = new URLSearchParams({ locality, bhk, maxRent });
    if (furnishing) params.set('furnishing', furnishing);
    if (tenantType) params.set('tenantType', tenantType);
    onClose();
    nav(`/results?${params.toString()}`);
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-moontint">
      <header className="flex items-center justify-between border-b border-line bg-white px-5 py-4">
        <h2 className="font-display text-lg font-extrabold">Search rentals</h2>
        <button onClick={onClose} aria-label="Close search" className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-coolgrey">
          <X size={22} />
        </button>
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-6">
        <div>
          <label className="mb-2 block text-sm font-bold">Location</label>
          <div className="flex items-center gap-2 rounded-2xl border border-line bg-white px-4 py-3.5">
            <MapPin size={18} className="text-coolgrey" />
            <select value={locality} onChange={e => setLocality(e.target.value)} className="w-full bg-transparent text-sm font-semibold text-graphite outline-none">
              {LOCALITIES.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold">BHK</label>
          <div className="flex gap-2">
            {BHKS.map(b => (
              <button
                key={b}
                onClick={() => setBhk(b)}
                className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold ${bhk === b ? 'border-blueharbor bg-blueharbor text-white' : 'border-line bg-white text-graphite'}`}
              >
                {b} BHK
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold">Max budget (₹/mo)</label>
          <input
            value={maxRent}
            onChange={e => setMaxRent(e.target.value)}
            inputMode="numeric"
            className="w-full rounded-2xl border border-line bg-white px-4 py-3.5 text-sm"
            placeholder="35000"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold">Furnishing</label>
          <div className="flex flex-wrap gap-2">
            {FURNISH.map(f => (
              <button key={f.l} onClick={() => setFurnishing(f.v)} className={chip(furnishing === f.v)}>{f.l}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold">Tenant type</label>
          <div className="flex flex-wrap gap-2">
            {TENANTS.map(t => (
              <button key={t.l} onClick={() => setTenantType(t.v)} className={chip(tenantType === t.v)}>{t.l}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-line bg-white px-5 py-4">
        <button
          onClick={search}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blueharbor to-[#5B93E6] px-4 py-3.5 text-base font-bold text-white shadow-card"
        >
          <MagnifyingGlass size={20} /> Search
        </button>
      </div>
    </div>
  );
}
