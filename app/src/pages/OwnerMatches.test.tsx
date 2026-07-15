import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OwnerMatches from './OwnerMatches';

function renderPage(query: string) {
  return render(
    <MemoryRouter initialEntries={[`/owner/matches${query}`]}>
      <OwnerMatches />
    </MemoryRouter>,
  );
}

describe('OwnerMatches', () => {
  it('ranks tenants by match score for a locality + minRent query, highest first', async () => {
    renderPage('?locality=Koramangala&minRent=30000');
    await waitFor(() => expect(screen.getAllByText(/% match/).length).toBeGreaterThan(0));
    const scores = screen.getAllByText(/% match/).map(el => Number(el.textContent!.replace('% match', '')));
    const sorted = [...scores].sort((a, b) => b - a);
    expect(scores).toEqual(sorted);
  });

  it('shows all tenants and a "near you" heading when no query params are given', async () => {
    renderPage('');
    await waitFor(() => expect(screen.getByText(/tenants? found/)).toBeInTheDocument());
    expect(screen.getByText('Tenants near you')).toBeInTheDocument();
  });
});
