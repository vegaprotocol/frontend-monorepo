import { remove0x } from './remove-0x';

it('Removes 0x from the start of a transaction hash', () => {
  const randomEthereumTx =
    '0xfc1fe28cb9cb255c93beaa6ceb3313d41ba17475489e0874fc46d64376d60088';
  const res = remove0x(randomEthereumTx);

  expect(res).toStrictEqual(
    'fc1fe28cb9cb255c93beaa6ceb3313d41ba17475489e0874fc46d64376d60088'
  );
});

it('Does not check if the string is valid hex', () => {
  const invalidData = '**Not-Hex-At-All!!**';
  const res = remove0x(`0x${invalidData}`);

  expect(res).toStrictEqual(invalidData);
});

it('Does not remove 0x in the middle of the string', () => {
  const unprefixedString = 'test-0x-test';
  const res = remove0x(unprefixedString);

  expect(res).toStrictEqual(unprefixedString);
});

it('Does not remove all 0xs, just one at the start', () => {
  const weirdString = '0x0x0x';
  const res = remove0x(weirdString);

  expect(res).toStrictEqual('0x0x');
});

it('Handles non strings by returning them untouched', () => {
  const res = remove0x(NaN as unknown as string);

  expect(res).toStrictEqual(NaN);
});
