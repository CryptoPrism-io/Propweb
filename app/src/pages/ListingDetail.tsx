import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, Phone, WhatsappLogo, CheckCircle } from '@phosphor-icons/react';
import { useData } from '../hooks/useData';
import { getOwner } from '../lib/data';
import { matchScore } from '../lib/matchScore';
import { TrustScoreToken } from '../components/TrustScoreToken';
import { MatchChip } from '../components/MatchChip';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { Button } from '../components/Button';
import { TrustScoreExplainer } from '../components/TrustScoreExplainer';
import { VerifiedInfo } from '../components/VerifiedInfo';

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(-10);
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}

export default function ListingDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { listings, owners, tenant, loading } = useData();
  const [showConnect, setShowConnect] = useState(false);
  const [connected, setConnected] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [explainer, setExplainer] = useState<'trust' | 'verified' | null>(null);

  useEffect(() => {
    if (!showConnect && !explainer) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowConnect(false);
        setExplainer(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showConnect, explainer]);

  if (loading) return <div className="p-8 text-coolgrey">Loading…</div>;
  const listing = listings.find(l => l.id === id);
  if (!listing || !tenant) return <div className="p-8">Listing not found.</div>;
  const owner = getOwner(owners, listing.ownerId);
  const waNumber = owner ? owner.phone.replace(/\D/g, '') : '';

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <button onClick={() => nav(-1)} className="mb-4 inline-flex items-center gap-1 text-sm text-blueharbor"><ArrowLeft size={16} /> Back</button>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div>
          <img src={listing.photos[activePhoto]} alt={listing.title} className="h-72 w-full rounded-card object-cover" />
          {listing.photos.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {listing.photos.map((photo, i) => (
                <img
                  key={i}
                  src={photo}
                  alt={`${listing.title} photo ${i + 1}`}
                  onClick={() => setActivePhoto(i)}
                  className={`h-16 w-20 object-cover rounded-lg cursor-pointer ${i === activePhoto ? 'ring-2 ring-blueharbor' : 'border border-line opacity-70'}`}
                />
              ))}
            </div>
          )}
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold">₹{listing.rent.toLocaleString('en-IN')}</span>
            <span className="text-coolgrey">/mo</span>
          </div>
          <div className="font-semibold">{listing.bhk}BHK · {listing.locality}</div>
          <div className="flex items-center gap-1 text-sm text-coolgrey"><MapPin size={14} /> {listing.address}</div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => setExplainer('trust')} aria-label="Explain Trust Score" className="appearance-none bg-transparent border-0 p-0 cursor-pointer">
              <TrustScoreToken score={listing.trustScore} />
            </button>
            <MatchChip percent={matchScore(listing, tenant)} />
          </div>

          <h3 className="mt-6 font-bold">Amenities</h3>
          <div className="mt-2 flex flex-wrap gap-2 text-sm text-coolgrey">
            {listing.amenities.map(a => <span key={a} className="rounded-full border border-line px-3 py-1">{a}</span>)}
          </div>

          <h3 className="mt-6 font-bold">Why this Trust Score?</h3>
          <p className="mt-1 text-sm text-coolgrey">Verification level, owner response rate, listing freshness and reviews combine into the {listing.trustScore}/100 score. Tap the badge on any listing to see what was verified.</p>
        </div>

        <div className="lg:sticky lg:top-6 h-fit rounded-card border border-line bg-white p-5 shadow-card">
          <div className="font-semibold">{owner?.name}</div>
          <div className="mt-1">
            {listing.verifiedOwner ? (
              <button type="button" onClick={() => setExplainer('verified')} aria-label="What was verified" className="appearance-none bg-transparent border-0 p-0 cursor-pointer">
                <VerifiedBadge kind="owner" />
              </button>
            ) : (
              <VerifiedBadge kind="owner" pending />
            )}
          </div>
          <div className="mt-3 text-sm text-coolgrey">Phone</div>
          {connected && owner ? (
            <>
              <div className="font-mono text-lg tracking-wide">{formatPhone(owner.phone)}</div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <a href={`tel:${owner.phone}`} className="inline-flex items-center justify-center gap-1 rounded-full bg-blueharbor px-3 py-2 text-sm font-semibold text-white"><Phone size={16} /> Call</a>
                <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-1 rounded-full border border-blueharbor px-3 py-2 text-sm font-semibold text-blueharbor"><WhatsappLogo size={16} /> WhatsApp</a>
              </div>
              <p className="mt-2 inline-flex w-full items-center justify-center gap-1 text-center text-xs font-semibold text-graphite"><CheckCircle size={14} weight="fill" className="text-blueharbor" /> Contact unlocked</p>
            </>
          ) : (
            <>
              <div className="font-mono text-lg tracking-widest">+91 ●●●●● ●●●●●</div>
              <Button className="mt-4 w-full" onClick={() => setShowConnect(true)}>Connect</Button>
              <p className="mt-2 text-center text-xs text-coolgrey">Small fee unlocks the verified owner's contact.</p>
            </>
          )}
        </div>
      </div>

      {showConnect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-graphite/40 p-4" onClick={() => setShowConnect(false)}>
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-sm rounded-card bg-white p-6 text-center shadow-card"
            onClick={e => e.stopPropagation()}
          >
            {connected ? (
              <>
                <CheckCircle size={44} weight="fill" className="mx-auto text-blueharbor" />
                <h3 className="mt-2 text-lg font-bold">Contact unlocked!</h3>
                <p className="mt-1 text-sm text-coolgrey">You can now reach {owner?.name} directly.</p>
                <div className="mt-3 font-mono text-lg tracking-wide">{owner && formatPhone(owner.phone)}</div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <a href={`tel:${owner?.phone}`} className="inline-flex items-center justify-center gap-1 rounded-full bg-blueharbor px-3 py-2 text-sm font-semibold text-white"><Phone size={16} /> Call</a>
                  <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-1 rounded-full border border-blueharbor px-3 py-2 text-sm font-semibold text-blueharbor"><WhatsappLogo size={16} /> WhatsApp</a>
                </div>
                <button onClick={() => setShowConnect(false)} className="mt-5 w-full rounded-full border border-line py-2 text-sm font-semibold">Done</button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold">Pay to connect</h3>
                <p className="mt-1 text-sm text-coolgrey">Unlock this verified owner's contact for a small fee. (Mock — no real payment.)</p>
                <Button className="mt-4 w-full" onClick={() => setConnected(true)}>Pay ₹49 (mock)</Button>
              </>
            )}
          </div>
        </div>
      )}

      {explainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-graphite/40 p-4" onClick={() => setExplainer(null)}>
          <div role="dialog" aria-modal="true" className="w-full max-w-sm rounded-card bg-white p-6 shadow-card" onClick={e => e.stopPropagation()}>
            {explainer === 'trust' ? <TrustScoreExplainer score={listing.trustScore} /> : <VerifiedInfo owner={owner} />}
            <button onClick={() => setExplainer(null)} className="mt-5 w-full rounded-full border border-line py-2 text-sm font-semibold">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
