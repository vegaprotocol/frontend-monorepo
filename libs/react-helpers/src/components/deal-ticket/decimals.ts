import { BigNumber } from 'bignumber.js';

export function addDecimal(value: string, decimals: number): string {
  if (!decimals) return value;
  return new BigNumber(value || 0)
    .dividedBy(Math.pow(10, decimals))
    .toFixed(decimals);
}
export function removeDecimal(value: string, decimals: number): string {
  if (!decimals) return value;
  return new BigNumber(value || 0).times(Math.pow(10, decimals)).toFixed(0);
}
