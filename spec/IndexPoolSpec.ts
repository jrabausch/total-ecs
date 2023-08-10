import { IndexPool } from '../src';

describe('Manager', () => {

  let indexPool: IndexPool;

  beforeEach(() => {
    indexPool = new IndexPool();
  });

  it('should be self', () => {
    expect(indexPool).toBeInstanceOf(IndexPool);
  });
});
