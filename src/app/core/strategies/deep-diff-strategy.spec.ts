import { DeepDiffStrategy } from './deep-diff-strategy';

describe('DeepDiffStrategy', () => {
  let strategy: DeepDiffStrategy;

  beforeEach(() => {
    strategy = new DeepDiffStrategy();
  });

  it('should return true for identical primitives', () => {
    expect(strategy.isEqual(1, 1)).toBeTrue();
    expect(strategy.isEqual('a', 'a')).toBeTrue();
    expect(strategy.isEqual(true, true)).toBeTrue();
  });

  it('should return false for different primitives', () => {
    expect(strategy.isEqual(1, 2)).toBeFalse();
    expect(strategy.isEqual('a', 'b')).toBeFalse();
    expect(strategy.isEqual(true, false)).toBeFalse();
  });

  it('should return true for identical objects', () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { a: 1, b: { c: 2 } };
    expect(strategy.isEqual(obj1, obj2)).toBeTrue();
  });

  it('should return false for different objects', () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { a: 1, b: { c: 3 } };
    expect(strategy.isEqual(obj1, obj2)).toBeFalse();
  });

  it('should return true for identical arrays', () => {
    const arr1 = [1, { a: 2 }];
    const arr2 = [1, { a: 2 }];
    expect(strategy.isEqual(arr1, arr2)).toBeTrue();
  });

  it('should return false for different arrays', () => {
    const arr1 = [1, { a: 2 }];
    const arr2 = [1, { a: 3 }];
    expect(strategy.isEqual(arr1, arr2)).toBeFalse();
  });
});
