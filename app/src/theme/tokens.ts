export const tokens = {
  moontint: '#F3F6FF',
  blueharbor: '#3770BF',
  iceblue: '#8DC2FF',
  limeglow: '#C3EA4F',
  graphite: '#1B1E23',
  coolgrey: '#5B6470',
  line: '#DDE3EE',
  white: '#FFFFFF',
  amber: '#E8A13D',
  mutedred: '#E5533D',
} as const;

export type ColorToken = keyof typeof tokens;
