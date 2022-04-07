import { BigNumber } from "../lib/bignumber";

export function addDecimal(value: BigNumber, decimals: number): string {
  return value
    .dividedBy(Math.pow(10, decimals))
    .decimalPlaces(decimals)
    .toString();
}
export function removeDecimal(value: BigNumber, decimals: number): string {
  return value.times(Math.pow(10, decimals)).toFixed(0);
}
