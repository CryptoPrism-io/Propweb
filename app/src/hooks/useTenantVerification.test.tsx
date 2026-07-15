import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TenantVerificationProvider, useTenantVerification } from './useTenantVerification';
import { emptyKycDraft } from '../lib/tenantKyc';

function Probe() {
  const { status, submitKyc, completeVerification } = useTenantVerification();
  return (
    <div>
      <span data-testid="status">{status}</span>
      <button onClick={() => submitKyc({ ...emptyKycDraft(), fullName: 'Ananya Rao' })}>Submit</button>
      <button onClick={completeVerification}>Verify</button>
    </div>
  );
}

describe('TenantVerificationProvider', () => {
  it('starts unverified, moves to pending on submit, then verified on completeVerification', () => {
    render(<TenantVerificationProvider><Probe /></TenantVerificationProvider>);
    expect(screen.getByTestId('status')).toHaveTextContent('unverified');
    fireEvent.click(screen.getByText('Submit'));
    expect(screen.getByTestId('status')).toHaveTextContent('pending');
    fireEvent.click(screen.getByText('Verify'));
    expect(screen.getByTestId('status')).toHaveTextContent('verified');
  });
});
