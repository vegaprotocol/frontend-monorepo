import pow from '../src/pow.js';
import inprocess from '../src/pow/in-process.js';

describe('pow', () => {
  it('should be able to solve a puzzle', async () => {
    const solution = await pow({
      difficulty: 1,
      blockHash:
        'A00000000000000000000000000000000000000000000000000000000000000F',
      tid: 'A00000000000000000000000000000000000000000000000000000000000000F',
    });

    expect(solution).toHaveProperty('nonce');
    expect(solution).toHaveProperty('tid');
    expect(solution).toHaveProperty('hashFunction');
  });

  it('in-process solver should always be available', async () => {
    const solver = await inprocess();
    expect(solver).not.toBe(false);
    expect(typeof solver).toBe('function');
  });
});
