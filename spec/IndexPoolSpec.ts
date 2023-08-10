import { IndexPool } from '../src';

describe('IndexPool', () => {

  let indexPool: IndexPool;

  beforeEach(() => {
    indexPool = new IndexPool();
  });

  it('should be self', () => {
    expect(indexPool).toBeInstanceOf(IndexPool);
  });

  it('should produce indexes', () => {
    expect(indexPool.get()).toBe(0);
    expect(indexPool.get()).toBe(1);
    expect(indexPool.get()).toBe(2);
    expect(indexPool.get()).toBe(3);
    expect(indexPool.get()).toBe(4);
    expect(indexPool.get()).toBe(5);
  });

  it('should free indexes', () => {
    expect(indexPool.get()).toBe(0);
    expect(indexPool.get()).toBe(1);
    expect(indexPool.get()).toBe(2);

    indexPool.free(2);
    expect(indexPool.get()).toBe(2);

    indexPool.free(0);
    expect(indexPool.get()).toBe(0);

    expect(indexPool.get()).toBe(3);

    indexPool.free(1);
    expect(indexPool.get()).toBe(1);
  });

  it('should provide pool size', () => {
    expect(indexPool.size).toBe(0);

    const i0 = indexPool.get();
    const i1 = indexPool.get();

    expect(indexPool.size).toBe(2);

    indexPool.free(i0);
    indexPool.free(i1);

    expect(indexPool.size).toBe(2);

    indexPool.get();

    expect(indexPool.size).toBe(2);
  });

  it('should always return smallest index', () => {

    const i0 = indexPool.get();
    const i1 = indexPool.get();
    const i2 = indexPool.get();

    expect(i2).toBe(2);

    indexPool.free(i2);

    expect(indexPool.get()).toBe(i2);

    indexPool.free(i0);
    indexPool.free(i2);
    indexPool.free(i1);

    expect(indexPool.get()).toBe(0);
    expect(indexPool.get()).toBe(1);
  });
});
