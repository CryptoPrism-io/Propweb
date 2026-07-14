import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MagnifyingGlass, ShieldCheck, Prohibit, PhoneSlash } from '@phosphor-icons/react';
import { useData } from '../hooks/useData';
import { ListingCard } from '../components/ListingCard';
import { SearchPanel } from '../components/SearchPanel';

export default function Home() {
  const { listings, tenant } = useData();
  const nav = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div>
      {/* full-bleed hero — image reaches the top of the page, under the transparent navbar */}
      <section className="relative -mt-16 overflow-hidden rounded-b-2xl">
        <img
          src="/Hero%20Image.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-graphite/70 via-graphite/40 to-graphite/25" />
        <div className="relative mx-auto max-w-5xl px-5 pt-24 pb-10 text-center">
          <h1 style={{ fontFamily: "'Onest', 'Manrope', system-ui, sans-serif", fontStyle: 'normal', fontWeight: 900, fontSize: '36px', lineHeight: '40px', color: '#FFFFFF' }}>
            No Brokers.<br />
            No Fakes.
          </h1>
          {!searchOpen && (
            <motion.button
              layoutId="searchbar"
              onClick={() => setSearchOpen(true)}
              className="mx-auto mt-6 flex w-full max-w-md items-center gap-3 rounded-2xl bg-white px-4 py-4 text-left shadow-card"
            >
              <MagnifyingGlass size={22} className="text-coolgrey" />
              <span className="text-sm font-semibold text-coolgrey">Search location, budget, filters…</span>
            </motion.button>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-5 py-8">
        <div className="flex flex-nowrap items-center justify-between rounded-[14px] border border-line bg-white px-[14px] py-[11px]">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-graphite"><ShieldCheck size={17} weight="fill" className="text-blueharbor" /> Verified only</span>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-graphite"><Prohibit size={17} weight="fill" className="text-blueharbor" /> No fakes</span>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-graphite"><PhoneSlash size={17} weight="fill" className="text-blueharbor" /> No spam calls</span>
        </div>

        <h2 className="font-display mt-10 text-lg font-bold">Featured verified rentals</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tenant && listings.slice(0, 3).map(l => (
            <ListingCard key={l.id} listing={l} tenant={tenant} onOpen={id => nav(`/listing/${id}`)} />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {searchOpen && <SearchPanel key="searchpanel" onClose={() => setSearchOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
