import { useRef, useState } from 'react';
import { ArrowLeft, CheckCircle, FileArrowUp, HouseLine, IdentificationCard, LinkSimple, ShieldCheck } from '@phosphor-icons/react';
import { Button } from '../Button';

type Upload = 'aadhaar' | 'property';

const COPY: Record<Upload, { title: string; detail: string; icon: typeof IdentificationCard }> = {
  aadhaar: {
    title: 'Aadhaar identity document',
    detail: 'Upload Aadhaar Offline XML or use DigiLocker.',
    icon: IdentificationCard,
  },
  property: {
    title: 'Property ownership document',
    detail: 'Sale deed, khata, or another ownership proof for this property.',
    icon: HouseLine,
  },
};

export function OwnerVerification({ onBack, onComplete }: { onBack: () => void; onComplete: () => void }) {
  const [uploads, setUploads] = useState<Partial<Record<Upload, string>>>({});
  const [digiLockerLinked, setDigiLockerLinked] = useState(false);
  const inputs = useRef<Partial<Record<Upload, HTMLInputElement | null>>>({});

  const selectFile = (kind: Upload, file?: File) => {
    if (file) setUploads(current => ({ ...current, [kind]: file.name }));
  };

  return (
    <section className="rounded-card border border-line bg-white p-6 shadow-card">
      <button onClick={onBack} className="inline-flex items-center gap-1 text-sm font-semibold text-blueharbor">
        <ArrowLeft size={16} /> Back to listing
      </button>
      <div className="mt-4 flex items-start gap-3">
        <span className="rounded-full bg-limeglow p-2 text-graphite"><ShieldCheck size={22} weight="fill" /></span>
        <div>
          <h2 className="font-display text-xl font-extrabold">Verify your listing</h2>
          <p className="mt-1 text-sm text-coolgrey">Connect DigiLocker or add documents below. These are mock controls for the demo, so you can continue without uploading.</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {(Object.keys(COPY) as Upload[]).map(kind => {
          const item = COPY[kind];
          const Icon = item.icon;
          const fileName = uploads[kind];
          return (
            <div key={kind} className="rounded-panel border border-line bg-moontint p-4">
              <div className="flex items-start gap-3">
                <Icon size={22} className="mt-0.5 text-blueharbor" weight="duotone" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-graphite">{item.title}</p>
                  <p className="mt-0.5 text-xs leading-5 text-coolgrey">{fileName ?? item.detail}</p>
                </div>
                {fileName ? <CheckCircle size={21} weight="fill" className="text-graphite" /> : null}
              </div>
              <input ref={node => { inputs.current[kind] = node; }} className="sr-only" type="file" accept={kind === 'aadhaar' ? '.xml,.pdf' : '.pdf,.jpg,.jpeg,.png'} onChange={event => selectFile(kind, event.target.files?.[0])} />
              <button type="button" onClick={() => inputs.current[kind]?.click()} className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-blueharbor">
                <FileArrowUp size={17} weight="bold" /> {fileName ? 'Replace document' : 'Choose document'}
              </button>
              {kind === 'aadhaar' && (
                <button
                  type="button"
                  onClick={() => setDigiLockerLinked(true)}
                  className="mt-3 ml-4 inline-flex items-center gap-1.5 text-sm font-bold text-blueharbor"
                >
                  <LinkSimple size={17} weight="bold" /> {digiLockerLinked ? 'DigiLocker linked (mock)' : 'Connect DigiLocker (mock)'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs leading-5 text-coolgrey">Identity verification uses Aadhaar Offline XML or DigiLocker — never direct Aadhaar eKYC.</p>
      <Button className="mt-5 w-full" onClick={onComplete}>Continue to verification</Button>
    </section>
  );
}
