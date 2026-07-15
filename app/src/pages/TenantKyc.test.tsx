import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TenantVerificationProvider } from '../hooks/useTenantVerification';
import TenantKyc from './TenantKyc';

function renderKyc() {
  return render(
    <MemoryRouter>
      <TenantVerificationProvider>
        <TenantKyc />
      </TenantVerificationProvider>
    </MemoryRouter>,
  );
}

function chooseOption(combobox: HTMLElement, optionName: string) {
  fireEvent.click(combobox);
  fireEvent.click(screen.getByRole('option', { name: optionName }));
}

describe('TenantKyc', () => {
  it('starts on the Identity step', () => {
    renderKyc();
    expect(screen.getByText('Full name')).toBeInTheDocument();
  });

  it('submits KYC and flips to Verified Tenant', () => {
    renderKyc();
    fireEvent.change(screen.getByPlaceholderText('As on Aadhaar/PAN'), { target: { value: 'Ananya Rao' } });
    fireEvent.change(screen.getByPlaceholderText('234567890123'), { target: { value: '234567890123' } });
    fireEvent.change(screen.getByPlaceholderText('ABCDE1234F'), { target: { value: 'ABCDE1234F' } });
    fireEvent.click(screen.getByText(/Next/));            // -> Employment
    fireEvent.click(screen.getByText('Salaried'));
    fireEvent.change(screen.getByPlaceholderText('e.g. Acme Technologies'), { target: { value: 'Acme Technologies' } });
    chooseOption(screen.getByRole('combobox'), '₹25,000 – ₹50,000');
    fireEvent.click(screen.getByText(/Next/));            // -> Review
    fireEvent.click(screen.getByText('Submit KYC'));
    expect(screen.getByText('KYC submitted')).toBeInTheDocument();
    expect(screen.getByText(/Verification pending/)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Complete verification/));
    expect(screen.getByText('Verified Tenant')).toBeInTheDocument();
  });
});
