import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { emptyKycDraft, type TenantKycDraft } from '../lib/tenantKyc';

export type TenantVerificationStatus = 'unverified' | 'pending' | 'verified';

interface TenantVerificationValue {
  status: TenantVerificationStatus;
  kyc: TenantKycDraft;
  submitKyc: (draft: TenantKycDraft) => void;
  completeVerification: () => void;
}

const TenantVerificationContext = createContext<TenantVerificationValue | null>(null);

export function TenantVerificationProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<TenantVerificationStatus>('unverified');
  const [kyc, setKyc] = useState<TenantKycDraft>(emptyKycDraft());

  const value = useMemo<TenantVerificationValue>(() => ({
    status,
    kyc,
    submitKyc: (draft) => { setKyc(draft); setStatus('pending'); },
    completeVerification: () => setStatus('verified'),
  }), [status, kyc]);

  return <TenantVerificationContext.Provider value={value}>{children}</TenantVerificationContext.Provider>;
}

export function useTenantVerification(): TenantVerificationValue {
  const ctx = useContext(TenantVerificationContext);
  if (!ctx) throw new Error('useTenantVerification must be used within a TenantVerificationProvider');
  return ctx;
}
