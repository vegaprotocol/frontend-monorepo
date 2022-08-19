import { prepend0x } from './prepend-0x';

describe('prepend0x', () => {
  it.each([
    { input: 'ABC123', output: '0xABC123' },
    { input: '0XABC123', output: '0x0XABC123' },
    { input: '0xABC123', output: '0xABC123' },
  ])('prepends strings with 0x only if needed', ({ input, output }) => {
    expect(prepend0x(input)).toBe(output);
  });
});
