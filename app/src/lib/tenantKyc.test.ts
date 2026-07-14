import { describe, it, expect } from 'vitest';
import { emptyKycDraft, isKycStepComplete } from './tenantKyc';

describe('tenantKyc', () => {
  it('emptyKycDraft starts incomplete on step 1', () => {
    expect(isKycStepComplete(1, emptyKycDraft())).toBe(false);
  });

  it('step 1 completes when identity fields are filled', () => {
    const d = { ...emptyKycDraft(), fullName: 'Ananya Rao', aadhaar: '234567890123', pan: 'ABCDE1234F' };
    expect(isKycStepComplete(1, d)).toBe(true);
  });

  it('step 2 requires employment type and income range', () => {
    expect(isKycStepComplete(2, emptyKycDraft())).toBe(false);
    const d = { ...emptyKycDraft(), employmentType: 'salaried' as const, incomeRange: '25k-50k' as const, employer: 'Acme Corp' };
    expect(isKycStepComplete(2, d)).toBe(true);
  });

  it('step 2 does not require an employer for students', () => {
    const d = { ...emptyKycDraft(), employmentType: 'student' as const, incomeRange: '<25k' as const };
    expect(isKycStepComplete(2, d)).toBe(true);
  });

  it('step 2 requires an employer for non-students', () => {
    const d = { ...emptyKycDraft(), employmentType: 'salaried' as const, incomeRange: '25k-50k' as const };
    expect(isKycStepComplete(2, d)).toBe(false);
  });

  it('step 3 (review) is always complete', () => {
    expect(isKycStepComplete(3, emptyKycDraft())).toBe(true);
  });
});
