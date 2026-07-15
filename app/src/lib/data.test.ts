import { describe, it, expect } from 'vitest';
import { loadListings, loadOwners, loadTenant, loadTenants, getOwner } from './data';

const LOCALITIES = ['Koramangala', 'HSR Layout', 'Indiranagar', 'Whitefield', 'JP Nagar'];

describe('seed data', () => {
  it('has 25–30 listings within constraints', async () => {
    const listings = await loadListings();
    expect(listings.length).toBeGreaterThanOrEqual(25);
    expect(listings.length).toBeLessThanOrEqual(30);
    for (const l of listings) {
      expect(l.rent).toBeGreaterThanOrEqual(18000);
      expect(l.rent).toBeLessThanOrEqual(85000);
      expect(l.trustScore).toBeGreaterThanOrEqual(35);
      expect(l.trustScore).toBeLessThanOrEqual(98);
      expect(LOCALITIES).toContain(l.locality);
      expect(l.photos.length).toBeGreaterThan(0);
    }
  });

  it('spans all five localities', async () => {
    const listings = await loadListings();
    const set = new Set(listings.map(l => l.locality));
    for (const loc of LOCALITIES) expect(set.has(loc)).toBe(true);
  });

  it('every listing resolves to an owner', async () => {
    const [listings, owners] = [await loadListings(), await loadOwners()];
    for (const l of listings) expect(getOwner(owners, l.ownerId)).toBeDefined();
  });

  it('has trust scores in all three bands', async () => {
    const listings = await loadListings();
    expect(listings.some(l => l.trustScore >= 75)).toBe(true);
    expect(listings.some(l => l.trustScore >= 50 && l.trustScore < 75)).toBe(true);
    expect(listings.some(l => l.trustScore < 50)).toBe(true);
  });

  it('loads a demo tenant profile', async () => {
    const t = await loadTenant();
    expect(t.budgetMax).toBeGreaterThan(t.budgetMin);
    expect(t.preferredLocalities.length).toBeGreaterThan(0);
  });

  it('has a tenant pool of at least 8 profiles spanning multiple localities', async () => {
    const tenants = await loadTenants();
    expect(tenants.length).toBeGreaterThanOrEqual(8);
    const covered = new Set(tenants.flatMap(t => t.preferredLocalities));
    for (const loc of LOCALITIES) expect(covered.has(loc)).toBe(true);
  });
});
