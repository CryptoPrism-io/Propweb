import type { Listing } from './types';

export function filterListings(
  listings: Listing[],
  f: { locality?: string; bhk?: number; maxRent?: number },
): Listing[] {
  return listings.filter(l =>
    (f.locality ? l.locality === f.locality : true) &&
    (f.bhk ? l.bhk === f.bhk : true) &&
    (f.maxRent ? l.rent <= f.maxRent : true),
  );
}
