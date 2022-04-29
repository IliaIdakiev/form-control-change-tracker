import { Diff, diff } from 'deep-diff';

function hasNoChanges(diff: Diff<any, any>[] | undefined) {
  return !diff;
}

export function comparer(initialValue: any, currentValue: any): boolean {
  if (Array.isArray(initialValue)) {
    for (let i = 0; i < initialValue.length; i++) {
      const currentInitialValue = initialValue[i];
      const differences = diff(currentInitialValue, currentValue);
      if (hasNoChanges(differences)) { return true; }
    }
    return false;
  }
  const differences = diff(initialValue, currentValue);
  return hasNoChanges(differences);
}
