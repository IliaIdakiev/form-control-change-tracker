import { InjectionToken } from '@angular/core';

export interface ComparisonStrategy {
  isEqual(a: any, b: any): boolean;
}

export const HG_COMPARISON_STRATEGY = new InjectionToken<ComparisonStrategy>(
  'HG_COMPARISON_STRATEGY'
);
