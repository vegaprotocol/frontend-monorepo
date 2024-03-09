import { validEthAddress, validVegaPublicKey, validStep } from './common';

it('validEthAddress', () => {
  const validAddress = '0x72c22822A19D20DE7e426fB84aa047399Ddd8853';
  expect(validEthAddress(validAddress)).toEqual(true);

  const invalidChars = '0xzzc22822A19D20DE7e426fB84aa047399Ddd8853';
  expect(validEthAddress(invalidChars)).toEqual(false);

  const tooManyChars = '0x72c22822A19D20DE7e426fB84aa047399Ddd88531111111';
  expect(validEthAddress(tooManyChars)).toEqual(false);

  const no0x = '1x72c22822A19D20DE7e426fB84aa047399Ddd8853';
  expect(validEthAddress(no0x)).toEqual(false);
});

it('validVegaPublicKey', () => {
  const validKey =
    '70d14a321e02e71992fd115563df765000ccc4775cbe71a0e2f9ff5a3b9dc680';
  expect(validVegaPublicKey(validKey)).toEqual(true);

  const invalidChars =
    'zzz14a321e02e71992fd115563df765000ccc4775cbe71a0e2f9ff5a3b9dc680';
  expect(validVegaPublicKey(invalidChars)).toEqual(false);

  const tooManyChars =
    '70d14a321e02e71992fd115563df765000ccc4775cbe71a0e2f9ff5a3b9dc680111111';
  expect(validVegaPublicKey(tooManyChars)).toEqual(false);
});

describe('validateAgainstStep', () => {
  it('fails when step is an empty string', () => {
    expect(validStep('', '1234')).toEqual(false);
  });

  it.each([
    [0, 0],
    [1234567890, 0],
    [0.03, 0.03],
    [0.09, 0.03],
    [0.27, 0.03],
    [1, 1],
    [123, 1],
    [4, 2],
    [8, 2],
  ])(
    'checks whether given value (%s) IS a multiple of given step (%s)',
    (value, step) => {
      expect(validStep(step, value)).toEqual(true);
    }
  );

  it.each([
    [1, 2],
    [0.1, 0.003],
    [1.11, 0.1],
    [123.1, 1],
    [222, 221],
    [NaN, 1],
  ])(
    'checks whether given value (%s) IS NOT a multiple of given step (%s)',
    (value, step) => {
      expect(validStep(step, value)).toEqual(false);
    }
  );
});
