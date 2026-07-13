import type { Listing, Owner, TenantProfile } from './types';

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json() as Promise<T>;
}

export const loadListings = () => getJson<Listing[]>('/data/listings.json');
export const loadOwners = () => getJson<Owner[]>('/data/owners.json');
export const loadTenant = () => getJson<TenantProfile>('/data/tenant.json');

export function getOwner(owners: Owner[], id: string): Owner | undefined {
  return owners.find(o => o.id === id);
}
