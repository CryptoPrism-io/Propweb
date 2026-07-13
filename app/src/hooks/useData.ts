import { useEffect, useState } from 'react';
import { loadListings, loadOwners, loadTenant } from '../lib/data';
import type { Listing, Owner, TenantProfile } from '../lib/types';

export function useData() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [tenant, setTenant] = useState<TenantProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadListings(), loadOwners(), loadTenant()])
      .then(([l, o, t]) => { setListings(l); setOwners(o); setTenant(t); })
      .finally(() => setLoading(false));
  }, []);

  return { listings, owners, tenant, loading };
}
