import { ComparisonStrategy } from 'form-control-change-tracker';
import { Injectable } from '@angular/core';
import { diff } from 'deep-diff';

@Injectable()
export class DeepDiffStrategy implements ComparisonStrategy {
  isEqual(a: any, b: any): boolean {
    const differences = diff(a, b);
    return !differences;
  }
}
