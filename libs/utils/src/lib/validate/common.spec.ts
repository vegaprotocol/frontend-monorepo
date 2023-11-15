import { renderHook } from '@testing-library/react';
import { useEthereumAddress, useVegaPublicKey } from './common';

it('ethereumAddress', () => {
  const result = renderHook(useEthereumAddress);
  const ethereumAddress = result.result.current;

  const errorMessage = 'Invalid Ethereum address';

  const validAddress = '0x72c22822A19D20DE7e426fB84aa047399Ddd8853';
  expect(ethereumAddress(validAddress)).toEqual(true);

  const invalidChars = '0xzzc22822A19D20DE7e426fB84aa047399Ddd8853';
  expect(ethereumAddress(invalidChars)).toEqual(errorMessage);

  const tooManyChars = '0x72c22822A19D20DE7e426fB84aa047399Ddd88531111111';
  expect(ethereumAddress(tooManyChars)).toEqual(errorMessage);

  const no0x = '1x72c22822A19D20DE7e426fB84aa047399Ddd8853';
  expect(ethereumAddress(no0x)).toEqual(errorMessage);
});

it('vegaPublicKey', () => {
  const result = renderHook(useVegaPublicKey);
  const vegaPublicKey = result.result.current;

  const errorMessage = 'Invalid Vega key';

  const validKey =
    '70d14a321e02e71992fd115563df765000ccc4775cbe71a0e2f9ff5a3b9dc680';
  expect(vegaPublicKey(validKey)).toEqual(true);

  const invalidChars =
    'zzz14a321e02e71992fd115563df765000ccc4775cbe71a0e2f9ff5a3b9dc680';
  expect(vegaPublicKey(invalidChars)).toEqual(errorMessage);

  const tooManyChars =
    '70d14a321e02e71992fd115563df765000ccc4775cbe71a0e2f9ff5a3b9dc680111111';
  expect(vegaPublicKey(tooManyChars)).toEqual(errorMessage);
});
