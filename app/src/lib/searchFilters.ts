export const LOCALITIES = ['Koramangala', 'HSR Layout', 'Indiranagar', 'Whitefield', 'JP Nagar'];
export const BHKS = ['1', '2', '3', '3+'];
export const FURNISH = [
  { v: '', l: 'Any' },
  { v: 'unfurnished', l: 'Unfurnished' },
  { v: 'semi', l: 'Semi' },
  { v: 'furnished', l: 'Furnished' },
];
export const TENANTS = [
  { v: '', l: 'Any' },
  { v: 'family', l: 'Family' },
  { v: 'bachelor', l: 'Bachelor' },
];

export type AiParsedQuery = {
  locality?: string;
  bhk?: string;
  furnishing?: string;
  tenantType?: string;
  maxRent?: string;
};

export type OwnerAiParsedQuery = {
  locality?: string;
  minRent?: string;
};

function findLocality(lower: string): string | undefined {
  return LOCALITIES.find(l => lower.includes(l.toLowerCase()));
}

function parseRentToken(lower: string): string | undefined {
  const kMatch = lower.match(/₹?\s*(\d{2,3})\s*k\b/);
  if (kMatch) return String(Number(kMatch[1]) * 1000);
  const rawMatch = lower.match(/₹\s*(\d{4,6})\b/) ?? lower.match(/\b(\d{4,6})\b/);
  return rawMatch ? rawMatch[1] : undefined;
}

/**
 * Rule-based "AI" query parser (tenant side) — no ML/NLP. Matches known
 * vocabulary and a simple rent pattern out of free text.
 */
export function parseAiQuery(text: string): AiParsedQuery {
  const lower = text.toLowerCase();
  const result: AiParsedQuery = {};

  const locality = findLocality(lower);
  if (locality) result.locality = locality;

  const bhk = BHKS.find(b => new RegExp(`\\b${b.replace('+', '\\+')}\\s*bhk`, 'i').test(lower));
  if (bhk) result.bhk = bhk;

  const furnishing = FURNISH.find(f => f.v && lower.includes(f.v));
  if (furnishing) result.furnishing = furnishing.v;

  const tenantType = TENANTS.find(t => t.v && lower.includes(t.v));
  if (tenantType) result.tenantType = tenantType.v;

  const maxRent = parseRentToken(lower);
  if (maxRent) result.maxRent = maxRent;

  return result;
}

/**
 * Rule-based "AI" query parser (owner side) — parses a locality and a
 * minimum-rent-willingness figure out of free text like "tenants near me
 * willing to pay 30k min rent".
 */
export function parseOwnerAiQuery(text: string): OwnerAiParsedQuery {
  const lower = text.toLowerCase();
  const result: OwnerAiParsedQuery = {};

  const locality = findLocality(lower);
  if (locality) result.locality = locality;

  const minRent = parseRentToken(lower);
  if (minRent) result.minRent = minRent;

  return result;
}
