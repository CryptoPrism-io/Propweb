import type { Listing } from './types';

export function filterListings(
  listings: Listing[],
  f: { locality?: string; bhk?: number; minBhk?: number; maxRent?: number; furnishing?: string; tenantType?: string },
): Listing[] {
  return listings.filter(l =>
    (f.locality ? l.locality === f.locality : true) &&
    (f.bhk ? l.bhk === f.bhk : true) &&
    (f.minBhk ? l.bhk >= f.minBhk : true) &&
    (f.maxRent ? l.rent <= f.maxRent : true) &&
    (f.furnishing ? l.furnishing === f.furnishing : true) &&
    (f.tenantType ? l.tenantType === f.tenantType : true),
  );
}
