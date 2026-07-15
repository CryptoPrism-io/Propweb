import { describe, it, expect } from 'vitest';
import { parseAiQuery, parseOwnerAiQuery, LOCALITIES, BHKS, FURNISH, TENANTS } from './searchFilters';

describe('searchFilters vocab', () => {
  it('exposes the shared locality/bhk/furnishing/tenant vocab', () => {
    expect(LOCALITIES).toContain('Koramangala');
    expect(BHKS).toEqual(['1', '2', '3', '3+']);
    expect(FURNISH.map(f => f.v)).toEqual(['', 'unfurnished', 'semi', 'furnished']);
    expect(TENANTS.map(t => t.v)).toEqual(['', 'family', 'bachelor']);
  });
});

describe('parseAiQuery (tenant side)', () => {
  it('extracts locality, bhk, furnishing, and budget from free text', () => {
    expect(parseAiQuery('2BHK under ₹35k in Koramangala, furnished')).toEqual({
      locality: 'Koramangala', bhk: '2', furnishing: 'furnished', maxRent: '35000',
    });
  });

  it('extracts tenant type and unfurnished (not confused with "furnished")', () => {
    expect(parseAiQuery('bachelor 1bhk unfurnished flat in HSR Layout')).toEqual({
      locality: 'HSR Layout', bhk: '1', furnishing: 'unfurnished', tenantType: 'bachelor',
    });
  });

  it('returns an empty object when nothing matches', () => {
    expect(parseAiQuery('looking for a nice place')).toEqual({});
  });
});

describe('parseOwnerAiQuery (owner side)', () => {
  it('extracts locality and a min-rent figure', () => {
    expect(parseOwnerAiQuery('Tenants near me in Koramangala willing to pay 30k min rent')).toEqual({
      locality: 'Koramangala', minRent: '30000',
    });
  });

  it('returns an empty object when nothing matches', () => {
    expect(parseOwnerAiQuery('show me good tenants')).toEqual({});
  });
});
