import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { TenantVerificationProvider, useTenantVerification } from '../hooks/useTenantVerification';
import { emptyKycDraft } from '../lib/tenantKyc';
import ListingDetail from './ListingDetail';

// TenantVerificationProvider only exposes submitKyc/completeVerification as a
// way to change status — there's no way to inject an initial status from
// outside. This test-only sibling drives those actions from within the same
// provider tree so we can reach the 'pending' and 'verified' states.
function StatusDriver() {
  const { submitKyc, completeVerification } = useTenantVerification();
  return (
    <div>
      <button onClick={() => submitKyc(emptyKycDraft())}>drive-pending</button>
      <button onClick={completeVerification}>drive-verified</button>
    </div>
  );
}

function renderListing(target: 'unverified' | 'pending' | 'verified') {
  render(
    <MemoryRouter initialEntries={['/listing/l1']}>
      <TenantVerificationProvider>
        <StatusDriver />
        <Routes>
          <Route path="/listing/:id" element={<ListingDetail />} />
        </Routes>
      </TenantVerificationProvider>
    </MemoryRouter>,
  );
  if (target === 'pending' || target === 'verified') {
    fireEvent.click(screen.getByText('drive-pending'));
  }
  if (target === 'verified') {
    fireEvent.click(screen.getByText('drive-verified'));
  }
}

async function openConnectModal() {
  const button = await screen.findByText('Connect');
  fireEvent.click(button);
}

describe('ListingDetail — Connect modal tenant verification states', () => {
  it('unverified: shows a link to /tenant/verify that closes the modal on click', async () => {
    renderListing('unverified');
    await openConnectModal();

    const link = screen.getByText(/Not verified yet — Get your Verified Tenant badge/);
    expect(link).toHaveAttribute('href', '/tenant/verify');
    expect(screen.queryByText('Verification pending')).not.toBeInTheDocument();
    expect(screen.queryByText(/Connecting as a Verified Tenant/)).not.toBeInTheDocument();

    fireEvent.click(link);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('pending: shows the pending badge and no link or verified copy', async () => {
    renderListing('pending');
    await openConnectModal();

    expect(screen.getByText('Verification pending')).toBeInTheDocument();
    expect(screen.queryByText(/Not verified yet/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Connecting as a Verified Tenant/)).not.toBeInTheDocument();
  });

  it('verified: shows the Verified Tenant badge and "Connecting as a Verified Tenant" copy', async () => {
    renderListing('verified');
    await openConnectModal();

    expect(screen.getByText('Verified Tenant')).toBeInTheDocument();
    expect(screen.getByText(/Connecting as a Verified Tenant/)).toBeInTheDocument();
    expect(screen.queryByText(/Not verified yet/)).not.toBeInTheDocument();
    expect(screen.queryByText('Verification pending')).not.toBeInTheDocument();
  });
});
