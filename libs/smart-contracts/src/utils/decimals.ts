import BigNumber from 'bignumber.js';

BigNumber.config({ EXPONENTIAL_AT: 20000 });

export function addDecimal(value: BigNumber, decimals: number): BigNumber {
  return value.dividedBy(Math.pow(10, decimals)).decimalPlaces(decimals);
}
export function removeDecimal(value: BigNumber, decimals: number): BigNumber {
  return value.times(Math.pow(10, decimals));
}
