import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import { emptyDraft, isStepComplete, type ListingDraft, type WizardStep } from '../lib/ownerDraft';
import { WizardProgress } from '../components/owner/WizardProgress';
import { StepDetails } from '../components/owner/StepDetails';
import { StepPhotos } from '../components/owner/StepPhotos';
import { Button } from '../components/Button';

export default function OwnerWizard() {
  const nav = useNavigate();
  const [step, setStep] = useState<WizardStep>(1);
  const [draft, setDraft] = useState<ListingDraft>(emptyDraft());
  const set = (patch: Partial<ListingDraft>) => setDraft(d => ({ ...d, ...patch }));
  const canNext = isStepComplete(step, draft);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <button onClick={() => nav('/')} className="mb-4 inline-flex items-center gap-1 text-sm text-blueharbor">
        <ArrowLeft size={16} /> Home
      </button>
      <h1 className="font-display mb-4 text-2xl font-extrabold">List your property</h1>
      <WizardProgress step={step} />

      <div className="rounded-card border border-line bg-white p-5 shadow-card">
        {step === 1 && <StepDetails draft={draft} set={set} />}
        {step === 2 && <StepPhotos draft={draft} set={set} />}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <Button variant="secondary" onClick={() => (step === 1 ? nav('/') : setStep((step - 1) as WizardStep))}>
          Back
        </Button>
        <Button onClick={() => canNext && setStep((step + 1) as WizardStep)} className={canNext ? '' : 'opacity-40 pointer-events-none'}>
          Next <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}
