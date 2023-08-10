import { Manager } from '../src';

describe('Manager', () => {

  let ecsManager: Manager;

  beforeEach(() => {
    ecsManager = new Manager();
  });

  it('should be self', () => {
    expect(ecsManager).toBeInstanceOf(Manager);
  });
});
