import { useMemo } from 'react';
import { BigNumber } from 'bignumber.js';
import {
  getUserLocale,
  toNumberParts,
  formatNumber,
} from '@vegaprotocol/utils';

export const useNumberParts = (
  value: BigNumber | null | undefined,
  decimals: number
): [integers: string, decimalPlaces: string] => {
  return useMemo(() => toNumberParts(value, decimals), [decimals, value]);
};

const INFINITY = '∞';
const DEFAULT_COMPACT_ABOVE = 1_000_000;
const DEFAULT_COMPACT_CAP = new BigNumber(1e24);
/**
 * Compacts given number to human readable format.
 * @param number
 * @param decimals Number of decimal places
 * @param compactDisplay Display mode; short -> 1e6 == 1M; ling -> 1e6 1 million
 * @param compactAbove Compact number above threshold
 * @param cap Use scientific notation above threshold
 */
export const compactNumber = (
  number: BigNumber,
  decimals: number | 'infer' = 'infer',
  compactDisplay: 'short' | 'long' = 'short',
  compactAbove = DEFAULT_COMPACT_ABOVE,
  cap = DEFAULT_COMPACT_CAP
) => {
  if (!number.isFinite()) return `${number.isNegative() ? '-' : ''}${INFINITY}`;

  const decimalPlaces =
    (decimals === 'infer' ? number.decimalPlaces() : decimals) || 0;

  if (number.isLessThan(DEFAULT_COMPACT_ABOVE)) {
    return formatNumber(number, decimalPlaces);
  }

  /**
   * Note: it compacts number up to 1_000_000_000_000 (1e12) -> 1T, all above is formatted as iteration of T.
   * Example: 1.579208923731619e59 -> 157,920,892,373,161,900,000,000,000,000,000,000,000,000,000,000T
   */
  const compactNumFormat = new Intl.NumberFormat(getUserLocale(), {
    minimumFractionDigits: Math.max(0, decimalPlaces),
    maximumFractionDigits: Math.max(0, decimalPlaces),
    notation: 'compact',
    compactDisplay,
  });
  const scientificNumFormat = new Intl.NumberFormat(getUserLocale(), {
    minimumFractionDigits: Math.max(0, decimalPlaces),
    maximumFractionDigits: Math.max(0, decimalPlaces),
    notation: 'scientific',
  });

  if (number.isGreaterThan(DEFAULT_COMPACT_CAP)) {
    const r = /E(\d+)$/i;
    const formatted = scientificNumFormat.format(Number(number));
    const eNotation = formatted.match(r);
    if (eNotation && eNotation.length > 1) {
      const power = eNotation[1];
      return (
        <span>
          {formatted.replace(r, '')}{' '}
          <span>
            &times; 10
            <sup>{power}</sup>
          </span>
        </span>
      );
    }
  }

  return compactNumFormat.format(Number(number));
};
