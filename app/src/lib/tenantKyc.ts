export type EmploymentType = 'salaried' | 'self-employed' | 'student' | '';
export type IncomeRange = '<25k' | '25k-50k' | '50k-1l' | '>1l' | '';

export interface TenantKycDraft {
  fullName: string;
  aadhaar: string;
  pan: string;
  employmentType: EmploymentType;
  employer: string;
  incomeRange: IncomeRange;
}

export type KycStep = 1 | 2 | 3;

export function emptyKycDraft(): TenantKycDraft {
  return { fullName: '', aadhaar: '', pan: '', employmentType: '', employer: '', incomeRange: '' };
}

export function isKycStepComplete(step: KycStep, d: TenantKycDraft): boolean {
  switch (step) {
    case 1:
      return d.fullName !== '' && d.aadhaar !== '' && d.pan !== '';
    case 2:
      return d.employmentType !== '' && d.incomeRange !== '' &&
        (d.employmentType === 'student' || d.employer !== '');
    case 3:
      return true;
  }
}
