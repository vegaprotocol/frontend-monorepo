import { BigNumber } from './bignumber';
import { getAbbreviatedNumber } from './abbreviate-number';

it('For numbers less than 1000, do nothing', () => {
  expect(getAbbreviatedNumber(new BigNumber('1'))).toStrictEqual('1');
  expect(getAbbreviatedNumber(new BigNumber('10'))).toStrictEqual('10');
  expect(getAbbreviatedNumber(new BigNumber('33'))).toStrictEqual('33');
  expect(getAbbreviatedNumber(new BigNumber('100'))).toStrictEqual('100');
  expect(getAbbreviatedNumber(new BigNumber('999'))).toStrictEqual('999');
});

it('For numbers equal to or greater than 1000, abbreviate with a K', () => {
  expect(getAbbreviatedNumber(new BigNumber('1000'))).toStrictEqual('1K');
  expect(getAbbreviatedNumber(new BigNumber('3333'))).toStrictEqual('3.3K');
  expect(getAbbreviatedNumber(new BigNumber('33333'))).toStrictEqual('33.3K');
  expect(getAbbreviatedNumber(new BigNumber('999999'))).toStrictEqual('1M');
});

it('For numbers equal to or greater than 1,000,000, abbreviate with a M', () => {
  expect(getAbbreviatedNumber(new BigNumber('1000000'))).toStrictEqual('1M');
  expect(getAbbreviatedNumber(new BigNumber('10000000'))).toStrictEqual('10M');
  expect(getAbbreviatedNumber(new BigNumber('100000000'))).toStrictEqual(
    '100M'
  );
  expect(getAbbreviatedNumber(new BigNumber('100000000000'))).toStrictEqual(
    '100B'
  );
  expect(getAbbreviatedNumber(new BigNumber('1000000000000000'))).toStrictEqual(
    '1000T'
  );
});

it('Handles MAX_SAFE_INTEGER as expected', () => {
  const massiveNumberAsString = `${Number.MAX_SAFE_INTEGER + 1}`;
  const enormousNumberAsString = `${Number.MAX_SAFE_INTEGER + 2}`;
  const giganticNumberAsString = `${Number.MAX_SAFE_INTEGER}9999`;
  expect(
    getAbbreviatedNumber(new BigNumber(massiveNumberAsString))
  ).toStrictEqual('9007.2T');
  expect(
    getAbbreviatedNumber(new BigNumber(enormousNumberAsString))
  ).toStrictEqual('9007.2T');
  expect(
    getAbbreviatedNumber(new BigNumber(giganticNumberAsString))
  ).toStrictEqual('90,071,992.5T');
});
