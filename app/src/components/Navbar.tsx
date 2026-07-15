import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { List, X, House, CaretRight, MagnifyingGlass, Info, ShieldCheck, Tag, Question, SealCheck } from '@phosphor-icons/react';

const MENU = [
  { label: 'Home', to: '/', icon: House },
  { label: 'Browse rentals', to: '/', icon: MagnifyingGlass },
  { label: 'Get Verified Tenant badge', to: '/tenant/verify', icon: SealCheck },
  { label: 'How it works', to: '/', icon: Info },
  { label: 'Trust & verification', to: '/', icon: ShieldCheck },
  { label: 'Pricing', to: '/', icon: Tag },
  { label: 'Help & support', to: '/', icon: Question },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const onHero = useLocation().pathname === '/';

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const DESKTOP_LINKS = [
    { label: 'Browse rentals', to: '/' },
    { label: 'How it works', to: '/' },
    { label: 'Trust & verification', to: '/' },
    { label: 'Pricing', to: '/' },
  ];

  return (
    <header className="relative z-30">
      {/* mobile bar — absolute overlay on the hero, unchanged behavior below lg */}
      <div className="absolute inset-x-0 top-0 bg-transparent lg:hidden">
        <div className="mx-auto grid h-16 max-w-5xl grid-cols-3 items-center px-4">
          <div className="flex justify-start">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border ${onHero ? 'border-white/50 text-white' : 'border-line text-graphite'}`}
            >
              <List size={20} />
            </button>
          </div>

          <div className="flex justify-center">
            <Link to="/" className={`font-display text-xl font-extrabold tracking-wide ${onHero ? 'text-white' : 'text-graphite'}`}>
              PROP<span className={onHero ? 'text-iceblue' : 'text-blueharbor'}>WEB</span>
            </Link>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className={`rounded-lg border-[1.5px] px-5 py-2 text-[15px] font-bold ${onHero ? 'border-white/70 text-white' : 'border-blueharbor text-blueharbor'}`}
            >
              Sign in
            </button>
          </div>
        </div>
      </div>

      {/* desktop bar — solid, in normal document flow, separated from the hero below it */}
      <div className="hidden border-b border-line bg-white lg:block">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-8">
          <div className="flex items-center gap-10">
            <Link to="/" className="font-display text-xl font-extrabold tracking-wide text-graphite">
              PROP<span className="text-blueharbor">WEB</span>
            </Link>
            <nav className="flex items-center gap-8">
              {DESKTOP_LINKS.map(l => (
                <Link key={l.label} to={l.to} className="text-sm font-semibold text-graphite transition hover:text-blueharbor">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-graphite"
            >
              <List size={20} />
            </button>
            <button
              type="button"
              className="rounded-lg border-[1.5px] border-blueharbor px-5 py-2 text-[15px] font-bold text-blueharbor"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>

      {/* slide-in menu drawer — shared by both bars */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <div className="absolute inset-0 bg-graphite/40" />
            <motion.nav
              aria-label="Main menu"
              onClick={e => e.stopPropagation()}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="absolute left-0 top-0 flex h-full w-80 max-w-[85%] flex-col bg-white p-5 shadow-card"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-extrabold">
                  PROP<span className="text-blueharbor">WEB</span>
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-coolgrey hover:bg-moontint"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="mt-1 text-xs font-semibold text-coolgrey">Trust-first rentals in Bengaluru</p>

              <ul className="mt-6 space-y-1">
                {MENU.map(m => {
                  const Icon = m.icon;
                  return (
                    <li key={m.label}>
                      <Link
                        to={m.to}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm font-semibold text-graphite hover:bg-moontint"
                      >
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-moontint text-blueharbor">
                          <Icon size={18} />
                        </span>
                        {m.label}
                        <CaretRight size={14} className="ml-auto text-coolgrey" />
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-auto pt-4">
                <Link
                  to="/owner/new"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blueharbor to-[#5B93E6] px-4 py-3 text-sm font-bold text-white shadow-card"
                >
                  <House size={18} /> List your property
                </Link>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
