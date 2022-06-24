import { prepend0x } from './prepend-0x';

test('Prepends strings with 0x', () => {
  expect(prepend0x('abc')).toEqual('0xabc');
  expect(prepend0x('123456789')).toEqual('0x123456789');
});
