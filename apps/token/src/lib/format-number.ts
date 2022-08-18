import React from 'react';
import { BigNumber } from './bignumber';

export const formatNumber = (value: BigNumber, decimals?: number) => {
  const decimalPlaces =
    typeof decimals === 'undefined' ? Math.max(value.dp(), 2) : decimals;
  return value.dp(decimalPlaces).toFormat(decimalPlaces);
};

export const formatNumberPercentage = (value: BigNumber, decimals?: number) =>
  `${formatNumber(value, decimals)}%`;

export const toNumberParts = (
  value: BigNumber | null | undefined,
  decimals = 18
): [integers: string, decimalPlaces: string] => {
  if (!value) {
    return ['0', '0'.repeat(decimals)];
  }
  // @ts-ignore confident not undefined
  const separator = BigNumber.config().FORMAT.decimalSeparator as string;
  const [integers, decimalsPlaces] = formatNumber(value, decimals)
    .toString()
    .split(separator);
  return [integers, decimalsPlaces || ''];
};

export const useNumberParts = (
  value: BigNumber | null | undefined,
  decimals: number
): [integers: string, decimalPlaces: string] => {
  return React.useMemo(() => toNumberParts(value, decimals), [decimals, value]);
};
