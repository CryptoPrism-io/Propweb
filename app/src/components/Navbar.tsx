import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { List, X, House, CaretRight } from '@phosphor-icons/react';

const MENU = [
  { label: 'Home', to: '/' },
  { label: 'Browse rentals', to: '/' },
  { label: 'How it works', to: '/' },
  { label: 'Trust & verification', to: '/' },
  { label: 'Pricing', to: '/' },
  { label: 'Help & support', to: '/' },
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

  return (
    <header className="absolute inset-x-0 top-0 z-30 bg-transparent">
      <div className="mx-auto grid h-16 max-w-5xl grid-cols-3 items-center px-4">
        {/* left: hamburger */}
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

        {/* center: logo */}
        <div className="flex justify-center">
          <Link to="/" className={`font-display text-xl font-extrabold tracking-wide ${onHero ? 'text-white' : 'text-graphite'}`}>
            PROP<span className={onHero ? 'text-iceblue' : 'text-blueharbor'}>WEB</span>
          </Link>
        </div>

        {/* right: sign in */}
        <div className="flex justify-end">
          <button
            type="button"
            className={`rounded-lg border-[1.5px] px-5 py-2 text-[15px] font-bold ${onHero ? 'border-white/70 text-white' : 'border-blueharbor text-blueharbor'}`}
          >
            Sign in
          </button>
        </div>
      </div>

      {/* slide-in menu drawer */}
      {open && (
        <div className="fixed inset-0 z-50" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-graphite/40" />
          <nav
            aria-label="Main menu"
            onClick={e => e.stopPropagation()}
            className="absolute left-0 top-0 h-full w-72 max-w-[80%] bg-white p-5 shadow-card"
          >
            <div className="mb-6 flex items-center justify-between">
              <span className="font-display text-lg font-extrabold">
                PROP<span className="text-blueharbor">WEB</span>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-coolgrey"
              >
                <X size={20} />
              </button>
            </div>

            <ul className="space-y-1">
              {MENU.map(m => (
                <li key={m.label}>
                  <Link
                    to={m.to}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-graphite hover:bg-moontint"
                  >
                    {m.label}
                    <CaretRight size={14} className="text-coolgrey" />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="my-3 border-t border-line" />
            <Link
              to="/owner/new"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold text-blueharbor hover:bg-moontint"
            >
              <House size={18} /> List your property
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
