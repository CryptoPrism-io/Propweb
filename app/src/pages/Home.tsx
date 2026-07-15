import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Prohibit, PhoneSlash } from '@phosphor-icons/react';
import { useData } from '../hooks/useData';
import { ListingCard } from '../components/ListingCard';
import { HeroSearchCard } from '../components/HeroSearchCard';

export default function Home() {
  const { listings, owners, tenant } = useData();
  const nav = useNavigate();

  return (
    <div>
      {/* full-bleed hero — image reaches the top of the page, under the transparent navbar */}
      <section className="relative -mt-16 lg:mt-0">
        <div className="absolute inset-0 overflow-hidden rounded-b-2xl lg:rounded-none">
          <img
            src="/hero-concept.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-graphite/45 via-graphite/22 to-graphite/10" />
        </div>
        <div className="relative mx-auto max-w-5xl px-5 pt-24 pb-10 text-center lg:max-w-7xl lg:px-8 lg:pb-24 lg:pt-20">
          <h1
            style={{ fontFamily: "'Onest', 'Manrope', system-ui, sans-serif" }}
            className="text-[36px] font-black leading-[40px] text-white lg:text-[48px] lg:leading-[52px]"
          >
            No Brokers.<br className="lg:hidden" />
            No Fakes.
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm font-semibold text-white/85 lg:mt-3 lg:text-base">
            Verified listings only. Direct from owners.
          </p>
          <div className="mx-auto mt-6 max-w-3xl lg:mt-8">
            <HeroSearchCard />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-5 py-8">
        <div className="flex flex-nowrap items-center justify-between rounded-[14px] border border-line bg-gradient-to-r from-moontint via-white to-moontint px-[14px] py-[11px]">
          {/* mobile — unchanged simple inline row, no description */}
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-graphite lg:hidden"><ShieldCheck size={17} weight="fill" className="text-blueharbor" /> Verified only</span>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-graphite lg:hidden"><Prohibit size={17} weight="fill" className="text-blueharbor" /> No fakes</span>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-graphite lg:hidden"><PhoneSlash size={17} weight="fill" className="text-blueharbor" /> No spam calls</span>

          {/* desktop — icon sits level with the title, description below */}
          <div className="hidden flex-col lg:flex">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={17} weight="fill" className="shrink-0 text-blueharbor" />
              <span className="text-xs font-bold text-graphite">Verified only</span>
            </div>
            <div className="mt-0.5 text-[10px] font-medium text-coolgrey">Every listing is checked and verified before it goes live</div>
          </div>
          <div className="hidden flex-col lg:flex">
            <div className="flex items-center gap-1.5">
              <Prohibit size={17} weight="fill" className="shrink-0 text-blueharbor" />
              <span className="text-xs font-bold text-graphite">No fakes</span>
            </div>
            <div className="mt-0.5 text-[10px] font-medium text-coolgrey">No stock photos or fake listings, ever</div>
          </div>
          <div className="hidden flex-col lg:flex">
            <div className="flex items-center gap-1.5">
              <PhoneSlash size={17} weight="fill" className="shrink-0 text-blueharbor" />
              <span className="text-xs font-bold text-graphite">No spam calls</span>
            </div>
            <div className="mt-0.5 text-[10px] font-medium text-coolgrey">Your number stays masked until you connect</div>
          </div>
        </div>

        <h2 className="font-display mt-10 text-lg font-bold">Featured verified rentals</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tenant && listings.slice(0, 3).map(l => (
            <ListingCard key={l.id} listing={l} tenant={tenant} owner={owners.find(o => o.id === l.ownerId)} onOpen={id => nav(`/listing/${id}`)} />
          ))}
        </div>
      </div>
    </div>
  );
}
