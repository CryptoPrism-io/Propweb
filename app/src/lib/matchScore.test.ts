import { describe, it, expect } from 'vitest';
import { matchScore } from './matchScore';
import type { Listing, TenantProfile } from './types';

const tenant: TenantProfile = {
  id: 't1', name: 'Ananya', budgetMin: 20000, budgetMax: 35000,
  preferredLocalities: ['Koramangala'], tenantType: 'family',
  furnishing: 'semi', moveInDate: '2026-08-01',
};

const base: Listing = {
  id: 'l', title: '', bhk: 2, locality: 'Koramangala', address: '',
  rent: 30000, deposit: 0, areaSqft: 1000, furnishing: 'semi',
  tenantType: 'family', moveInDate: '2026-07-20', photos: ['/photos/1.jpg'],
  trustScore: 90, ownerId: 'o1', verifiedOwner: true, postedDaysAgo: 1,
  lat: 0, lng: 0, amenities: [],
};

describe('matchScore', () => {
  it('is 100 for a perfect match', () => {
    expect(matchScore(base, tenant)).toBe(100);
  });
  it('drops locality points when locality differs', () => {
    expect(matchScore({ ...base, locality: 'Whitefield' }, tenant)).toBe(75);
  });
  it('gives full budget points when rent is at or under budgetMax', () => {
    expect(matchScore({ ...base, rent: 35000 }, tenant)).toBe(100);
  });
  it('reduces budget points when rent exceeds budgetMax and hits 0 at +50%', () => {
    expect(matchScore({ ...base, rent: 52500 }, tenant)).toBe(60); // 100 - 40
  });
  it("gives tenant-type points when listing is 'any'", () => {
    expect(matchScore({ ...base, tenantType: 'any' }, tenant)).toBe(100);
  });
  it('drops move-in points when flat is available after tenant move-in', () => {
    expect(matchScore({ ...base, moveInDate: '2026-09-01' }, tenant)).toBe(90);
  });
  it('drops furnishing points when furnishing differs', () => {
    expect(matchScore({ ...base, furnishing: 'unfurnished' }, tenant)).toBe(90);
  });
  it('scales budget points linearly at +25% over budget', () => {
    expect(matchScore({ ...base, rent: 43750 }, tenant)).toBe(80);
  });
});
