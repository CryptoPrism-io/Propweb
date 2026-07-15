import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HeroSearchCard } from './HeroSearchCard';
import { LOCALITIES } from '../lib/searchFilters';

function ResultsProbe() {
  const loc = useLocation();
  return <div data-testid="results-probe">{loc.pathname}{loc.search}</div>;
}

function renderCard() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<HeroSearchCard />} />
        <Route path="/results" element={<ResultsProbe />} />
        <Route path="/owner/matches" element={<ResultsProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('HeroSearchCard', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('defaults to the Rentals tab and links Tenants to /tenant/verify', () => {
    renderCard();
    expect(screen.getByText('Rentals')).toBeInTheDocument();
    expect(screen.getByText('Tenants').closest('a')).toHaveAttribute('href', '/tenant/verify');
  });

  it('runs the AI thinking sequence then navigates to /results with matched filters (Rentals)', () => {
    renderCard();
    fireEvent.change(screen.getByPlaceholderText(/Try asking for '2BHK/), {
      target: { value: '2BHK under ₹35k in Koramangala, furnished' },
    });
    fireEvent.click(screen.getByText('Ask AI'));
    expect(screen.getByText('Reading your request…')).toBeInTheDocument();

    act(() => { vi.advanceTimersByTime(1650); });

    const probe = screen.getByTestId('results-probe').textContent ?? '';
    expect(probe).toContain('/results');
    expect(probe).toContain('locality=Koramangala');
    expect(probe).toContain('bhk=2');
    expect(probe).toContain('furnishing=furnished');
    expect(probe).toContain('maxRent=35000');
  });

  it('submits the manual search with the selected locality', () => {
    renderCard();
    fireEvent.click(screen.getByText('Search'));
    const probe = screen.getByTestId('results-probe').textContent ?? '';
    expect(probe).toContain(`locality=${LOCALITIES[0]}`);
  });

  it('switches to the Owners tab and, after the AI thinking sequence, navigates to /owner/matches', () => {
    renderCard();
    fireEvent.click(screen.getByText('Owners'));
    fireEvent.change(screen.getByPlaceholderText(/Tenants near me/), {
      target: { value: 'Tenants near me in Koramangala willing to pay 30k min rent' },
    });
    fireEvent.click(screen.getByText('Ask AI'));
    expect(screen.getByText('Reading your request…')).toBeInTheDocument();

    act(() => { vi.advanceTimersByTime(1650); });

    const probe = screen.getByTestId('results-probe').textContent ?? '';
    expect(probe).toContain('/owner/matches');
    expect(probe).toContain('locality=Koramangala');
    expect(probe).toContain('minRent=30000');
  });
});
