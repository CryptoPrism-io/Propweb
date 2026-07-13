export type TrustBand = 'strong' | 'medium' | 'weak';

export function trustBand(score: number): TrustBand {
  if (score >= 75) return 'strong';
  if (score >= 50) return 'medium';
  return 'weak';
}

const TRUST_COLORS: Record<TrustBand, string> = {
  strong: '#C3EA4F',
  medium: '#E8A13D',
  weak: '#E5533D',
};

export function trustColor(score: number): string {
  return TRUST_COLORS[trustBand(score)];
}

// White text on the weak (red) band for contrast; graphite otherwise (DESIGN.md).
export function trustTextColor(score: number): string {
  return trustBand(score) === 'weak' ? '#FFFFFF' : '#1B1E23';
}
