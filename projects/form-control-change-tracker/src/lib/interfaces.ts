export interface ChangesWithValues<T = any> {
  hasChanges: boolean;
  values: { [P in keyof T]: { current: T[P], initial: T[P] } };
}
