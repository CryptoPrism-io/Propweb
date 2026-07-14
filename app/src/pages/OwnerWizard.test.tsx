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
});
