import type { Listing, TenantProfile } from './types';

export function matchScore(listing: Listing, tenant: TenantProfile): number {
  let score = 0;

  // Budget — 40%. Full if at/under budgetMax; linear to 0 at +50% over.
  if (listing.rent <= tenant.budgetMax) {
    score += 40;
  } else {
    const over = (listing.rent - tenant.budgetMax) / tenant.budgetMax;
    score += Math.max(0, 40 * (1 - over / 0.5));
  }

  // Locality — 25%.
  if (tenant.preferredLocalities.includes(listing.locality)) score += 25;

  // Family/bachelor — 15%.
  if (listing.tenantType === 'any' || listing.tenantType === tenant.tenantType) score += 15;

  // Furnishing — 10%.
  if (listing.furnishing === tenant.furnishing) score += 10;

  // Move-in — 10%. Full if flat is available on/before tenant's desired date.
  if (new Date(listing.moveInDate) <= new Date(tenant.moveInDate)) score += 10;

  return Math.round(score);
}
