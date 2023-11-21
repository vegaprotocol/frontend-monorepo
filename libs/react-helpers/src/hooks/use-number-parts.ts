import { useMemo } from 'react';
import type { BigNumber } from 'bignumber.js';
import { toNumberParts } from '@vegaprotocol/utils';

export const useNumberParts = (
  value: BigNumber | null | undefined
): [integers: string, decimalPlaces: string, separator: string | undefined] => {
  return useMemo(() => toNumberParts(value), [value]);
};
