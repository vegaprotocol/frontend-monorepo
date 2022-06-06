import { hexadecimalify } from './hexadecimalify';

test('Prepends strings with 0x', () => {
  expect(hexadecimalify('abc')).toEqual('0xabc');
  expect(hexadecimalify('123456789')).toEqual('0x123456789');
});
