export type Furnishing = 'unfurnished' | 'semi' | 'furnished';
export type TenantType = 'family' | 'bachelor' | 'any';

export interface Listing {
  id: string;
  title: string;          // "2BHK in Koramangala"
  bhk: number;
  locality: string;       // one of the 5 localities
  address: string;
  rent: number;           // monthly ₹, 18000–85000
  deposit: number;
  areaSqft: number;
  furnishing: Furnishing;
  tenantType: TenantType;
  moveInDate: string;     // ISO date, when the flat is available
  photos: string[];       // e.g. ["/photos/1.jpg"]
  trustScore: number;     // 35–98
  ownerId: string;
  verifiedOwner: boolean;
  postedDaysAgo: number;
  lat: number;
  lng: number;
  amenities: string[];
}

export interface Owner {
  id: string;
  name: string;
  phone: string;           // real number; masked in UI
  verified: boolean;
  verifiedItems: string[]; // e.g. ["Aadhaar", "PAN", "Ownership proof"]
  verifiedOn: string;      // ISO date
  responseRate: number;    // 0–100
}

export interface TenantProfile {
  id: string;
  name: string;
  budgetMin: number;
  budgetMax: number;
  preferredLocalities: string[];
  tenantType: TenantType;
  furnishing: Furnishing;
  moveInDate: string;      // ISO date the tenant wants to move in
}
