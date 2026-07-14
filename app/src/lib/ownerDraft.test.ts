import { describe, it, expect } from 'vitest';
import { emptyDraft, isStepComplete } from './ownerDraft';

describe('ownerDraft', () => {
  it('emptyDraft starts incomplete on step 1', () => {
    expect(isStepComplete(1, emptyDraft())).toBe(false);
  });

  it('step 1 completes when core details are filled', () => {
    const d = { ...emptyDraft(), bhk: 2, locality: 'Koramangala', rent: '35000', areaSqft: '1100', furnishing: 'semi' as const, tenantType: 'family' as const };
    expect(isStepComplete(1, d)).toBe(true);
  });

  it('step 1 stays incomplete if furnishing or tenantType is unset', () => {
    const d = { ...emptyDraft(), bhk: 2, locality: 'Koramangala', rent: '35000', areaSqft: '1100' };
    expect(isStepComplete(1, d)).toBe(false);
  });

  it('step 2 requires at least one photo', () => {
    expect(isStepComplete(2, emptyDraft())).toBe(false);
    expect(isStepComplete(2, { ...emptyDraft(), photos: ['/p1.jpg'] })).toBe(true);
  });

  it('step 3 requires a move-in date', () => {
    expect(isStepComplete(3, emptyDraft())).toBe(false);
    expect(isStepComplete(3, { ...emptyDraft(), moveInDate: '2026-09-01' })).toBe(true);
  });

  it('step 4 (review) is always complete', () => {
    expect(isStepComplete(4, emptyDraft())).toBe(true);
  });
});
