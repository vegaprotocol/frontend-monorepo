import { prepend0x, prepend0xIfNeeded, remove0x } from './prepend-0x';

describe('prepend0x and prepend0xIfNeeded', () => {
  it('prepends strings with 0x', () => {
    expect(prepend0x('abc')).toEqual('0xabc');
    expect(prepend0x('123456789')).toEqual('0x123456789');
  });

  it.each([
    { input: 'ABC123', output: '0xABC123' },
    { input: '0XABC123', output: '0x0XABC123' },
    { input: '0xABC123', output: '0xABC123' },
  ])('prepends strings with 0x only if needed', ({ input, output }) => {
    expect(prepend0xIfNeeded(input)).toBe(output);
  });
});
