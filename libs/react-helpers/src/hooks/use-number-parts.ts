import { useMemo } from 'react';
import type { BigNumber } from 'bignumber.js';
import { toNumberParts } from '@vegaprotocol/utils';

export const useNumberParts = (
  value: BigNumber | null | undefined,
  decimals: number
): [integers: string, decimalPlaces: string] => {
  return useMemo(() => toNumberParts(value, decimals), [decimals, value]);
};
