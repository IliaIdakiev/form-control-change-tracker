import { Diff, diff } from 'deep-diff';

function hasNoChanges(diff: Diff<any, any>[] | undefined) {
  return !diff;
}

export function comparer(initialValue: any, currentValue: any): boolean {
  const differences = diff(initialValue, currentValue);
  return hasNoChanges(differences);
}
