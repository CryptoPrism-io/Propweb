import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import { emptyKycDraft, isKycStepComplete, type TenantKycDraft, type KycStep } from '../lib/tenantKyc';
import { useTenantVerification } from '../hooks/useTenantVerification';
import { WizardProgress } from '../components/shared/WizardProgress';
import { StepIdentity } from '../components/tenant/StepIdentity';
import { StepEmployment } from '../components/tenant/StepEmployment';
import { StepKycReview } from '../components/tenant/StepKycReview';
import { TenantVerifiedState } from '../components/tenant/TenantVerifiedState';
import { Button } from '../components/Button';

const LABELS = ['Identity', 'Employment', 'Review'];

export default function TenantKyc() {
  const nav = useNavigate();
  const { status, submitKyc, completeVerification } = useTenantVerification();
  const [step, setStep] = useState<KycStep>(1);
  const [draft, setDraft] = useState<TenantKycDraft>(emptyKycDraft());
  const set = (patch: Partial<TenantKycDraft>) => setDraft(d => ({ ...d, ...patch }));
  const canNext = isKycStepComplete(step, draft);

  if (status !== 'unverified') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <TenantVerifiedState verified={status === 'verified'} onVerify={completeVerification} />
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
      <h1 className="font-display mb-4 text-2xl font-extrabold">Get your Verified Tenant badge</h1>
      <WizardProgress step={step} labels={LABELS} />

      <div className="rounded-card border border-line bg-white p-5 shadow-card">
        {step === 1 && <StepIdentity draft={draft} set={set} />}
        {step === 2 && <StepEmployment draft={draft} set={set} />}
        {step === 3 && <StepKycReview draft={draft} />}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <Button variant="secondary" onClick={() => (step === 1 ? nav('/') : setStep((step - 1) as KycStep))}>Back</Button>
        {step < 3 ? (
          <Button onClick={() => canNext && setStep((step + 1) as KycStep)} className={canNext ? '' : 'opacity-40 pointer-events-none'}>
            Next <ArrowRight size={16} />
          </Button>
        ) : (
          <Button onClick={() => submitKyc(draft)}>Submit KYC</Button>
        )}
      </div>
    </div>
  );
}
