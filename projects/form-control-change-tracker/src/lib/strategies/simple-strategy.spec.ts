import { SimpleStrategy } from './simple-strategy';

describe('SimpleStrategy', () => {
  let strategy: SimpleStrategy;

  beforeEach(() => {
    strategy = new SimpleStrategy();
  });

  it('should return true for identical primitives', () => {
    expect(strategy.isEqual(1, 1)).toBeTrue();
  });

  it('should return false for different primitives', () => {
    expect(strategy.isEqual(1, 2)).toBeFalse();
  });

  it('should return true for identical objects (order sensitive)', () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { a: 1, b: 2 };
    expect(strategy.isEqual(obj1, obj2)).toBeTrue();
  });

  // Optimized strategy should be order-insensitive
  it('should return TRUE for objects with different property order', () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { b: 2, a: 1 };
    expect(strategy.isEqual(obj1, obj2)).toBeTrue();
  });

  it('should return false for different objects', () => {
    const obj1 = { a: 1 };
    const obj2 = { a: 2 };
    expect(strategy.isEqual(obj1, obj2)).toBeFalse();
  });
});
