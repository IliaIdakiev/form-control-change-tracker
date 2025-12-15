import { ComparisonStrategy } from './comparison-strategy';
import { Injectable } from '@angular/core';

@Injectable()
export class SimpleStrategy implements ComparisonStrategy {
  isEqual(a: any, b: any): boolean {
    // 1. Fast reference equality check
    if (a === b) {
      return true;
    }

    // 2. Null/Undefined check
    if (a === null || a === undefined || b === null || b === undefined) {
      return a === b;
    }

    // 3. Types must match
    if (a.constructor !== b.constructor) {
      return false;
    }

    // 4. Date
    if (a instanceof Date) {
      return a.getTime() === b.getTime();
    }

    // 5. RegExp
    if (a instanceof RegExp) {
      return a.source === b.source && a.flags === b.flags;
    }

    // 6. Array
    if (Array.isArray(a)) {
      if (a.length !== b.length) {
        return false;
      }
      for (let i = 0; i < a.length; i++) {
        if (!this.isEqual(a[i], b[i])) {
          return false;
        }
      }
      return true;
    }

    // 7. Objects
    if (typeof a === 'object') {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);

      if (keysA.length !== keysB.length) {
        return false;
      }

      for (const key of keysA) {
        if (
          !Object.prototype.hasOwnProperty.call(b, key) ||
          !this.isEqual(a[key], b[key])
        ) {
          return false;
        }
      }
      return true;
    }

    // 8. Primitives (should have been caught by === check, but fallback)
    return false;
  }
}
