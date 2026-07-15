import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import { emptyDraft, isStepComplete, type ListingDraft, type WizardStep } from '../lib/ownerDraft';
import { WizardProgress } from '../components/shared/WizardProgress';
import { StepDetails } from '../components/owner/StepDetails';
import { StepPhotos } from '../components/owner/StepPhotos';
import { StepPreferences } from '../components/owner/StepPreferences';
import { StepReview } from '../components/owner/StepReview';
import { PublishedState } from '../components/owner/PublishedState';
import { Button } from '../components/Button';

const LABELS = ['Details', 'Photos', 'Preferences', 'Review'];

export default function OwnerWizard() {
  const nav = useNavigate();
  const [step, setStep] = useState<WizardStep>(1);
  const [draft, setDraft] = useState<ListingDraft>(emptyDraft());
  const [published, setPublished] = useState(false);
  const [verified, setVerified] = useState(false);
  const set = (patch: Partial<ListingDraft>) => setDraft(d => ({ ...d, ...patch }));
  const canNext = isStepComplete(step, draft);

  if (published) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <PublishedState draft={draft} verified={verified} onVerify={() => setVerified(true)} />
        <div className="mt-5 text-center">
          <Button variant="secondary" onClick={() => nav('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <button onClick={() => nav('/')} className="mb-4 inline-flex items-center gap-1 text-sm text-blueharbor">
        <ArrowLeft size={16} /> Home
      </button>
      <h1 className="font-display mb-4 text-2xl font-extrabold">List your property</h1>
      <WizardProgress step={step} labels={LABELS} />

      <div className="rounded-card border border-line bg-white p-5 shadow-card">
        {step === 1 && <StepDetails draft={draft} set={set} />}
        {step === 2 && <StepPhotos draft={draft} set={set} />}
        {step === 3 && <StepPreferences draft={draft} set={set} />}
        {step === 4 && <StepReview draft={draft} />}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <Button variant="secondary" onClick={() => (step === 1 ? nav('/') : setStep((step - 1) as WizardStep))}>Back</Button>
        {step < 4 ? (
          <Button onClick={() => canNext && setStep((step + 1) as WizardStep)} className={canNext ? '' : 'opacity-40 pointer-events-none'}>
            Next <ArrowRight size={16} />
          </Button>
        ) : (
          <Button onClick={() => setPublished(true)}>Publish listing</Button>
        )}
      </div>
    </div>
  );
}
