import { describe, it, expect } from 'vitest';
import { trustBand, trustColor, trustTextColor } from './trustScore';

describe('trustBand', () => {
  it('classifies strong at 75 and above', () => {
    expect(trustBand(75)).toBe('strong');
    expect(trustBand(98)).toBe('strong');
  });
  it('classifies medium between 50 and 74', () => {
    expect(trustBand(50)).toBe('medium');
    expect(trustBand(74)).toBe('medium');
  });
  it('classifies weak below 50', () => {
    expect(trustBand(35)).toBe('weak');
    expect(trustBand(49)).toBe('weak');
  });
});

describe('trustColor', () => {
  it('maps bands to the palette', () => {
    expect(trustColor(90)).toBe('#C3EA4F');
    expect(trustColor(60)).toBe('#E8A13D');
    expect(trustColor(40)).toBe('#E5533D');
  });
});

describe('trustTextColor', () => {
  it('uses white on the weak (red) band, graphite otherwise', () => {
    expect(trustTextColor(90)).toBe('#1B1E23');
    expect(trustTextColor(60)).toBe('#1B1E23');
    expect(trustTextColor(40)).toBe('#FFFFFF');
  });
});
