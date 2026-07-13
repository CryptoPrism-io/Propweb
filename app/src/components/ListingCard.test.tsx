import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ListingCard } from './ListingCard';
import type { Listing, TenantProfile } from '../lib/types';

const tenant: TenantProfile = {
  id: 't1', name: 'Ananya', budgetMin: 20000, budgetMax: 35000,
  preferredLocalities: ['Koramangala'], tenantType: 'family',
  furnishing: 'semi', moveInDate: '2026-08-01',
};
const listing: Listing = {
  id: 'l1', title: '2BHK in Koramangala', bhk: 2, locality: 'Koramangala',
  address: '5th Block, Koramangala', rent: 35000, deposit: 200000, areaSqft: 1100,
  furnishing: 'semi', tenantType: 'family', moveInDate: '2026-07-25',
  photos: ['/photos/1.jpg'], trustScore: 95, ownerId: 'o1', verifiedOwner: true,
  postedDaysAgo: 2, lat: 12.9, lng: 77.6, amenities: ['Lift'],
};

describe('ListingCard', () => {
  it('renders rent, locality, trust score, match %, and verified badge', () => {
    render(<ListingCard listing={listing} tenant={tenant} />);
    expect(screen.getByText(/35,000/)).toBeInTheDocument();
    expect(screen.getByText('2BHK · Koramangala')).toBeInTheDocument();
    expect(screen.getByText('95')).toBeInTheDocument();
    expect(screen.getByText(/100% match/)).toBeInTheDocument();
    expect(screen.getByText(/Verified Owner/)).toBeInTheDocument();
  });
});
