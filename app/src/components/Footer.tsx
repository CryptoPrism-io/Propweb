import { Link } from 'react-router-dom';

const COLS = [
  { title: 'Company', links: ['About', 'How it works', 'Pricing', 'Careers'] },
  { title: 'Support', links: ['Help center', 'Contact us', 'Trust & safety'] },
  { title: 'Legal', links: ['Terms', 'Privacy', 'DPDP compliance'] },
];

export function Footer() {
  return (
    <footer className="mt-10 bg-graphite text-white">
      <div className="mx-auto max-w-5xl px-5 py-10">
        <div className="grid gap-8 sm:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="font-display text-xl font-extrabold tracking-wide">
              PROP<span className="text-iceblue">WEB</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-white/60">
              India's trust-first rental platform. Verified owners meet verified tenants — no brokers, no fakes, no spam calls.
            </p>
            <Link
              to="/owner/new"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blueharbor to-[#5B93E6] px-4 py-2 text-sm font-bold text-white"
            >
              List your property
            </Link>
          </div>

          {COLS.map(c => (
            <div key={c.title}>
              <h4 className="text-sm font-bold">{c.title}</h4>
              <ul className="mt-3 space-y-2.5">
                {c.links.map(l => (
                  <li key={l}>
                    <a href="#" className="text-sm text-white/60 transition hover:text-white">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/15 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 PropWeb. All rights reserved.</span>
          <span>Made in Bengaluru · KYC data stays in India (DPDP)</span>
        </div>
      </div>
    </footer>
  );
}
