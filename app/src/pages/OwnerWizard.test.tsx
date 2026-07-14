import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OwnerWizard from './OwnerWizard';

function renderWizard() {
  return render(<MemoryRouter><OwnerWizard /></MemoryRouter>);
}

describe('OwnerWizard', () => {
  it('starts on the Details step', () => {
    renderWizard();
    expect(screen.getByText('Listing title')).toBeInTheDocument();
  });

  it('advances to Photos after the details are filled', () => {
    renderWizard();
    // selects: [0]=BHK, [1]=Locality, [2]=Furnishing, [3]=Preferred tenant
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: '2' } });
    fireEvent.change(selects[1], { target: { value: 'Koramangala' } });
    fireEvent.change(selects[2], { target: { value: 'semi' } });
    fireEvent.change(selects[3], { target: { value: 'family' } });
    fireEvent.change(screen.getByPlaceholderText('35000'), { target: { value: '35000' } });
    fireEvent.change(screen.getByPlaceholderText('1100'), { target: { value: '1100' } });
    fireEvent.click(screen.getByText(/Next/));
    expect(screen.getByText(/Select photos for your listing/)).toBeInTheDocument();
  });

  it('publishes and flips to Verified Owner', () => {
    const { container } = renderWizard();
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: '2' } });
    fireEvent.change(selects[1], { target: { value: 'Koramangala' } });
    fireEvent.change(selects[2], { target: { value: 'semi' } });
    fireEvent.change(selects[3], { target: { value: 'family' } });
    fireEvent.change(screen.getByPlaceholderText('35000'), { target: { value: '35000' } });
    fireEvent.change(screen.getByPlaceholderText('1100'), { target: { value: '1100' } });
    fireEvent.click(screen.getByText(/Next/));            // -> Photos
    fireEvent.click(screen.getAllByRole('button').find(b => b.querySelector('img'))!); // select first preset photo
    fireEvent.click(screen.getByText(/Next/));            // -> Preferences
    const dateInput = container.querySelector('input[type=date]');
    expect(dateInput).toBeTruthy();
    fireEvent.change(dateInput!, { target: { value: '2026-09-01' } });
    fireEvent.click(screen.getByText(/Next/));            // -> Review
    fireEvent.click(screen.getByText(/Publish listing/));
    expect(screen.getByText('Listing published')).toBeInTheDocument();
    expect(screen.getByText(/Verification pending/)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Complete verification/));
    expect(screen.getByText('Verified Owner')).toBeInTheDocument();
  });
});
