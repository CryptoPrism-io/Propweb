import { describe, it, expect } from 'vitest';
import { filterListings } from './filter';
import type { Listing } from './types';

const mk = (over: Partial<Listing>): Listing => ({
  id: 'l', title: '', bhk: 2, locality: 'Koramangala', address: '', rent: 30000,
  deposit: 0, areaSqft: 900, furnishing: 'semi', tenantType: 'family',
  moveInDate: '2026-07-01', photos: ['/photos/1.jpg'], trustScore: 80, ownerId: 'o1',
  verifiedOwner: true, postedDaysAgo: 1, lat: 0, lng: 0, amenities: [], ...over,
});

describe('filterListings', () => {
  const data = [mk({ id: 'a', locality: 'Koramangala', bhk: 2, rent: 30000 }),
                mk({ id: 'b', locality: 'Whitefield', bhk: 2, rent: 30000 }),
                mk({ id: 'c', locality: 'Koramangala', bhk: 3, rent: 60000 })];
  it('filters by locality', () => {
    expect(filterListings(data, { locality: 'Koramangala' }).map(l => l.id)).toEqual(['a', 'c']);
  });
  it('filters by bhk', () => {
    expect(filterListings(data, { bhk: 3 }).map(l => l.id)).toEqual(['c']);
  });
  it('filters by maxRent', () => {
    expect(filterListings(data, { maxRent: 35000 }).map(l => l.id)).toEqual(['a', 'b']);
  });
  it('filters by furnishing', () => {
    const d = [mk({ id: 'a', furnishing: 'semi' }), mk({ id: 'b', furnishing: 'furnished' })];
    expect(filterListings(d, { furnishing: 'furnished' }).map(l => l.id)).toEqual(['b']);
  });
  it('filters by tenantType', () => {
    const d = [mk({ id: 'a', tenantType: 'family' }), mk({ id: 'b', tenantType: 'bachelor' })];
    expect(filterListings(d, { tenantType: 'bachelor' }).map(l => l.id)).toEqual(['b']);
  });
  it('filters by minBhk (3+)', () => {
    const d = [mk({ id: 'a', bhk: 2 }), mk({ id: 'b', bhk: 3 }), mk({ id: 'c', bhk: 4 })];
    expect(filterListings(d, { minBhk: 3 }).map(l => l.id)).toEqual(['b', 'c']);
  });
});
