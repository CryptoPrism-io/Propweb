import type { Furnishing, TenantType } from './types';

export interface ListingDraft {
  title: string;
  bhk: number;
  locality: string;
  rent: string;
  deposit: string;
  areaSqft: string;
  furnishing: Furnishing | '';
  tenantType: TenantType | '';
  photos: string[];
  amenities: string[];
  moveInDate: string;
}

export type WizardStep = 1 | 2 | 3 | 4;

export function emptyDraft(): ListingDraft {
  return {
    title: '', bhk: 0, locality: '', rent: '', deposit: '', areaSqft: '',
    furnishing: '', tenantType: '', photos: [], amenities: [], moveInDate: '',
  };
}

export function isStepComplete(step: WizardStep, d: ListingDraft): boolean {
  switch (step) {
    case 1:
      return d.bhk > 0 && d.locality !== '' && d.rent !== '' && d.areaSqft !== '' &&
        d.furnishing !== '' && d.tenantType !== '';
    case 2:
      return d.photos.length > 0;
    case 3:
      return d.moveInDate !== '';
    case 4:
      return true;
  }
}
