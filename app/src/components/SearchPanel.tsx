import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, MagnifyingGlass, CaretDown } from '@phosphor-icons/react';

const LOCALITIES = ['Koramangala', 'HSR Layout', 'Indiranagar', 'Whitefield', 'JP Nagar'];
const BHKS = ['1', '2', '3', '3+'];
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
  `rounded-full border px-4 py-2 text-sm font-semibold transition ${active ? 'border-blueharbor bg-blueharbor text-white' : 'border-line bg-white text-graphite'}`;

type Initial = { locality?: string; bhk?: string; maxRent?: string; furnishing?: string; tenantType?: string };

export function SearchPanel({ onClose, initial }: { onClose: () => void; initial?: Initial }) {
  const nav = useNavigate();
  const [locality, setLocality] = useState(initial?.locality ?? 'Koramangala');
  const [bhk, setBhk] = useState(initial?.bhk ?? '2');
  const [maxRent, setMaxRent] = useState(initial?.maxRent ?? '35000');
  const [furnishing, setFurnishing] = useState(initial?.furnishing ?? '');
  const [tenantType, setTenantType] = useState(initial?.tenantType ?? '');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const search = () => {
    const params = new URLSearchParams({ locality, bhk, maxRent });
    if (furnishing) params.set('furnishing', furnishing);
    if (tenantType) params.set('tenantType', tenantType);
    onClose();
    nav(`/results?${params.toString()}`);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex flex-col bg-moontint"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      {/* the morphing search bar — same element the hero shows */}
      <div className="px-5 pt-4">
        <motion.div layoutId="searchbar" className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 shadow-card">
          <MagnifyingGlass size={22} className="text-coolgrey" />
          <span className="flex-1 text-sm font-semibold text-graphite">{locality}</span>
          <button type="button" onClick={onClose} aria-label="Close search" className="text-coolgrey">
            <X size={20} />
          </button>
        </motion.div>
      </div>

      {/* filters fade in below the bar */}
      <motion.div
        className="flex-1 space-y-6 overflow-y-auto px-5 py-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.2 }}
      >
        <div>
          <label className="mb-2 block text-sm font-bold">Location</label>
          <div className="relative">
            <select
              value={locality}
              onChange={e => setLocality(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-line bg-white px-4 py-3.5 text-sm font-semibold text-graphite outline-none focus:border-blueharbor"
            >
              {LOCALITIES.map(l => <option key={l}>{l}</option>)}
            </select>
            <CaretDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-coolgrey" />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold">BHK</label>
          <div className="flex gap-2">
            {BHKS.map(b => (
              <button
                key={b}
                onClick={() => setBhk(b)}
                className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${bhk === b ? 'border-blueharbor bg-blueharbor text-white' : 'border-line bg-white text-graphite'}`}
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
            className="w-full rounded-2xl border border-line bg-white px-4 py-3.5 text-sm outline-none focus:border-blueharbor"
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
      </motion.div>

      <div className="border-t border-line bg-white px-5 py-4">
        <button
          onClick={search}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blueharbor to-[#5B93E6] px-4 py-3.5 text-base font-bold text-white shadow-card"
        >
          <MagnifyingGlass size={20} /> Search
        </button>
      </div>
    </motion.div>
  );
}
